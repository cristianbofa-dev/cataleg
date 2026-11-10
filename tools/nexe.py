#!/usr/bin/env python3
"""
Eina de construcció del Catàleg NEXE.

El catàleg es distribueix com un únic fitxer HTML autònom (dades, codi i
imatges incrustats) perquè funcioni sense connexió a l'iPad i al Mac.
Aquest script permet treballar-hi com un projecte de codi font normal:

  python3 tools/nexe.py import <fitxer.html>   # HTML únic  -> codi font del repositori
  python3 tools/nexe.py build                  # codi font  -> dist/ (versió pública)
  python3 tools/nexe.py build --with-private   # inclou clients, Firebase i costos (ús personal)
  python3 tools/nexe.py verify <fitxer.html>   # comprova que build reprodueix el fitxer

Dades privades (MAI al repositori, carpeta private/ ignorada per git):
  private/clients.json   llista de clients (initialClients)
  private/firebase.json  configuració i credencials de Firebase
  private/costs.json     preus de cost per índex de producte

Per defecte el build NO inclou aquestes dades, perquè el resultat es pot
publicar sense risc. Amb --with-private s'hi afegeixen (només per a ús
personal: un HTML amb dades privades no s'ha de publicar ni compartir).
Sense dades privades el catàleg funciona igual, però sense clients
precarregats, sense sincronització amb Firebase i sense costos.

Només utilitza la biblioteca estàndard de Python 3.8+.
"""
import argparse
import base64
import hashlib
import json
import os
import re
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
DATA = os.path.join(ROOT, 'data')
IMAGES = os.path.join(ROOT, 'images')
PRIVATE = os.path.join(ROOT, 'private')
PUBLIC = os.path.join(ROOT, 'public')
DIST = os.path.join(ROOT, 'dist')

TEMPLATE = os.path.join(SRC, 'index.template.html')

# Blocs <script>/<style> que es treuen a fitxers propis.
# (signatura que identifica el bloc, nom del marcador, tipus)
BLOCKS = [
    ("window.addEventListener('error'", 'src/js/error-bar.js', 'include'),
    ('var insemac_products = ', 'products', 'data'),
    ('var insemac_variant_groups = ', 'variant_groups', 'data'),
    ("Nexe Base de Coneixement", 'src/js/knowledge.js', 'include'),
    ('var initialClients = ', 'clients', 'data'),
    ('window.__IMG_DATA__=', 'images', 'data'),
    ('Nexe Catàleg — Commercial iPad PWA', 'src/js/app.js', 'include'),
    ("import('./src/catalog/catalog-bridge.js')", 'src/js/sqlite-bridge.js', 'include'),
    ("navigator.serviceWorker.register", 'src/js/sw-register.js', 'include'),
]

FIREBASE_KEYS = ['apiKey', 'authDomain', 'databaseURL', 'projectId',
                 'storageBucket', 'messagingSenderId', 'appId']

PRODUCTS_PREFIX = 'var insemac_products = '
GROUPS_PREFIX = 'var insemac_variant_groups = '
CLIENTS_HEADER = '\n// Client data exported from Firebase\nvar initialClients = '
IMAGES_PREFIX = 'window.__IMG_DATA__='


# ───────────────────────── utilitats ─────────────────────────

def read_text(path):
    with open(path, encoding='utf-8', newline='') as f:
        return f.read()


