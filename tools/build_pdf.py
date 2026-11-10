#!/usr/bin/env python3
"""
Genera el PDF d'emergència del Catàleg NEXE: tots els productes visibles,
per categories, amb foto, referència, preu de venda i variants.

  python3 tools/build_pdf.py
  python3 tools/build_pdf.py --overrides nexe-overrides-2026-11-10.json
  python3 tools/build_pdf.py --out Cataleg_NEXE.pdf

El PDF surt exactament del mateix catàleg que es veu a la pantalla: el script
obre el catàleg en un navegador sense finestra (Chromium via Playwright),
recorre cada categoria i llegeix les fitxes en l'ordre en què es mostren,
amb els productes eliminats, els grups de variants i l'ordre ja aplicats.

--overrides aplica un fitxer JSON exportat des del mode edició (botó 💾)
abans de generar el PDF, per incloure canvis que encara no s'han integrat.

Mai inclou dades privades: es construeix sempre la versió pública.

Requisits (un sol cop):
  pip install playwright reportlab pillow
  python3 -m playwright install chromium
"""
import argparse
import base64
import datetime
import hashlib
import io
import json
import os
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import nexe  # noqa: E402

try:
    from PIL import Image as PILImage
    from playwright.sync_api import sync_playwright
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.lib.utils import ImageReader
    from reportlab.platypus import (Image, KeepTogether, PageBreak, Paragraph,
                                    SimpleDocTemplate, Spacer, Table, TableStyle)
except ImportError as e:  # pragma: no cover
    sys.exit('Falta una dependència (%s).\nInstal·la-les amb:\n'
             '  pip install playwright reportlab pillow\n'
             '  python3 -m playwright install chromium' % e.name)

# Codi que s'injecta (només a la còpia temporal) per llegir el que mostra la pantalla.
HOOK = r"""
window.__nexePdf = {
  nav: function(){ return NAV_CATEGORIES.map(function(c){ return {id:c.id, nom:c.nom}; }); },
  collect: function(){
    function ov(i){ return _editOverrides[i] || {}; }
    function price(i){ var o = ov(i); return o.price !== undefined ? parseFloat(o.price) : (parseFloat(PRODS[i].p) || 0); }
    function variants(i){
      var p = PRODS[i], o = ov(i), out = [];
      if(p.insemacVariants && p.insemacVariants.length){
        p.insemacVariants.forEach(function(v, k){
          var pr = (o.variantPrices && o.variantPrices[k] !== undefined) ? o.variantPrices[k] : v.price;
          out.push({label: String(v.label || ''), price: parseFloat(pr) || 0});
        });
      } else if(p.variants && p.variants.length){
        p.variants.forEach(function(v){ out.push({label: String(v.size || v.ref || ''), price: parseFloat(v.price) || 0}); });
      }
      return out;
    }
    var grid = document.getElementById('categoryGrid'), out = [];
    [].forEach.call(grid.children, function(c){
      var gid = c.getAttribute('data-group'), idx = c.getAttribute('data-idx');
      if(gid){
        var def = getVariantGroupDef(gid) || {};
        var mem = getVariantProducts(gid).filter(function(m){ return !(ov(m.idx).deleted); });
        if(!mem.length) return;
        out.push({type:'group', name: def.name || def.base || '', brand: def.brand || mem[0].p.b || '',
                  img: getImgSrc(mem[0].p, mem[0].idx),
                  variants: mem.map(function(m){
                    return {label: getVariantMemberLabel(m, def), ref: m.p.r || '', price: price(m.idx)};
                  })});
      } else if(idx !== null && PRODS[+idx]){
        var i = +idx, p = PRODS[i], o = ov(i);
        out.push({type:'product', name: o.name !== undefined ? o.name : p.n,
                  brand: o.brand !== undefined ? o.brand : (p.b || ''),
                  ref: o.ref !== undefined ? o.ref : (p.r || ''),
                  img: getImgSrc(p, i), price: price(i), variants: variants(i)});
      }
    });
    return out;
  }
};
"""
ANCHOR = 'window._app = {'

ORANGE = colors.HexColor('#ff6b35')
INK = colors.HexColor('#1d1d1f')
GREY = colors.HexColor('#6e6e73')
LINE = colors.HexColor('#e5e5ea')


def eur(v):
    s = '{:,.2f}'.format(v).replace(',', 'X').replace('.', ',').replace('X', '.')
    return s + ' €'


