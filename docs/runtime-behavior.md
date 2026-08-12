# OGG runtime behavior

Old Guy of Grumpy (OGG) uses the Windows OneCore/WinRT speech synthesizer directly from the
Tauri backend. Speech text and synthesized audio remain on the local Windows computer.

## Local speech runtime

- The frontend requests installed voices through `list_local_voices`.
- `speak_local` selects an exact installed voice ID and applies local rate, pitch, and volume.
- `stop_local_speech` stops the active Windows media player.
- No speech HTTP endpoint, Python runtime, background speech service, or separate executable is
  started.
- Missing locales and voices are reported explicitly. There is no cross-locale or cloud fallback.

The signed update check remains technically separate from speech output. Update preparation only
checks normal application and installer process conflicts; speech does not create update locks.
