#!/usr/bin/env bash
# Publica el catàleg a GitHub Pages (branca gh-pages) com a app instal·lable
# que funciona sense connexió. Fa servir SEMPRE la versió pública: sense
# clients, credencials ni costos.
#
#   bash tools/publish_pages.sh
#
# L'adreça és https://<usuari>.github.io/<repositori>/ (catàleg NEXE)
# i https://<usuari>.github.io/<repositori>/crown/ (catàleg Crown)
# A l'iPad: obrir-la amb Safari > Compartir > Afegir a la pantalla d'inici.
set -euo pipefail
cd "$(dirname "$0")/.."
SITE="$(mktemp -d)"
trap 'rm -rf "$SITE"' EXIT

# Catàleg NEXE amb preus i dades, XIFRAT amb contrasenya (tools/xifrar.py).
# La clau: la de la web publicada (si s'ha canviat la contrasenya des de la
# pàgina, és la bona); si encara no n'hi ha, data/clau-pagina.json.
REMOTE="$(git remote get-url origin)"
if git fetch -q "$REMOTE" gh-pages 2>/dev/null && git show FETCH_HEAD:clau.json > "$SITE/clau.json" 2>/dev/null \
   && python3 -c "import json,sys; a=json.load(open(sys.argv[1])); b=json.load(open(sys.argv[2])); sys.exit(a['pub']!=b['pub'])" "$SITE/clau.json" data/clau-pagina.json; then
  cp "$SITE/clau.json" data/clau-pagina.json
else
  cp data/clau-pagina.json "$SITE/clau.json"
fi
PRIV=""; [ -f private/clients.json ] && PRIV="--with-private"
python3 tools/nexe.py build --light --extras bundle $PRIV --out "$SITE/index.html"
python3 tools/xifrar.py page "$SITE/index.html" "$SITE/index.html" "$SITE/clau.json"
if grep -q "var insemac_products\|initialClients\|apiKey" "$SITE/index.html"; then
  echo "ATENCIÓ: l'index.html no està xifrat; no es publica" >&2; exit 1
fi
python3 tools/crown_app.py --site "$SITE/crown"   # app Crown a /crown/
touch "$SITE/.nojekyll"   # GitHub Pages: servir els fitxers tal qual

cd "$SITE"
git init -q -b gh-pages
git add -A
git -c user.name="${GIT_AUTHOR_NAME:-NEXE}" -c user.email="${GIT_AUTHOR_EMAIL:-noreply@example.com}" \
    commit -q -m "Publica el catàleg ($(date '+%Y-%m-%d %H:%M'))"
git push -q -f "$REMOTE" gh-pages
echo "Publicat a la branca gh-pages. GitHub Pages l'actualitza en un o dos minuts."
