from __future__ import annotations

import asyncio
import json
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
    percent = max(-50, min(50, round((value - 1.0) * 100)))
    return f"{percent:+d}%"


def volume_to_edge(value: float) -> str:
    percent = max(-50, min(50, round((value - 1.0) * 100)))
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


def log_request() -> None:
    print()
    print("=" * 70, flush=True)
    print("NEUE /speak-ANFRAGE", flush=True)
    print(f"Methode:      {request.method}", flush=True)
    print(f"URL:          {request.url}", flush=True)
    print(f"Content-Type: {request.content_type}", flush=True)
    print(f"Content-Len:  {request.content_length}", flush=True)
    print(f"Query:        {request.args.to_dict(flat=False)}", flush=True)

    raw = request.get_data(cache=True, as_text=False)
    print(f"Raw-Bytes:    {len(raw)}", flush=True)
    print(f"Raw-Repr:     {raw!r}", flush=True)

    try:
        decoded = raw.decode("utf-8")
    except UnicodeDecodeError as error:
        decoded = f"<UTF-8-Fehler: {error}>"

    print(f"Raw-UTF8:     {decoded!r}", flush=True)

    payload = request.get_json(silent=True)
    print(
        "JSON:         "
        + (json.dumps(payload, ensure_ascii=False) if payload is not None else "None"),
        flush=True,
    )
    print("=" * 70, flush=True)


def extract_text() -> tuple[str, str]:
    query_text = str(request.args.get("text", "")).strip()
    if query_text:
        return query_text, "query"

    payload = request.get_json(silent=True)
    if isinstance(payload, dict):
        json_text = str(payload.get("text", "")).strip()
        if json_text:
            return json_text, "json"

    raw_text = request.get_data(cache=True, as_text=True).strip()
    if raw_text:
        return raw_text, "raw"

    form_text = str(request.form.get("text", "")).strip()
    if form_text:
        return form_text, "form"

    return "", "none"


@app.get("/health")
def health() -> Response:
    print("HEALTH >>> OK", flush=True)
    return jsonify(
        {
            "ok": True,
            "engine": "edge-tts",
            "voice": DEFAULT_VOICE,
        }
    )


@app.post("/speak")
def speak() -> Response:
    log_request()

    text, source = extract_text()
    print(f"TEXT-QUELLE:  {source}", flush=True)
    print(f"TTS >>>       {text!r}", flush=True)

    if not text:
        error_message = (
            "Text fehlt. Query, JSON, Rohdaten und Formulardaten waren leer. "
            "Siehe vollständiges Request-Protokoll im Serverfenster."
        )
        print(f"ANTWORT 400:  {error_message}", flush=True)
        return Response(error_message, status=400, mimetype="text/plain")

    try:
        rate = float(request.args.get("rate", "0.92"))
        volume = float(request.args.get("volume", "1.0"))
    except ValueError as error:
        message = f"Ungültige Sprachoptionen: {error}"
        print(f"ANTWORT 400:  {message}", flush=True)
        return Response(message, status=400, mimetype="text/plain")

    voice = request.args.get("voice", DEFAULT_VOICE)

    print(f"Stimme:       {voice}", flush=True)
    print(f"Rate:         {rate}", flush=True)
    print(f"Volume:       {volume}", flush=True)

    temp_file = tempfile.NamedTemporaryFile(
        suffix=".mp3",
        delete=False,
    )
    temp_file.close()
    output_path = Path(temp_file.name)

    try:
        print(f"Temp-Datei:   {output_path}", flush=True)
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
        print(f"MP3-Größe:    {len(audio_data)} Bytes", flush=True)

        if not audio_data:
            message = "Edge-TTS hat eine leere MP3 erzeugt."
            print(f"ANTWORT 500:  {message}", flush=True)
            return Response(message, status=500, mimetype="text/plain")

    except Exception as error:
        message = f"Spracherzeugung fehlgeschlagen: {type(error).__name__}: {error}"
        print(f"ANTWORT 500:  {message}", flush=True)
        return Response(message, status=500, mimetype="text/plain")
    finally:
        output_path.unlink(missing_ok=True)

    print("ANTWORT 200:  audio/mpeg", flush=True)

    return Response(
        audio_data,
        status=200,
        mimetype="audio/mpeg",
        headers={
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
            "X-OGG-Text-Source": source,
        },
    )


if __name__ == "__main__":
    print()
    print("OGG Alpha 0.13.1 Debug-Sprachserver läuft.")
    print(f"Stimme:  {DEFAULT_VOICE}")
    print(f"Adresse: http://{HOST}:{PORT}")
    print("Dieses Fenster geöffnet lassen.")
    print()

    app.run(
        host=HOST,
        port=PORT,
        debug=False,
        threaded=True,
    )
