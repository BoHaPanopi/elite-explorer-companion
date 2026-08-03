from __future__ import annotations

import asyncio
import os
import tempfile
from pathlib import Path

import edge_tts
from flask import Flask, Response, jsonify, request
from flask_cors import CORS

HOST = "127.0.0.1"
PORT = 8765
DEFAULT_VOICE = os.getenv("OGG_VOICE", "de-DE-ConradNeural")

app = Flask(__name__)
CORS(app)


def rate_to_edge(value: float) -> str:
    percent = round((value - 1.0) * 100)
    percent = max(-50, min(50, percent))
    return f"{percent:+d}%"


def volume_to_edge(value: float) -> str:
    percent = round((value - 1.0) * 100)
    percent = max(-50, min(50, percent))
    return f"{percent:+d}%"


async def synthesize(
    text: str,
    voice: str,
    rate: float,
    volume: float,
    output_path: Path,
) -> None:
    communicator = edge_tts.Communicate(
        text=text,
        voice=voice,
        rate=rate_to_edge(rate),
        volume=volume_to_edge(volume),
    )
    await communicator.save(str(output_path))


@app.get("/health")
def health() -> Response:
    return jsonify(
        {
            "ok": True,
            "engine": "edge-tts",
            "voice": DEFAULT_VOICE,
        }
    )


@app.post("/speak")
def speak() -> Response:
    payload = request.get_json(silent=True) or {}

    text = str(payload.get("text", "")).strip()
    print(f"TTS >>> {text}")
    if not text:
        return Response("Text fehlt.", status=400)

    try:
        rate = float(payload.get("rate", 0.92))
        volume = float(payload.get("volume", 1.0))
    except (TypeError, ValueError):
        return Response("Ungültige Sprachoptionen.", status=400)

    voice = str(payload.get("voice", DEFAULT_VOICE))

    temp_file = tempfile.NamedTemporaryFile(
        suffix=".mp3",
        delete=False,
    )
    temp_file.close()
    output_path = Path(temp_file.name)

    try:
        asyncio.run(
            synthesize(
                text=text,
                voice=voice,
                rate=rate,
                volume=volume,
                output_path=output_path,
            )
        )
        audio_data = output_path.read_bytes()
    except Exception as error:
        return Response(
            f"Spracherzeugung fehlgeschlagen: {error}",
            status=500,
        )
    finally:
        output_path.unlink(missing_ok=True)

    return Response(
        audio_data,
        status=200,
        mimetype="audio/mpeg",
        headers={"Cache-Control": "no-store"},
    )


if __name__ == "__main__":
    print()
    print("OGG-Sprachserver läuft.")
    print(f"Stimme: {DEFAULT_VOICE}")
    print(f"Adresse: http://{HOST}:{PORT}")
    print("Dieses Fenster während Elite geöffnet lassen.")
    print()

    app.run(
        host=HOST,
        port=PORT,
        debug=False,
        threaded=True,
    )
