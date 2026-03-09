import glob
import os
import shutil
import subprocess
from typing import Optional

import edge_tts
import yt_dlp
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from openai import OpenAI

# ── OpenAI client configuration ──────────────────────────────────────────────
client = OpenAI(
    api_key="",
    base_url="",  # e.g. "https://api.openai.com/v1"
)

# ── FastAPI app ──────────────────────────────────────────────────────────────
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("output", exist_ok=True)
app.mount("/output", StaticFiles(directory="output"), name="output")

# ── Edge-TTS voice mappings ──────────────────────────────────────────────────
VOICE_MAP = {
    "Hindi": "hi-IN-MadhurNeural",
    "Tamil": "ta-IN-ValluvarNeural",
    "Telugu": "te-IN-MohanNeural",
    "Malayalam": "ml-IN-MidhunNeural",
    "Kannada": "kn-IN-GaganNeural",
    "Chinese": "zh-CN-YunxiNeural",
    "Arabic": "ar-SA-HamedNeural",
    "French": "fr-FR-HenriNeural",
    "Russian": "ru-RU-DmitryNeural",
}


# ── Helper functions ─────────────────────────────────────────────────────────
def extract_audio_from_video(input_path: str, output_path: str) -> None:
    """Use FFmpeg to extract/convert audio from a media file."""
    subprocess.run(
        [
            "ffmpeg", "-y",
            "-i", input_path,
            output_path,
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True,
    )


def preprocess_reference_audio(input_path: str, output_path: str) -> None:
    """Clean and normalize reference audio for voice cloning via FFmpeg."""
    subprocess.run(
        [
            "ffmpeg", "-y",
            "-i", input_path,
            "-ar", "22050",
            "-ac", "1",
            "-af",
            "highpass=f=60,lowpass=f=11000,afftdn=nf=-20,"
            "loudnorm=I=-16:TP=-1.5:LRA=11,"
            "silenceremove=start_periods=1:start_duration=0.5:start_threshold=-35dB",
            "-t", "30",
            output_path,
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True,
    )


def download_youtube_audio(url: str, output_path_without_ext: str) -> str:
    """Download the best audio from a YouTube URL and convert to MP3."""
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": output_path_without_ext + ".%(ext)s",
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }
        ],
        "quiet": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    return output_path_without_ext + ".mp3"


# ── Main API route ───────────────────────────────────────────────────────────
@app.post("/api/generate")
async def generate(
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None),
    target_language: str = Form(...),
    mode: str = Form(...),
):
    mp3_path: str = os.path.join("output", "whisper_input.mp3")
    wav_path: str = os.path.join("output", "reference.wav")

    try:
        # ── Cleanup: clear output folder ─────────────────────────────────
        for f in glob.glob(os.path.join("output", "*")):
            os.remove(f)

        # ── Input routing ────────────────────────────────────────────────
        if url:
            # Download YouTube audio → MP3
            yt_output_base = os.path.join("output", "yt_audio")
            download_youtube_audio(url, yt_output_base)
            yt_mp3 = os.path.join("output", "yt_audio.mp3")
            # Convert to whisper_input.mp3
            extract_audio_from_video(yt_mp3, mp3_path)
            # Convert to reference.wav for cloning
            extract_audio_from_video(yt_mp3, wav_path)

        elif file:
            # Save uploaded file with static name
            ext = os.path.splitext(file.filename)[1]
            raw_path = os.path.join("output", f"raw_upload{ext}")
            with open(raw_path, "wb") as f:
                shutil.copyfileobj(file.file, f)

            # Create compressed MP3 for Whisper transcription
            extract_audio_from_video(raw_path, mp3_path)

            # Create clean WAV for future cloning reference
            extract_audio_from_video(raw_path, wav_path)
        else:
            raise HTTPException(
                status_code=400,
                detail="Either a file upload or a URL must be provided.",
            )

        # ── Transcription via OpenAI Whisper API ─────────────────────────
        with open(mp3_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
            )
        original_text = transcription.text

        # ── Translation via LLM ──────────────────────────────────────────
        translation_response = client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"You are a professional translator. Translate the user's English text into {target_language}.\n"
                        f"ABSOLUTE RULES:\n"
                        f"1. SINGLE SCRIPT ONLY: Every single character in your output MUST be in the {target_language} script. "
                        f"Do NOT mix Latin/English letters with {target_language} characters under any circumstances.\n"
                        f"2. TRANSLITERATE ALL ENGLISH TERMS: Technical terms like 'Artificial Intelligence', 'Machine Learning', "
                        f"'Electronics', 'Communication Engineering', brand names, and acronyms MUST be fully transliterated "
                        f"into the {target_language} script. For example, 'Artificial Intelligence' in Tamil must be written as "
                        f"'ஆர்டிஃபிஷியல் இன்டெலிஜென்ஸ்', NOT as 'Artificial Intelligence' or 'கArtificial Intelligence'.\n"
                        f"3. TRANSLITERATE PROPER NOUNS: Names of people and places must be spelled entirely in the {target_language} script.\n"
                        f"4. NATURAL FLOW: Translate for meaning and natural conversational flow, not word-for-word.\n"
                        f"5. NO ADDITIONS: Do not add content that is not in the source text.\n"
                        f"6. OUTPUT: Return ONLY the translated text. No explanations, no quotes, no commentary."
                    ),
                },
                {"role": "user", "content": original_text},
            ],
        )
        raw_translation = translation_response.choices[0].message.content.strip()
        translated_text = raw_translation.encode('utf-8', 'ignore').decode('utf-8')

        # ── Base TTS via Edge-TTS ────────────────────────────────────────
        selected_voice = VOICE_MAP.get(target_language, "en-US-ChristopherNeural")
        tts_output_path = os.path.join("output", "base_tts.wav")
        communicate = edge_tts.Communicate(translated_text, selected_voice)
        await communicate.save(tts_output_path)

        # ── Voice Cloning via OpenVoice (zero-shot mode) ─────────────────
        audio_url = "http://localhost:8000/output/base_tts.wav"
        if mode == "zero-shot":
            clean_ref_path = os.path.join("output", "clean_reference.wav")
            cloned_output_path = os.path.join("output", "final_cloned_voice.wav")
            preprocess_reference_audio(wav_path, clean_ref_path)

            openvoice_python = os.path.join("openvoice_env", "Scripts", "python.exe")
            result = subprocess.run(
                [
                    openvoice_python, "run_openvoice.py",
                    "--base", tts_output_path,
                    "--ref", clean_ref_path,
                    "--out", cloned_output_path,
                ],
            )
            if result.returncode == 0:
                audio_url = "http://localhost:8000/output/final_cloned_voice.wav"
            else:
                print(f"[WARNING] Voice cloning failed (exit {result.returncode}), falling back to base TTS")

        return {
            "status": "success",
            "original_text": original_text,
            "translated_text": translated_text,
            "audio_url": audio_url,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
