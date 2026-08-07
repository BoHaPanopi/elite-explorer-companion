# OGG runtime behavior

Old Guy of Grumpy (OGG) — the official AI-powered onboard companion for the Elite Explorer Companion project.

## PyInstaller onefile voice server: two processes (by design)

Status: **Accepted — by design**

The bundled `ogg-voice-server.exe` uses PyInstaller's `onefile` mode. On Windows, one logical server instance therefore appears as two processes with the same executable name:

1. The onefile bootloader parent extracts the bundled runtime, starts the child, waits for it, and cleans up the temporary files.
2. The child process initializes Python and runs the OGG voice server.

This is PyInstaller's documented process model, not a second OGG voice-server instance. OGG passes its main-process ID to the server, terminates all matching server processes during orderly shutdown and update preparation, and the server independently exits when the OGG parent process ends.

Validated scenarios:

- orderly OGG shutdown: no voice-server process remains;
- forced OGG termination: no voice-server process remains;
- Windows restart followed by OGG start and shutdown: no voice-server process remains;
- update preparation: both onefile processes are stopped before file-lock validation;
- aborted installer: a damaged sidecar is restored from the verified recovery cache.

The bootloader parent adds only the expected onefile extraction/waiting overhead. No stability or update disadvantage was observed. Changing to `onedir` would remove the parent process but would introduce multiple runtime files into the installation and update surface without a demonstrated operational benefit.

References:

- https://pyinstaller.org/en/stable/advanced-topics.html
- https://pyinstaller.org/en/stable/common-issues-and-pitfalls.html
