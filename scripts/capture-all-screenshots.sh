#!/usr/bin/env bash
# G-Notes Complete Screenshot Capture
# This script temporarily modifies source files, rebuilds, captures screenshots,
# then restores the original files. Requires X11 display.

set -e

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SCREENSHOTS_DIR="$APP_DIR/screenshots"
APP_BINARY="$APP_DIR/out/g-notes-linux-x64/g-notes"
DATE_SUFFIX=$(date +%s)

if [ ! -f "$APP_BINARY" ]; then
  echo "Building app first..."
  cd "$APP_DIR" && npm run package
fi

mkdir -p "$SCREENSHOTS_DIR"

screenshot() {
  local name="$1"
  local file="$SCREENSHOTS_DIR/$name"
  echo "  -> Capturing: $name"
  ffmpeg -y -f x11grab -video_size 1280x800 -i :1 -vframes 1 -update 1 "$file" 2>/dev/null
  echo "  -> Saved: $file ($(du -h "$file" | cut -f1))"
}

# Backup files
cp "$APP_DIR/src/shared/page-store.ts" "/tmp/page-store.ts.bak.$DATE_SUFFIX"
cp "$APP_DIR/src/components/layout/app-shell.tsx" "/tmp/app-shell.tsx.bak.$DATE_SUFFIX"

# Helper: modify page-store default
set_page() {
  local page="$1"
  sed -i "s/activePage: \".*\"/activePage: \"$page\"/" "$APP_DIR/src/shared/page-store.ts"
}

# Helper: modify app-shell dialog default
set_dialog() {
  local dialog="$1"
  local state="$2"
  sed -i "s/const \[${dialog}Open, set${dialog^}Open\] = useState(false)/const [${dialog}Open, set${dialog^}Open] = useState($state)/" \
    "$APP_DIR/src/components/layout/app-shell.tsx"
}

# === 1. Dashboard ===
echo ""
echo "=== Dashboard ==="
set_page "dashboard"
cd "$APP_DIR" && npm run package 2>/dev/null
cd "$APP_DIR" && timeout 12 "$APP_BINARY" 2>/dev/null &
PID=$!; sleep 5; screenshot "dashboard.png"; kill $PID 2>/dev/null; wait $PID 2>/dev/null

# === 2. Notes page ===
echo ""
echo "=== Notes ==="
set_page "notes"
cd "$APP_DIR" && npm run package 2>/dev/null
cd "$APP_DIR" && timeout 12 "$APP_BINARY" 2>/dev/null &
PID=$!; sleep 5; screenshot "notes.png"; kill $PID 2>/dev/null; wait $PID 2>/dev/null

# === 3. Favorites ===
echo ""
echo "=== Favorites ==="
set_page "favorites"
cd "$APP_DIR" && npm run package 2>/dev/null
cd "$APP_DIR" && timeout 12 "$APP_BINARY" 2>/dev/null &
PID=$!; sleep 5; screenshot "favorites.png"; kill $PID 2>/dev/null; wait $PID 2>/dev/null

# === 4. Categories ===
echo ""
echo "=== Categories ==="
set_page "categories"
cd "$APP_DIR" && npm run package 2>/dev/null
cd "$APP_DIR" && timeout 12 "$APP_BINARY" 2>/dev/null &
PID=$!; sleep 5; screenshot "categories.png"; kill $PID 2>/dev/null; wait $PID 2>/dev/null

# === 5. Settings dialog ===
echo ""
echo "=== Settings ==="
set_page "dashboard"
set_dialog "settings" "true"
cd "$APP_DIR" && npm run package 2>/dev/null
cd "$APP_DIR" && timeout 12 "$APP_BINARY" 2>/dev/null &
PID=$!; sleep 5; screenshot "settings.png"; kill $PID 2>/dev/null; wait $PID 2>/dev/null

# === 6. Export dialog ===
echo ""
echo "=== Export ==="
set_dialog "settings" "false"
set_dialog "exportImport" "true"
cd "$APP_DIR" && npm run package 2>/dev/null
cd "$APP_DIR" && timeout 12 "$APP_BINARY" 2>/dev/null &
PID=$!; sleep 5; screenshot "export.png"; kill $PID 2>/dev/null; wait $PID 2>/dev/null

# === 7. About dialog ===
echo ""
echo "=== About ==="
set_dialog "exportImport" "false"
set_dialog "about" "true"
cd "$APP_DIR" && npm run package 2>/dev/null
cd "$APP_DIR" && timeout 12 "$APP_BINARY" 2>/dev/null &
PID=$!; sleep 5; screenshot "about.png"; kill $PID 2>/dev/null; wait $PID 2>/dev/null

# Restore originals
cp "/tmp/page-store.ts.bak.$DATE_SUFFIX" "$APP_DIR/src/shared/page-store.ts"
cp "/tmp/app-shell.tsx.bak.$DATE_SUFFIX" "$APP_DIR/src/components/layout/app-shell.tsx"

echo ""
echo "=== All screenshots captured! ==="
ls -la "$SCREENSHOTS_DIR"/
