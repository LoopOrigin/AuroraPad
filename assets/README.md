AuroraPad Assets
=================

Place your branded app icons in this folder so they are used by Electron and the packaged builds.

Required files (recommended):
- `aurorapad-app-icon.ico`  – Windows app/installer icon (256x256 multi-size ICO)
- `aurorapad-app-icon.png` – macOS/Linux app icon (at least 512x512)

Electron usage:
- The main window icon is loaded from `assets/aurorapad-app-icon.ico` on Windows and `assets/aurorapad-app-icon.png` on macOS/Linux.
- `electron-builder` is configured in `package.json` to pick these same files for the final installers.

If these files are missing, Electron will fall back to its default icon.

