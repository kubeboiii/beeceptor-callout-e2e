#!/usr/bin/env bash
# Opens a normal Chrome window (not Playwright-controlled) with remote debugging.
# Sign in to Beeceptor with Google in this window, then run: npm run auth:save

set -euo pipefail

PROFILE_DIR="${HOME}/.beeceptor-e2e-chrome"
PORT="${CHROME_DEBUG_PORT:-9222}"

mkdir -p "$PROFILE_DIR"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [[ ! -x "$CHROME" ]]; then
  echo "Google Chrome not found at: $CHROME"
  exit 1
fi

echo "Opening Chrome on debug port ${PORT}..."
echo "1. Sign in to Beeceptor with Google in the window that opens"
echo "2. Wait until you see your endpoint dashboard"
echo "3. Run in another terminal: npm run auth:save"
echo ""

exec "$CHROME" \
  --remote-debugging-port="$PORT" \
  --user-data-dir="$PROFILE_DIR" \
  "https://app.beeceptor.com/login"