def write_text(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8', newline='') as f:
        f.write(text)


def write_json(path, obj, indent=1):
    write_text(path, json.dumps(obj, ensure_ascii=False, indent=indent) + '\n')


def read_json(path, default=None):
    if not os.path.exists(path):
        return default
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def js_safe(text):
    """Evita que una cadena de dades tanqui el <script> per accident."""
    return text.replace('</', '<\\/')


def compact(obj):
    return js_safe(json.dumps(obj, ensure_ascii=False, separators=(',', ':')))


def iter_blocks(html):
    """Retorna (inici_contingut, final_contingut, etiqueta_obertura, contingut)."""
    for m in re.finditer(r'<(script|style)(\b[^>]*)>', html):
        tag = m.group(1)
        end = html.find('</%s>' % tag, m.end())
        if end < 0:
            raise SystemExit('Bloc <%s> sense tancar' % tag)
        yield m.end(), end, m.group(0), html[m.end():end]


# ───────────────────────── import ─────────────────────────

def split_firebase(app_js):
    """Treu la configuració i credencials de Firebase del codi."""
    cfg = {}

    def repl_cfg(m):
        key, val = m.group(1), m.group(2)
        cfg[key] = val
        return '%s: "{{firebase:%s}}"' % (key, key)

    pattern = r'\b(%s): "([^"]*)"' % '|'.join(FIREBASE_KEYS)
    app_js = re.sub(pattern, repl_cfg, app_js)

    creds = re.findall(r"signInWithEmailAndPassword\('([^']*)', '([^']*)'\)", app_js)
    if creds:
        cfg['email'], cfg['password'] = creds[0]
    app_js = re.sub(r"signInWithEmailAndPassword\('[^']*', '[^']*'\)",
                    "signInWithEmailAndPassword('{{firebase:email}}', '{{firebase:password}}')",
                    app_js)
    return app_js, cfg


COST_KEYS = ('cost',)


def strip_costs(obj, path, costs):
    """Treu els preus de cost (a qualsevol nivell: producte, variants…).

    Cada valor es desa a costs amb una ruta com "942" o
    "942/insemacVariants/0" i al producte queda null.
    """
    if isinstance(obj, dict):
        for key in list(obj):
            sub = path + '/' + key
            if key in COST_KEYS:
                if obj[key] is not None:
                    costs[path if path.count('/') == 0 and key == 'cost' else sub] = obj[key]
                obj[key] = None
            else:
                strip_costs(obj[key], sub, costs)
    elif isinstance(obj, list):
        for k, item in enumerate(obj):
            strip_costs(item, '%s/%d' % (path, k), costs)


def restore_costs(products, costs):
    for route, value in costs.items():
        parts = route.split('/')
        try:
            target = products[int(parts[0])]
            if len(parts) == 1:
                target['cost'] = value
                continue
            for part in parts[1:-1]:
                target = target[int(part)] if isinstance(target, list) else target[part]
            target[parts[-1]] = value
        except (IndexError, KeyError, ValueError, TypeError):
            print('Avís: cost no aplicat, ruta inexistent: %s' % route)


def cmd_import(args):
    html = read_text(args.html)
    out = []
    pos = 0
    found = set()
    private = {}
    for start, end, open_tag, content in iter_blocks(html):
        match = None
        for sig, name, kind in BLOCKS:
            if sig in content:
                match = (name, kind)
                break
        if match is None:
            if len(content) > 400 and not open_tag.startswith('<style'):
                raise SystemExit('Bloc de script desconegut (%d caràcters): %r'
                                 % (len(content), content[:120]))
            if open_tag.startswith('<style'):
                match = ('src/css/styles.css', 'include')
            else:
                continue  # bloc petit: es queda dins la plantilla
        name, kind = match
        if name in found:
            raise SystemExit('Bloc repetit: %s' % name)
        found.add(name)
        out.append(html[pos:start])
        pos = end

        if kind == 'include':
            if name == 'src/js/app.js':
                content, fb = split_firebase(content)
                if fb:
                    private['firebase'] = fb
            write_text(os.path.join(ROOT, name), content)
            out.append('{{include:%s}}' % name)
            continue

        # Blocs de dades
        if name == 'products':
            body = content.strip()
            assert body.startswith(PRODUCTS_PREFIX) and body.endswith(';')
            products = json.loads(body[len(PRODUCTS_PREFIX):-1])
            costs = {}
            for i, p in enumerate(products):
                strip_costs(p, str(i), costs)
            if costs:
                private['costs'] = costs
            write_json(os.path.join(DATA, 'products.json'), products)
            out.append('\n{{data:products}}\n')
        elif name == 'variant_groups':
            body = content.strip()
            assert body.startswith(GROUPS_PREFIX) and body.endswith(';')
            groups = json.loads(body[len(GROUPS_PREFIX):-1])
            write_json(os.path.join(DATA, 'variant-groups.json'), groups)
            out.append('\n{{data:variant_groups}}\n')
        elif name == 'clients':
            i = content.index('var initialClients = ') + len('var initialClients = ')
            j = content.rindex(';')
            private['clients'] = json.loads(content[i:j])
            out.append('{{data:clients}}')
        elif name == 'images':
            body = content.strip()
            assert body.startswith(IMAGES_PREFIX) and body.endswith(';')
            images = json.loads(body[len(IMAGES_PREFIX):-1])
            manifest = []
            for key, uri in images.items():
                m = re.match(r'data:([^;,]+);base64,(.*)$', uri, re.S)
                if not m:
                    raise SystemExit('Imatge no suportada: %s' % key)
                path = os.path.normpath(os.path.join(IMAGES, key))
                if not path.startswith(IMAGES + os.sep):
                    raise SystemExit('Ruta d\'imatge no vàlida: %s' % key)
                os.makedirs(os.path.dirname(path), exist_ok=True)
                with open(path, 'wb') as f:
                    f.write(base64.b64decode(m.group(2)))
                manifest.append([key, m.group(1)])
            write_json(os.path.join(IMAGES, 'manifest.json'), manifest, indent=0)
            out.append('{{data:images}}')
    out.append(html[pos:])

    missing = {b[1] for b in BLOCKS} - found
    if missing:
        print('Avís: no s\'han trobat aquests blocs:', ', '.join(sorted(missing)))

    write_text(TEMPLATE, ''.join(out))

    if private:
        os.makedirs(PRIVATE, exist_ok=True)
        for key, fname in (('clients', 'clients.json'), ('firebase', 'firebase.json'),
                           ('costs', 'costs.json')):
            if key in private:
                write_json(os.path.join(PRIVATE, fname), private[key], indent=2)
        print('Dades privades desades a private/ (no es pugen a GitHub):',
              ', '.join(sorted(private)))
    print('Importat: %s' % args.html)


# ───────────────────────── build ─────────────────────────

def load_images():
    manifest = read_json(os.path.join(IMAGES, 'manifest.json'), [])
    images = {}
    for key, mime in manifest:
        with open(os.path.join(IMAGES, key), 'rb') as f:
            images[key] = 'data:%s;base64,%s' % (mime, base64.b64encode(f.read()).decode('ascii'))
    return images


def build_html(use_private=False):
    template = read_text(TEMPLATE)
    priv = use_private and os.path.isdir(PRIVATE)
    firebase = read_json(os.path.join(PRIVATE, 'firebase.json'), {}) if priv else {}
    clients = read_json(os.path.join(PRIVATE, 'clients.json'), []) if priv else []
    costs = read_json(os.path.join(PRIVATE, 'costs.json'), {}) if priv else {}

    products = read_json(os.path.join(DATA, 'products.json'))
    restore_costs(products, costs)
    groups = read_json(os.path.join(DATA, 'variant-groups.json'))

    def include(m):
        text = read_text(os.path.join(ROOT, m.group(1)))
        if m.group(1) == 'src/js/app.js':
            text = re.sub(r'\{\{firebase:(\w+)\}\}',
                          lambda f: str(firebase.get(f.group(1), '')).replace("'", "\\'"),
                          text)
        return text

    html = re.sub(r'\{\{include:([^}]+)\}\}', include, template)

    data = {
        'products': PRODUCTS_PREFIX + compact(products) + ';',
        'variant_groups': GROUPS_PREFIX + compact(groups) + ';',
        'clients': CLIENTS_HEADER + js_safe(json.dumps(clients, ensure_ascii=False, indent=2)) + ';\n',
        'images': IMAGES_PREFIX + compact(load_images()) + ';',
    }
    html = re.sub(r'\{\{data:(\w+)\}\}', lambda m: data[m.group(1)], html)
    return html


def copy_public(dest, html):
    """Copia public/ (manifest, service worker, icones) al costat de l'HTML."""
    version = hashlib.sha256(html.encode('utf-8')).hexdigest()[:12]
    for base, _, files in os.walk(PUBLIC):
        for name in files:
            src = os.path.join(base, name)
            dst = os.path.join(dest, os.path.relpath(src, PUBLIC))
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            if name == 'sw.js':
                write_text(dst, read_text(src).replace('__BUILD_VERSION__', version))
            else:
                shutil.copyfile(src, dst)


def cmd_build(args):
    html = build_html(use_private=args.with_private)
    out = args.out or os.path.join(DIST, 'index.html')
    write_text(out, html)
    copy_public(os.path.dirname(os.path.abspath(out)), html)
    print('Construït %s (%.1f MB) — %s' % (
        os.path.relpath(out), len(html.encode()) / 1e6,
        'AMB DADES PRIVADES: no el publiquis ni el comparteixis' if args.with_private
        else 'versió pública, sense dades privades'))


# ───────────────────────── verify ─────────────────────────

def split_for_compare(html):
    """Separa codi (comparació exacta) i dades (comparació del contingut)."""
    code = []
    data = {}
    pos = 0
    for start, end, open_tag, content in iter_blocks(html):
        key = None
        for sig, name, kind in BLOCKS:
            if kind == 'data' and sig in content:
                key = name
        if key is None:
            continue
        code.append(html[pos:start])
        pos = end
        if key == 'clients':
            i = content.index('var initialClients = ') + len('var initialClients = ')
            data[key] = json.loads(content[i:content.rindex(';')])
        else:
            body = content.strip()
            data[key] = json.loads(body[body.index('=') + 1:].strip().rstrip(';').strip())
        code.append('{{%s}}' % key)
    code.append(html[pos:])
    return ''.join(code), data


def cmd_verify(args):
    ref_code, ref_data = split_for_compare(read_text(args.html))
    new_html = build_html(use_private=args.with_private)
    new_code, new_data = split_for_compare(new_html)
    ok = True
    if ref_code != new_code:
        ok = False
        a, b = ref_code, new_code
        i = next((k for k in range(min(len(a), len(b))) if a[k] != b[k]), min(len(a), len(b)))
        print('✗ El codi no coincideix a la posició %d:\n  original: %r\n  construït: %r'
              % (i, a[i - 60:i + 60], b[i - 60:i + 60]))
    else:
        print('✓ Codi HTML/CSS/JS idèntic (%d caràcters)' % len(ref_code))
    for key in sorted(set(ref_data) | set(new_data)):
        if ref_data.get(key) == new_data.get(key):
            n = len(ref_data[key]) if key in ref_data else 0
            print('✓ Dades "%s" idèntiques (%d elements)' % (key, n))
        else:
            ok = False
            print('✗ Dades "%s" diferents' % key)
    sys.exit(0 if ok else 1)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    p = sub.add_parser('import', help='Importa un catàleg HTML únic al codi font')
    p.add_argument('html')
    p.set_defaults(func=cmd_import)
    p = sub.add_parser('build', help='Construeix dist/index.html')
    p.add_argument('--out')
    p.add_argument('--with-private', action='store_true',
                   help='Inclou les dades de private/ (ús personal, no publicar)')
    p.set_defaults(func=cmd_build)
    p = sub.add_parser('verify', help='Comprova que el build reprodueix un HTML')
    p.add_argument('html')
    p.add_argument('--with-private', action='store_true',
                   help='Compara incloent les dades de private/')
    p.set_defaults(func=cmd_verify)
    args = ap.parse_args()
    args.func(args)


if __name__ == '__main__':
    main()
