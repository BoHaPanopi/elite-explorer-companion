from __future__ import annotations

import asyncio
import ctypes
import os
import tempfile
import wave
from pathlib import Path

import edge_tts

TEST_TEXT_DE = "Kurs steht. Nächstes System ist ausgewählt."
TEST_TEXT_EN = "Course is set. The next system is selected."
TEST_TEXT_FR = "Cap défini. Le prochain système est sélectionné."
TEST_TEXT_IT = "Rotta impostata. Il prossimo sistema è selezionato."
TEST_TEXT_ES = "Rumbo fijado. El próximo sistema está seleccionado."
TEST_TEXT_ANNA_DE = "Die Daten sind interessant. Das sollten wir uns genauer ansehen."
TEST_TEXT_ANNA_OGG = "Ach OGG … du hast dich wirklich kein bisschen verändert."
TEST_TEXT_ANNA_EN = "The data is interesting. We should take a closer look."
TEST_TEXT_ANNA_FR = "Les données sont intéressantes. Nous devrions les examiner de plus près."
TEST_TEXT_ANNA_IT = "I dati sono interessanti. Dovremmo esaminarli più attentamente."
TEST_TEXT_ANNA_ES = "Los datos son interesantes. Deberíamos examinarlos más detenidamente."
SILENT_PRE_ROLL_SECONDS = 1.5

VOICE_PRESETS: dict[str, tuple[str, float, float, float, str, str]] = {
    "1": ("de-DE-ConradNeural", 0.90, -5.0, 1.00, TEST_TEXT_DE, "Conrad"),
    "2": (
        "de-DE-FlorianMultilingualNeural",
        0.90,
        -15.0,
        1.00,
        TEST_TEXT_DE,
        "Florian",
    ),
    "3": ("de-DE-KillianNeural", 0.90, -8.0, 1.00, TEST_TEXT_DE, "Killian"),
    "5": (
        "de-DE-FlorianMultilingualNeural",
        0.90,
        -15.0,
        1.00,
        TEST_TEXT_EN,
        "Florian - English",
    ),
    "6": (
        "de-DE-FlorianMultilingualNeural",
        0.90,
        -15.0,
        1.00,
        TEST_TEXT_FR,
        "Florian - Français",
    ),
    "7": (
        "de-DE-FlorianMultilingualNeural",
        0.90,
        -15.0,
        1.00,
        TEST_TEXT_IT,
        "Florian - Italiano",
    ),
    "8": (
        "de-DE-FlorianMultilingualNeural",
        0.90,
        -15.0,
        1.00,
        TEST_TEXT_ES,
        "Florian - Español",
    ),
    "9": (
        "de-DE-SeraphinaMultilingualNeural",
        0.95,
        0.0,
        1.00,
        TEST_TEXT_ANNA_DE,
        "Anna - Seraphina",
    ),
    "10": (
        "en-US-AvaMultilingualNeural",
        0.95,
        0.0,
        1.00,
        TEST_TEXT_ANNA_DE,
        "Anna - Ava",
    ),
    "11": (
        "en-US-EmmaMultilingualNeural",
        1.05,
        0.0,
        1.00,
        TEST_TEXT_ANNA_DE,
        "Anna - Emma",
    ),
    "12": (
        "en-US-EmmaMultilingualNeural",
        1.05,
        0.0,
        1.00,
        TEST_TEXT_ANNA_OGG,
        "Anna -> OGG",
    ),
    "13": (
        "en-US-EmmaMultilingualNeural",
        1.05,
        0.0,
        1.00,
        TEST_TEXT_ANNA_EN,
        "Anna - English",
    ),
    "14": (
        "en-US-EmmaMultilingualNeural",
        1.05,
        0.0,
        1.00,
        TEST_TEXT_ANNA_FR,
        "Anna - Français",
    ),
    "15": (
        "en-US-EmmaMultilingualNeural",
        1.05,
        0.0,
        1.00,
        TEST_TEXT_ANNA_IT,
        "Anna - Italiano",
    ),
    "16": (
        "en-US-EmmaMultilingualNeural",
        1.05,
        0.0,
        1.00,
        TEST_TEXT_ANNA_ES,
        "Anna - Español",
    ),
    "17": (
        "en-GB-LibbyNeural",
        1.05,
        0.0,
        1.00,
        TEST_TEXT_ANNA_EN,
        "Anna EN - Libby",
    ),
    "18": (
        "en-GB-MaisieNeural",
        1.05,
        0.0,
        1.00,
        TEST_TEXT_ANNA_EN,
        "Anna EN - Maisie",
    ),
    "19": (
        "en-GB-SoniaNeural",
        1.05,
        0.0,
        1.00,
        TEST_TEXT_ANNA_EN,
        "Anna EN - Sonia",
    ),
}