def extract(overrides=None):
    html = nexe.build_html(use_private=False)
    if html.count(ANCHOR) != 1:
        sys.exit('No es troba el punt d\'injecció "%s" a src/js/app.js' % ANCHOR)
    html = html.replace(ANCHOR, HOOK + ANCHOR)
    tmp = tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8')
    tmp.write(html)
    tmp.close()
    init = None
    if overrides:
        data = json.load(open(overrides, encoding='utf-8'))
        custom = data.pop('_customProducts', None)
        init = 'localStorage.setItem("nexe_edit_overrides", %s);' % json.dumps(json.dumps(data))
        if custom:
            init += 'localStorage.setItem("nexe_custom_products", %s);' % json.dumps(json.dumps(custom))
    result = []
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={'width': 1024, 'height': 900})
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            if init:
                page.add_init_script(init)
            url = 'file://' + tmp.name
            page.goto(url)
            page.wait_for_function('window.__nexePdf && document.querySelectorAll(".family-tile").length > 0',
                                   timeout=60000)
            nav = page.evaluate('window.__nexePdf.nav()')
            for k, cat in enumerate(nav):
                page.goto(url)
                page.wait_for_function('document.querySelectorAll(".family-tile").length > %d' % k,
                                       timeout=60000)
                page.locator('.family-tile').nth(k).click()
                page.wait_for_timeout(600)
                cards = page.evaluate('window.__nexePdf.collect()')
                result.append({'id': cat['id'], 'nom': cat['nom'], 'cards': cards})
                print('  %-28s %3d fitxes' % (cat['nom'], len(cards)))
            browser.close()
            if errors:
                print('Avís: errors de JavaScript al catàleg:', errors[:3])
    finally:
        os.unlink(tmp.name)
    return result


_img_cache = {}


def image_flowable(src, box_w, box_h):
    if not src or not src.startswith('data:image/') or 'svg' in src[:20]:
        return None
    key = hashlib.md5(src.encode()).hexdigest()
    if key not in _img_cache:
        try:
            raw = base64.b64decode(src.split(',', 1)[1])
            im = PILImage.open(io.BytesIO(raw)).convert('RGB')
            im.thumbnail((360, 360))
            buf = io.BytesIO()
            im.save(buf, 'JPEG', quality=78)
            buf.seek(0)
            _img_cache[key] = (buf.getvalue(), im.size)
        except Exception:
            _img_cache[key] = None
    if not _img_cache[key]:
        return None
    data, (w, h) = _img_cache[key]
    scale = min(box_w / w, box_h / h)
    return Image(io.BytesIO(data), width=w * scale, height=h * scale)


def card_flowables(card, width, st):
    out = []
    img = image_flowable(card.get('img'), width, 30 * mm)
    out.append(img if img else Spacer(1, 30 * mm))
    out.append(Spacer(1, 2 * mm))
    if card.get('brand'):
        out.append(Paragraph(nexe_escape(card['brand']).upper(), st['brand']))
    out.append(Paragraph(nexe_escape(card['name']), st['name']))
    variants = card.get('variants') or []
    if card.get('ref') and not (card['type'] == 'group'):
        out.append(Paragraph('Ref. ' + nexe_escape(card['ref']), st['ref']))
    if variants:
        prices = [v['price'] for v in variants if v['price']]
        if prices and len(set(prices)) == 1:
            out.append(Paragraph(eur(prices[0]), st['price']))
            labels = ', '.join(nexe_escape(v['label']) for v in variants)
            out.append(Paragraph('%d opcions: %s' % (len(variants), labels), st['var']))
        else:
            if prices:
                out.append(Paragraph('des de ' + eur(min(prices)), st['price']))
            rows = []
            for v in variants:
                label = nexe_escape(v['label'])
                if v.get('ref') and v['ref'] not in v['label']:
                    label += ' <font color="#8e8e93">(%s)</font>' % nexe_escape(v['ref'])
                rows.append([Paragraph(label, st['var']),
                             Paragraph(eur(v['price']) if v['price'] else '—', st['varp'])])
            t = Table(rows, colWidths=[width - 15 * mm, 15 * mm])
            t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'),
                                   ('LEFTPADDING', (0, 0), (-1, -1), 0),
                                   ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                                   ('TOPPADDING', (0, 0), (-1, -1), 0.3),
                                   ('BOTTOMPADDING', (0, 0), (-1, -1), 0.3),
                                   ('LINEBELOW', (0, 0), (-1, -2), 0.25, LINE)]))
            out.append(t)
    else:
        out.append(Paragraph(eur(card['price']) if card.get('price') else 'Preu a consultar', st['price']))
    return out


