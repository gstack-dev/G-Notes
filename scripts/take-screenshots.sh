#!/usr/bin/env bash
# G-Notes Screenshot Generator
# Generates all app screenshots for the README.
# Requires: X11 display, ffmpeg, bash, node/npm

set -e

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SCREENSHOTS_DIR="$APP_DIR/screenshots"
APP_BINARY="$APP_DIR/out/g-notes-linux-x64/g-notes"

if [ ! -f "$APP_BINARY" ]; then
  echo "Building app first..."
  cd "$APP_DIR" && npm run package
fi

mkdir -p "$SCREENSHOTS_DIR"

screenshot() {
  local name="$1"
  local file="$SCREENSHOTS_DIR/$name"
  echo "  Capturing: $name"
  ffmpeg -y -f x11grab -video_size 1280x800 -i ":1" -vframes 1 -update 1 "$file" 2>/dev/null
  echo "  Saved: $file ($(du -h "$file" | cut -f1))"
}

launch() {
  timeout 15 "$APP_BINARY" 2>/dev/null &
  echo $!
}

echo "=== G-Notes Screenshot Generator ==="
echo ""

# To generate all screenshots, you need to:
# 1. Run `bash scripts/capture-all-screenshots.sh` on a machine with a display
# 2. Or manually capture with a screenshot tool while running the app
#
# Keyboard shortcuts for navigation:
#   Ctrl+1  - Dashboard
#   Ctrl+2  - Notes  
#   Ctrl+3  - Favorites
#   Ctrl+4  - Categories
#   Ctrl+,  - Settings
#   Ctrl+N  - New Note (opens editor)
#   Ctrl+Shift+F - Search
#   File > Export as JSON - Export dialog
echo ""
echo "Run 'bash scripts/capture-all-screenshots.sh' for full automatic capture."
echo ""
echo "Required screenshots:"
echo "  screenshots/dashboard.png"
echo "  screenshots/editor.png"
echo "  screenshots/categories.png"
echo "  screenshots/settings.png"
echo "  screenshots/export.png"
echo "  screenshots/notes.png"