def rate_to_edge(value: float) -> str:
    percent = max(-50, min(50, round((value - 1.0) * 100)))
    return f"{percent:+d}%"


def volume_to_edge(value: float) -> str:
    percent = max(-50, min(50, round((value - 1.0) * 100)))
    return f"{percent:+d}%"


def pitch_to_edge(value: float) -> str:
    hz = max(-100, min(100, round(value)))
    return f"{hz:+d}Hz"


async def synthesize_to_file(
    text: str,
    voice: str,
    rate: float,
    pitch: float,
    volume: float,
    output_path: Path,
) -> None:
    communicator = edge_tts.Communicate(
        text=text,
        voice=voice,
        rate=rate_to_edge(rate),
        pitch=pitch_to_edge(pitch),
        volume=volume_to_edge(volume),
    )
    await communicator.save(str(output_path))


def play_mp3_wait(path: Path) -> None:
    mci_send = ctypes.windll.winmm.mciSendStringW
    alias = "crew_tts_preview"
    mci_send(f'open "{path}" type mpegvideo alias {alias}', None, 0, None)
    try:
        mci_send(f"play {alias} wait", None, 0, None)
    finally:
        mci_send(f"close {alias}", None, 0, None)


def play_wav_wait(path: Path) -> None:
    mci_send = ctypes.windll.winmm.mciSendStringW
    alias = "crew_tts_preroll"
    mci_send(f'open "{path}" type waveaudio alias {alias}', None, 0, None)
    try:
        mci_send(f"play {alias} wait", None, 0, None)
    finally:
        mci_send(f"close {alias}", None, 0, None)


def create_silent_wav(path: Path, duration_seconds: float) -> None:
    sample_rate = 16000
    channels = 1
    sample_width = 2
    frame_count = max(1, int(sample_rate * duration_seconds))
    silence = b"\x00\x00" * frame_count

    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(channels)
        wav.setsampwidth(sample_width)
        wav.setframerate(sample_rate)
        wav.writeframes(silence)


def print_menu() -> None:
    print()
    print("Crew Voice Preview - Willi / Navigation / Deutsch")
    print("1 = Conrad")
    print("2 = Florian")
    print("3 = Killian")
    print("4 = Alle nacheinander")
    print("5 = Florian - English")
    print("6 = Florian - Français")
    print("7 = Florian - Italiano")
    print("8 = Florian - Español")
    print("9 = Anna - Seraphina")
    print("10 = Anna - Ava")
    print("11 = Anna - Emma")
    print("12 = Anna -> OGG")
    print("13 = Anna - English")
    print("14 = Anna - Français")
    print("15 = Anna - Italiano")
    print("16 = Anna - Español")
    print("17 = Anna EN - Libby")
    print("18 = Anna EN - Maisie")
    print("19 = Anna EN - Sonia")
    print("0 = Ende")


def run_single(choice: str, temp_path: Path, pre_roll_path: Path) -> None:
    voice, rate, pitch, volume, text, label = VOICE_PRESETS[choice]
    print(f"\nStimme: {voice}")
    print(f"Preset: {label}")
    print(f"Rate={rate:.2f} Pitch={pitch:.0f} Volume={volume:.2f}")
    print("Status: Erzeuge Audio...")
    asyncio.run(
        synthesize_to_file(
            text=text,
            voice=voice,
            rate=rate,
            pitch=pitch,
            volume=volume,
            output_path=temp_path,
        )
    )
    print(f"Status: Silent Pre-Roll ({SILENT_PRE_ROLL_SECONDS:.1f}s)...")
    play_wav_wait(pre_roll_path)
    print("Status: Spiele ab...")
    play_mp3_wait(temp_path)
    print("Status: Fertig")


def main() -> int:
    temp_path = Path(tempfile.gettempdir()) / "ogg-crew-voice-preview.mp3"
    pre_roll_path = Path(tempfile.gettempdir()) / "ogg-crew-voice-preroll.wav"
    create_silent_wav(pre_roll_path, SILENT_PRE_ROLL_SECONDS)

    try:
        while True:
            print_menu()
            choice = input("Auswahl: ").strip()

            if choice == "0":
                print("Beendet.")
                return 0

            if choice in {"1", "2", "3", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"}:
                run_single(choice, temp_path, pre_roll_path)
                continue

            if choice == "4":
                for key in ("1", "2", "3"):
                    run_single(key, temp_path, pre_roll_path)
                continue

            print("Ungültige Auswahl.")
    finally:
        try:
            if temp_path.exists():
                os.remove(temp_path)
        except OSError:
            pass
        try:
            if pre_roll_path.exists():
                os.remove(pre_roll_path)
        except OSError:
            pass


if __name__ == "__main__":
    raise SystemExit(main())