# Multilingual Voice Cloning AI

A full-stack project for multilingual speech processing and voice generation.

The app lets users upload audio/video or provide a YouTube URL, transcribes speech, translates text into a target language, generates speech with TTS, and optionally performs zero-shot voice cloning.

## Project Overview

This repository combines:

- A modern React frontend for interaction and visualization.
- A Python FastAPI backend for AI/audio processing.
- OpenVoice-based tone color conversion for voice cloning.
- Netlify function scaffolding for serverless deployment paths.

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite 7
- React Router 6
- Tailwind CSS 3
- Radix UI components
- Framer Motion animations
- Lucide React icons
- TanStack Query

### Backend (AI/Audio)

- Python 3
- FastAPI + Uvicorn
- OpenAI APIs
  - Whisper (`whisper-1`) for transcription
  - Chat Completions (`gpt-4.1-nano`) for translation
- edge-tts for multilingual TTS voices
- OpenVoice for zero-shot voice cloning
- FFmpeg for media conversion and preprocessing
- yt-dlp for YouTube audio extraction
- fpdf2 + python-docx for transcript export

### Tooling and Platform

- PNPM (preferred package manager)
- Vitest for testing
- Netlify config and serverless function entry

## Project Structure

```text
.
|-- client/                         # Frontend React SPA
|   |-- App.tsx                     # App shell + routes
|   |-- main.tsx                    # React app entry
|   |-- global.css                  # Global styles and Tailwind utilities
|   |-- pages/
|   |   |-- Login.tsx               # Login screen UI
|   |   |-- Index.tsx               # Main workflow UI (upload -> process -> output)
|   |   \-- NotFound.tsx            # Fallback route
|   |-- components/
|   |   |-- TranscriptSection.tsx   # Transcript viewing/copy/download UI
|   |   \-- ui/                     # Radix-based reusable UI components
|   |-- hooks/                      # Client hooks
|   \-- lib/                        # Utility functions + tests
|
|-- python_backend/                 # AI/audio backend
|   |-- main.py                     # FastAPI app + core processing endpoints
|   |-- run_openvoice.py            # OpenVoice cloning runner
|   |-- requirements.txt            # Main backend dependencies
|   |-- requirements-openvoice.txt  # OpenVoice environment dependencies
|   |-- openvoice/                  # OpenVoice model/runtime code
|   |-- weights/                    # Model checkpoints
|   |-- output/                     # Generated media/transcripts
|   \-- *_env/                      # Local Python virtual environments
|
|-- netlify/
|   \-- functions/
|       \-- api.ts                  # Serverless function entry point
|
|-- public/                         # Static assets
|-- package.json                    # Frontend scripts and JS dependencies
|-- vite.config.ts                  # Vite frontend config
\-- netlify.toml                    # Netlify build/deploy config
```

## Available Features

### Input and Media Handling

- Accepts a YouTube URL as source input.
- Accepts uploaded audio files.
- Accepts uploaded video files.
- Converts source media to standardized audio formats for processing.

### AI Speech Pipeline

- Automatic speech transcription using Whisper.
- Translation of transcribed text into selected target language.
- Multilingual TTS generation using language-specific voices.
- Optional zero-shot voice cloning using OpenVoice.
- Audio preprocessing for cleaner cloning reference.

### Frontend Experience

- Animated, multi-section UI workflow.
- Simulated pipeline-step progress visualization.
- Login screen and route-based navigation.
- Playback controls for generated audio.
- One-click download of generated audio output.

### Transcript Utilities

- Displays both original transcript and translated transcript.
- Copy-to-clipboard support for both transcript versions.
- Download transcripts as PDF or DOCX.
- Unicode-aware export handling (including Tamil-oriented font handling).

## API Endpoints

### `POST /api/generate`

Accepts form data and returns generated output:

- Inputs:
  - `file` (optional upload)
  - `url` (optional YouTube URL)
  - `target_language` (required)
  - `mode` (required, e.g., `zero-shot`)
- Response includes:
  - `original_text`
  - `translated_text`
  - `audio_url`

### `POST /api/download-transcript`

Downloads transcript content in selected format:

- Input JSON:
  - `text`
  - `format` (`pdf` or `docx`)
  - `filename`
- Returns a downloadable file stream.

## Local Development

## 1) Frontend

Install dependencies and run Vite app:

```bash
pnpm install
pnpm dev
```

Frontend runs on:

- `http://localhost:8080`

## 2) Python backend

From `python_backend`, create/activate a virtual environment and install dependencies:

```bash
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Backend runs on:

- `http://localhost:8000`

## 3) OpenVoice cloning setup

For zero-shot cloning, ensure:

- OpenVoice dependencies are installed (see `requirements-openvoice.txt`).
- FFmpeg is installed and available in system PATH.
- Required OpenVoice checkpoints exist in `python_backend/weights/checkpoints_v2`.

## Scripts (Node side)

From project root:

- `pnpm dev` - Start frontend dev server
- `pnpm build` - Build frontend and server artifacts
- `pnpm test` - Run tests
- `pnpm typecheck` - TypeScript checks

## Notes

- The frontend currently calls the Python backend directly at `http://localhost:8000`.
- `main.py` currently contains an inline OpenAI API key assignment; for production, move secrets to environment variables.
