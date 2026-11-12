#!/usr/bin/env bash
# Publica el catàleg a GitHub Pages (branca gh-pages) com a app instal·lable
# que funciona sense connexió. Fa servir SEMPRE la versió pública: sense
# clients, credencials ni costos.
#
#   bash tools/publish_pages.sh
#
# L'adreça és https://<usuari>.github.io/<repositori>/
# A l'iPad: obrir-la amb Safari > Compartir > Afegir a la pantalla d'inici.
set -euo pipefail
cd "$(dirname "$0")/.."
SITE="$(mktemp -d)"
trap 'rm -rf "$SITE"' EXIT

python3 tools/nexe.py build --light --extras bundle --out "$SITE/index.html"
touch "$SITE/.nojekyll"   # GitHub Pages: servir els fitxers tal qual

REMOTE="$(git remote get-url origin)"
cd "$SITE"
git init -q -b gh-pages
git add -A
git -c user.name="${GIT_AUTHOR_NAME:-NEXE}" -c user.email="${GIT_AUTHOR_EMAIL:-noreply@example.com}" \
    commit -q -m "Publica el catàleg ($(date '+%Y-%m-%d %H:%M'))"
git push -q -f "$REMOTE" gh-pages
echo "Publicat a la branca gh-pages. GitHub Pages l'actualitza en un o dos minuts."
