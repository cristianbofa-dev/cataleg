#!/usr/bin/env python3
"""
App "Catàleg Crown": el mateix catàleg que NEXE (fitxes, cerca, comandes,
mode edició, sense connexió…) però només amb les màquines Crown de
cataleg-crown/maquines.txt i els preus NEXE (fullet + ports).

  python3 tools/crown_app.py                # -> dist/crown/index.html (+ manifest, sw.js, icones)
  python3 tools/crown_app.py --out f.html   # un sol fitxer (p. ex. per a l'app Documents)

Diferències amb el catàleg NEXE:
- menú propi: Eines a bateria, Bateries i carregadors, Eines de cable, Mesura;
- memòria del navegador separada (claus amb prefix "crown_"), perquè les
  comandes, els favorits i el mode edició no es barregin amb el de NEXE;
- service worker amb memòria cau pròpia (crown-cataleg-…);
- no porta clients, credencials ni costos.
"""
import argparse
import base64
import hashlib
import io
import json
import os
import re
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import nexe  # noqa: E402

from PIL import Image, ImageDraw, ImageFont  # noqa: E402

ROOT = nexe.ROOT
CROWN = os.path.join(ROOT, 'cataleg-crown')
sys.path.insert(0, CROWN)
import generar_pdf as gp  # noqa: E402  (preus i dades de les màquines)

# Menú: categoria -> (nom, icona, [(secció del fullet, id subcat, nom subcat), …])
MENU = [
    ('bateria', 'Eines a bateria', '🔋', [
        ('Taladros y atornilladores 3,6 V · 4 V · 12 V', 'b-12v', 'Trepants i cargoladors 3,6-12 V'),
        ('Taladros y percutores 20 V Max', 'b-trepants', 'Trepants i percussors 20 V'),
        ('Atornilladores y llaves de impacto 20 V Max', 'b-impacte', 'Cargoladors i claus d\'impacte 20 V'),
        ('Martillos y mezcladora 20 V Max', 'b-martells', 'Martells i mescladora 20 V'),
        ('Trabajo del metal 20 V Max', 'b-metall', 'Amoladores i metall 20 V'),
        ('Carpintería 20 V Max', 'b-fusteria', 'Fusteria 20 V'),
        ('Aspiración, soplado, iluminación y jardín 20 V Max', 'b-jardi', 'Aspiració, llum i jardí 20 V'),
        ('Kits y combos 20 V Max', 'b-kits', 'Kits i combos 20 V'),
    ]),
    ('energia', 'Bateries i carregadors', '⚡', [
        ('Baterías, cargadores y kits de energía 20 V Max', 'e-20v', 'Bateries, carregadors i kits 20 V'),
        ('Baterías y cargadores 12 V', 'e-12v', 'Bateries i carregadors 12 V'),
    ]),
    ('cable', 'Eines de cable', '🔌', [
        ('Amoladoras, pulidoras y satinadora', 'c-amoladores', 'Amoladores, polidores i satinadora'),
        ('Taladros y llave de impacto', 'c-trepants', 'Trepants i clau d\'impacte'),
        ('Martillos y demoledores', 'c-martells', 'Martells i demolidors'),
        ('Mezcladores y rozadora', 'c-mescladors', 'Mescladors i regatadora'),
        ('Sierras', 'c-serres', 'Serres'),
        ('Pintura, decapado y lijado', 'c-polit', 'Pintura, decapat i polit'),
        ('Carpintería y multiherramienta', 'c-fusteria', 'Fusteria i multieina'),
        ('Aspiración y soldadura', 'c-aspiracio', 'Aspiració i soldadura'),
        ('Compresores, hidrolimpiadoras y bombas', 'c-compressors', 'Compressors, hidronetejadores i bombes'),
        ('Taladros de base magnética', 'c-base-magnetica', 'Trepants de base magnètica'),
    ]),
    ('mesura', 'Mesura i làser', '📏', [
        ('Medición y láser', 'm-mesura', 'Mesura i làser'),
    ]),
]

TIPUS_TXT = {
    'M': 'Màquina a bateria.',
    'P': 'Pack: màquina amb bateria i carregador.',
    'C': 'Eina elèctrica amb cable.',
    'B': 'Plataforma de bateria Crown.',
    'I': 'Instrument de mesura.',
}

STORAGE_SHIM = """<script>/* Catàleg Crown: memòria del navegador separada del catàleg NEXE */
(function(){try{var P='crown_',S=Storage.prototype,L=window.localStorage;
['getItem','setItem','removeItem'].forEach(function(m){var o=S[m];S[m]=function(k){var a=Array.prototype.slice.call(arguments);
if(this===L&&typeof k==='string'&&k.indexOf(P)!==0)a[0]=P+k;return o.apply(this,a);};});}catch(e){}})();</script>"""


