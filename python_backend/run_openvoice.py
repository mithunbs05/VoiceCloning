import argparse
import os
import numpy as np
import torch
import librosa
import soundfile
from openvoice.api import ToneColorConverter


def split_reference_segments(ref_path: str, sr: int = 22050, seg_len: float = 5.0, overlap: float = 2.5) -> list[str]:
    """Split reference audio into overlapping segments for robust SE extraction."""
    audio, _ = librosa.load(ref_path, sr=sr)
    seg_samples = int(seg_len * sr)
    hop_samples = int((seg_len - overlap) * sr)
    segments = []
    start = 0
    idx = 0
    base_dir = os.path.dirname(ref_path)
    while start < len(audio):
        end = start + seg_samples
        chunk = audio[start:end]
        if len(chunk) < sr:  # skip segments shorter than 1 second
            break
        seg_path = os.path.join(base_dir, f"_ref_seg_{idx}.wav")
        soundfile.write(seg_path, chunk, sr)
        segments.append(seg_path)
        idx += 1
        start += hop_samples
    return segments


def main():
    parser = argparse.ArgumentParser(description="OpenVoice tone color cloning")
    parser.add_argument("--base", required=True, help="Path to base TTS audio")
    parser.add_argument("--ref", required=True, help="Path to clean reference audio")
    parser.add_argument("--out", required=True, help="Path to save cloned output")
    parser.add_argument("--tau", type=float, default=0.1, help="Tone color conversion strength (lower=stronger)")
    args = parser.parse_args()

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"[OpenVoice] Using device: {device}, tau: {args.tau}")

    ckpt_converter = "weights/checkpoints_v2/converter"
    converter = ToneColorConverter(
        f"{ckpt_converter}/config.json",
        device=device,
        enable_watermark=False,
    )
    converter.load_ckpt(f"{ckpt_converter}/checkpoint.pth")

    # Split reference into overlapping segments for more robust embedding
    ref_segments = split_reference_segments(args.ref)
    if not ref_segments:
        ref_segments = [args.ref]
    print(f"[OpenVoice] Extracting SE from {len(ref_segments)} reference segment(s)")

    # Extract tone color embeddings from all segments (averaged internally)
    target_se = converter.extract_se(ref_segments)
    source_se = converter.extract_se([args.base])

    # Cleanup temp segment files
    for seg in ref_segments:
        if "_ref_seg_" in seg:
            os.remove(seg)

    # Run voice conversion with lower tau for stronger cloning
    converter.convert(
        audio_src_path=args.base,
        src_se=source_se,
        tgt_se=target_se,
        output_path=args.out,
        tau=args.tau,
    )
    print(f"[OpenVoice] Cloned audio saved to: {args.out}")

if __name__ == "__main__":
    main()