def nexe_escape(s):
    return (str(s or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            .replace('\n', ' '))


def build_pdf(catalog, out_path):
    st = {
        'brand': ParagraphStyle('brand', fontName='Helvetica-Bold', fontSize=6, leading=7.5, textColor=GREY),
        'name': ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=8, leading=9.6, textColor=INK),
        'ref': ParagraphStyle('ref', fontName='Courier', fontSize=6.3, leading=7.6, textColor=GREY),
        'price': ParagraphStyle('price', fontName='Helvetica-Bold', fontSize=9, leading=11.5,
                                textColor=ORANGE, spaceBefore=1),
        'var': ParagraphStyle('var', fontName='Helvetica', fontSize=6.2, leading=7.4, textColor=INK),
        'varp': ParagraphStyle('varp', fontName='Helvetica-Bold', fontSize=6.2, leading=7.4,
                               textColor=INK, alignment=2),
        'h1': ParagraphStyle('h1', fontName='Helvetica-Bold', fontSize=20, leading=24, textColor=INK),
        'kicker': ParagraphStyle('k', fontName='Helvetica-Bold', fontSize=8, leading=10,
                                 textColor=ORANGE),
        'cover': ParagraphStyle('c', fontName='Helvetica-Bold', fontSize=34, leading=40,
                                textColor=INK, alignment=TA_CENTER),
        'coversub': ParagraphStyle('cs', fontName='Helvetica', fontSize=11, leading=15,
                                   textColor=GREY, alignment=TA_CENTER),
        'toc': ParagraphStyle('t', fontName='Helvetica', fontSize=11, leading=17, textColor=INK),
    }
    today = datetime.date.today().strftime('%d/%m/%Y')
    page_w, page_h = A4
    margin = 13 * mm
    cols = 3
    gap = 5 * mm
    col_w = (page_w - 2 * margin - (cols - 1) * gap) / cols

    story = [Spacer(1, 70 * mm), Paragraph('Nexe Catàleg', st['cover']), Spacer(1, 6 * mm),
             Paragraph('Còpia d\'emergència en PDF · ' + today, st['coversub']), Spacer(1, 18 * mm)]
    total = sum(len(c['cards']) for c in catalog)
    toc = ['%s <font color="#8e8e93">· %d fitxes</font>' % (nexe_escape(c['nom']), len(c['cards']))
           for c in catalog if c['cards']]
    story.append(Table([[Paragraph(t, st['toc'])] for t in toc], colWidths=[90 * mm], hAlign='CENTER'))
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph('%d fitxes en total. Preus de venda.' % total, st['coversub']))

    for cat in catalog:
        if not cat['cards']:
            continue
        story.append(PageBreak())
        story.append(Paragraph('CATEGORIA', st['kicker']))
        story.append(Paragraph(nexe_escape(cat['nom']), st['h1']))
        story.append(Spacer(1, 5 * mm))
        cards = cat['cards']
        for r in range(0, len(cards), cols):
            row = [card_flowables(c, col_w - 6, st) for c in cards[r:r + cols]]
            while len(row) < cols:
                row.append('')
            t = Table([row], colWidths=[col_w] * cols)
            t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'),
                                   ('LEFTPADDING', (0, 0), (-1, -1), 3),
                                   ('RIGHTPADDING', (0, 0), (-1, -1), 3),
                                   ('TOPPADDING', (0, 0), (-1, -1), 4),
                                   ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                                   ('LINEBELOW', (0, 0), (-1, -1), 0.4, LINE)]))
            story.append(KeepTogether(t))

    def on_page(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 7)
        canvas.setFillColor(GREY)
        canvas.drawString(margin, 8 * mm, 'Nexe Catàleg · ' + today)
        canvas.drawRightString(page_w - margin, 8 * mm, 'Pàgina %d' % doc.page)
        canvas.restoreState()

    doc = SimpleDocTemplate(out_path, pagesize=A4, leftMargin=margin, rightMargin=margin,
                            topMargin=margin, bottomMargin=15 * mm,
                            title='Nexe Catàleg', author='NEXE')
    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    return total


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--out', default=os.path.join(nexe.DIST, 'Cataleg_NEXE.pdf'))
    ap.add_argument('--overrides', help='JSON exportat des del mode edició')
    ap.add_argument('--dump', help='Desa també les dades extretes en JSON (per revisar-les)')
    args = ap.parse_args()
    print('Llegint el catàleg…')
    catalog = extract(args.overrides)
    if args.dump:
        slim = [{'nom': c['nom'], 'cards': [{k: v for k, v in card.items() if k != 'img'}
                                            for card in c['cards']]} for c in catalog]
        json.dump(slim, open(args.dump, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    total = build_pdf(catalog, args.out)
    print('PDF generat: %s (%d fitxes, %.1f MB)' % (args.out, total, os.path.getsize(args.out) / 1e6))


if __name__ == '__main__':
    main()