def square(path, size=640):
    im = Image.open(path).convert('RGB')
    k = (size * 0.92) / max(im.size)
    im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    c = Image.new('RGB', (size, size), 'white')
    c.paste(im, ((size - im.width) // 2, (size - im.height) // 2))
    buf = io.BytesIO()
    c.save(buf, 'JPEG', quality=80, optimize=True, progressive=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode('ascii')


def menu_tile(fotos):
    """Imatge del botó del menú: fotos a dalt i degradat fosc a baix per llegir el text."""
    W, H = 900, 600
    c = Image.new('RGB', (W, H), 'white')
    n = max(1, len(fotos))
    for k, f in enumerate(fotos):
        im = Image.open(f).convert('RGB')
        im.thumbnail(((W // n) - 30, 330), Image.LANCZOS)
        x = k * (W // n) + (W // n - im.width) // 2
        c.paste(im, (x, 30 + (330 - im.height) // 2))
    grad = Image.new('L', (1, H))
    for y in range(H):
        t = max(0.0, (y - H * 0.5) / (H * 0.5))
        grad.putpixel((0, y), int(215 * min(1.0, t * 1.3)))
    dark = Image.new('RGB', (W, H), (28, 28, 30))
    c = Image.composite(dark, c, grad.resize((W, H)))
    buf = io.BytesIO()
    c.save(buf, 'JPEG', quality=80, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode('ascii')


def products_and_images():
    items = gp.llegir()
    sec_map = {}
    for cat, _, _, subs in MENU:
        for sec, sid, _ in subs:
            sec_map[sec] = (cat, sid)
    products, images = [], {}
    for it in items:
        cat, sid = sec_map[it['seccio']]
        key = 'imgs/crown/%s.jpg' % re.sub(r'[^\w\-]', '_', it['ref'])
        images[key] = square(it['foto'])
        desc = [it['nom'] + '.', TIPUS_TXT[it['tipus']]]
        if '(cuerpo)' in it['nom'] or 'sin batería ni cargador' in it['nom']:
            desc.append('Es ven el cos de la màquina, sense bateria ni carregador.')
        if it['ref'].startswith('CAB'):
            desc.append('Promoció: comprant 2 bateries a la mateixa comanda, 5 € de descompte.')
        desc.append('Preu sense IVA. Fullet Crown tardor-hivern 2026 (vigència fins a gener 2027).')
        p = {
            'n': it['nom'], 'r': it['ref'], 'b': 'CROWN', 'p': it['preu'],
            'd': '\n\n'.join([' '.join(desc[:2])] + desc[2:]),
            's': it['seccio'].upper(), 'i': key, 'imgs': [key], 'u': '',
            'fam': cat, 'aplic': [], 'cat': cat, 'subcat': sid,
            'colorGroup': None, 'featured': None, 'star': 0, 'cost': None,
        }
        if it['ref'].startswith('CAB'):
            p['promoBateria'] = True
        products.append(p)
    return products, images


def nav_js(products, images):
    out = ['const NAV_CATEGORIES = [']
    for cat, nom, icon, subs in MENU:
        refs = [p for p in products if p['cat'] == cat]
        pick = [refs[0], refs[len(refs) // 2], refs[-1]] if len(refs) >= 3 else refs
        files = []
        for p in pick:
            f = os.path.join(CROWN, 'fotos', re.sub(r'[^\w\-]', '_', p['r']) + '.jpg')
            if os.path.exists(f) and f not in files:
                files.append(f)
        key = 'imatges/crown-menu-%s.jpg' % cat
        images[key] = menu_tile(files)
        subs_js = ',\n'.join("      { id:%s, nom:%s }" % (json.dumps(sid), json.dumps(sn, ensure_ascii=False))
                             for _, sid, sn in subs
                             if any(p['subcat'] == sid for p in products))
        out.append("  { id:%s, nom:%s, icon:%s, img:%s,\n    cats:[%s],\n    subcats:[\n%s\n    ]\n  },"
                   % (json.dumps(cat), json.dumps(nom, ensure_ascii=False), json.dumps(icon, ensure_ascii=False),
                      json.dumps(key), json.dumps(cat), subs_js))
    out.append('];')
    return '\n'.join(out)


def build_html():
    products, images = products_and_images()
    app = nexe.read_text(os.path.join(ROOT, 'src/js/app.js'))
    a = app.index('const NAV_CATEGORIES = [')
    b = app.index('\n];', a) + 3
    app = app[:a] + nav_js(products, images) + app[b:]
    # Sense ordre ni canvis integrats propis del catàleg NEXE
    app = re.sub(r'var _DEFAULT_ORDERS = \{.*?\};\n', 'var _DEFAULT_ORDERS = {};\n', app, count=1, flags=re.S)
    app = re.sub(r'\{\{firebase:(\w+)\}\}', '', app)
    app = app.replace("headerTitle.textContent = 'Nexe Catàleg'", "headerTitle.textContent = 'Catàleg Crown'")
    app = app.replace("var quickTerms = ['Disc','Adhesiu','Ventosa','Compresor','Lija'];",
                      "var quickTerms = ['Amoladora','Taladro','Batería','Martillo','Sierra'];")
    app = app.replace("'Generat amb Nexe Catàleg'", "'Generat amb Catàleg Crown · NEXE'")
    app = app.replace("lines.push('🧾 *PEDIDO NEXE*')", "lines.push('🧾 *PEDIDO NEXE · CROWN*')")

    template = nexe.read_text(nexe.TEMPLATE)
    template = template.replace('<head>', '<head>\n' + STORAGE_SHIM, 1)
    template = template.replace('content="Nexe Catàleg"', 'content="Catàleg Crown"')
    template = template.replace('<title>Nexe Catàleg</title>', '<title>Catàleg Crown</title>')
    template = template.replace('glow-text">Nexe Catàleg<', 'glow-text">Catàleg Crown<')
    template = template.replace('>Nexe Catàleg v1.0<', '>Catàleg Crown · NEXE<')
    template = template.replace('Catàleg comercial per a iPad', 'Màquines Crown · preus sense IVA')

    def include(m):
        if m.group(1) == 'src/js/app.js':
            return app
        return nexe.read_text(os.path.join(ROOT, m.group(1)))

    html = re.sub(r'\{\{include:([^}]+)\}\}', include, template)
    data = {
        'products': nexe.PRODUCTS_PREFIX + nexe.compact(products) + ';',
        'variant_groups': nexe.GROUPS_PREFIX + '[];',
        'clients': nexe.CLIENTS_HEADER + '[];\n',
        'images': nexe.IMAGES_PREFIX + nexe.compact(images) + ';',
    }
    html = re.sub(r'\{\{data:(\w+)\}\}', lambda m: data[m.group(1)], html)
    return html, len(products)


def icon(size, rx):
    c = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(c)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * rx), fill=(215, 25, 32))
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', int(size * 0.2))
    t = 'CROWN'
    w = d.textlength(t, font=f)
    d.text(((size - w) / 2, size * 0.30), t, fill='white', font=f)
    f2 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', int(size * 0.12))
    t2 = 'NEXE'
    w2 = d.textlength(t2, font=f2)
    d.text(((size - w2) / 2, size * 0.58), t2, fill=(255, 225, 225), font=f2)
    return c


def write_public(dest, html):
    os.makedirs(os.path.join(dest, 'icons'), exist_ok=True)
    for name, size, rx in (('icon-192.png', 192, .18), ('icon-512.png', 512, .18),
                           ('icon-maskable-512.png', 512, 0), ('apple-touch-icon.png', 180, 0)):
        im = icon(size, rx)
        if name == 'apple-touch-icon.png':
            bg = Image.new('RGB', im.size, (215, 25, 32))
            bg.paste(im, mask=im.split()[-1])
            im = bg
        im.save(os.path.join(dest, 'icons', name))
    man = json.load(open(os.path.join(nexe.PUBLIC, 'manifest.json'), encoding='utf-8'))
    man.update({'name': 'Catàleg Crown', 'short_name': 'Crown',
                'description': 'Màquines Crown amb preus NEXE', 'theme_color': '#d71920'})
    nexe.write_text(os.path.join(dest, 'manifest.json'), json.dumps(man, ensure_ascii=False, indent=2) + '\n')
    version = hashlib.sha256(html.encode('utf-8')).hexdigest()[:12]
    sw = nexe.read_text(os.path.join(nexe.PUBLIC, 'sw.js'))
    sw = sw.replace('nexe-cataleg-', 'crown-cataleg-').replace('__BUILD_VERSION__', version)
    sw = sw.replace("'./fotos-extra.js', ", '').replace("var OTHER_APPS = ['crown/'];", "var OTHER_APPS = [];")
    sw = sw.replace("['./index.html', './fotos-extra.js']", "['./index.html', './index.html']")
    nexe.write_text(os.path.join(dest, 'sw.js'), sw)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--out', help='Només un fitxer HTML (p. ex. per a l\'app Documents)')
    ap.add_argument('--site', help='Carpeta on deixar l\'app completa (per defecte dist/crown)')
    a = ap.parse_args()
    html, n = build_html()
    out = a.out or os.path.join(a.site or os.path.join(nexe.DIST, 'crown'), 'index.html')
    nexe.write_text(out, html)
    if not a.out:
        write_public(os.path.dirname(out), html)
    print('Catàleg Crown: %s (%d màquines, %.1f MB)' % (os.path.relpath(out), n, len(html.encode()) / 1e6))


if __name__ == '__main__':
    main()
