#!/bin/bash
# Renders every built page to out/ at its native size.
set -e
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
cd "$(dirname "$0")"
mkdir -p out
shoot() { # <url-name> <w> <h> <outfile>
  "$CHROME" --headless --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=1 --window-size="$2,$3" \
    --virtual-time-budget=3000 --screenshot="out/$4" \
    "http://localhost:8777/$1.html" >/dev/null 2>&1
}
for f in 1-parent-home 2-attendance 3-fees 4-admin 5-analytics 6-updates; do
  shoot "$f" 1080 1920 "$f.png"
done
shoot feature 1024 500 feature-graphic-1024x500.png
echo "rendered to out/"
