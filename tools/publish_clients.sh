#!/usr/bin/env bash
# Publica el catàleg per a clients (SENSE PREUS) al repositori cataleg-clients,
# que és el que serveix el domini dels clients.
#
#   bash tools/publish_clients.sh [carpeta del clon de cataleg-clients]
#
# També hi posa l'app Crown (amb preus) a /crown/.
# Per defecte fa servir ../cataleg-clients (clonat al costat d'aquest repositori).
set -euo pipefail
cd "$(dirname "$0")/.."
DEST="${1:-../cataleg-clients}"
[ -d "$DEST/.git" ] || { echo "No trobo el clon de cataleg-clients a $DEST"; exit 1; }
python3 tools/client_app.py --site "$DEST"
python3 tools/crown_app.py --site "$DEST/crown"   # app Crown a <domini>/crown/
touch "$DEST/.nojekyll"
cd "$DEST"
git add -A
if git diff --cached --quiet; then echo "Sense canvis."; exit 0; fi
git commit -q -m "Actualitza el catàleg ($(date '+%Y-%m-%d %H:%M'))"
git push -q origin main
echo "Publicat. GitHub Pages l'actualitza en un o dos minuts."
