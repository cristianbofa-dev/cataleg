#!/usr/bin/env python3
"""
Catàleg de màquines Crown (fullet tardor-hivern 2026) amb preus NEXE.

  python3 cataleg-crown/generar_pdf.py            # -> dist/Cataleg_Crown_NEXE.pdf
  python3 cataleg-crown/generar_pdf.py --llista   # també dist/Crown_preus.csv

Preu de venda = preu del fullet (€ + IVA) + ports, segons el tipus de
maquines.txt:
  C  elèctrica de cable                 +10 €
  M  màquina a bateria                   +5 €
  P  pack màquina + bateria              +10 €
  B  bateria, carregador o kit recàrrega  +5 €
  I  instrument de mesura a piles         +5 €
(Excepció: els preus de PREU_FIX es posen tal com diu el fullet.)

Requisits: pip3 install reportlab pillow
"""
import argparse
import csv
import datetime
import os
import re

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (Image, KeepTogether, PageBreak, Paragraph,
                                SimpleDocTemplate, Spacer, Table, TableStyle)

AQUI = os.path.dirname(os.path.abspath(__file__))
ARREL = os.path.dirname(AQUI)
RECARREC = {'C': 10, 'M': 5, 'P': 10, 'B': 5, 'I': 5}
PREU_FIX = {'CAC204001X'}  # es venen a preu de fullet, sense ports

GRUPS = [
    ('EINES A BATERIA', ('M', 'P')),
    ('BATERIES, CARREGADORS I KITS D\'ENERGIA', ('B',)),
    ('EINES ELÈCTRIQUES DE CABLE', ('C',)),
    ('MESURA I LÀSER', ('I',)),
]

VERMELL = colors.HexColor('#d71920')
TINTA = colors.HexColor('#1d1d1f')
GRIS = colors.HexColor('#6e6e73')
LINIA = colors.HexColor('#e5e5ea')


def llegir():
    items = []
    with open(os.path.join(AQUI, 'maquines.txt'), encoding='utf-8') as f:
        for l in f:
            l = l.strip()
            if not l or l.startswith('#'):
                continue
            pag, ref, nom, preu, tipus, seccio = l.split('|')
            preu = float(preu)
            venda = preu if ref in PREU_FIX else preu + RECARREC[tipus]
            items.append({'pag': int(pag), 'ref': ref, 'nom': nom, 'fullet': preu,
                          'tipus': tipus, 'seccio': seccio, 'preu': round(venda, 2),
                          'foto': os.path.join(AQUI, 'fotos', re.sub(r'[^\w\-]', '_', ref) + '.jpg')})
    return items


def eur(v):
    return '{:,.2f}'.format(v).replace(',', 'X').replace('.', ',').replace('X', '.') + ' €'


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def targeta(it, amplada, st):
    out = []
    if os.path.exists(it['foto']):
        from PIL import Image as PI
        w, h = PI.open(it['foto']).size
        k = min(amplada / w, 34 * mm / h)
        out.append(Image(it['foto'], width=w * k, height=h * k))
    else:
        out.append(Spacer(1, 34 * mm))
    out.append(Spacer(1, 2 * mm))
    out.append(Paragraph(esc(it['ref']), st['ref']))
    out.append(Paragraph(esc(it['nom']), st['nom']))
    etiqueta = {'P': 'Pack amb bateria', 'B': None, 'M': None, 'C': None, 'I': None}[it['tipus']]
    if etiqueta:
        out.append(Paragraph(etiqueta, st['etq']))
    out.append(Paragraph(eur(it['preu']), st['preu']))
    return out


def construir(items, sortida):
    st = {
        'ref': ParagraphStyle('ref', fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=VERMELL),
        'nom': ParagraphStyle('nom', fontName='Helvetica', fontSize=7.6, leading=9.4, textColor=TINTA),
        'etq': ParagraphStyle('etq', fontName='Helvetica-Bold', fontSize=6.2, leading=8, textColor=GRIS),
        'preu': ParagraphStyle('preu', fontName='Helvetica-Bold', fontSize=11, leading=14, textColor=TINTA, spaceBefore=2),
        'h1': ParagraphStyle('h1', fontName='Helvetica-Bold', fontSize=20, leading=24, textColor=TINTA),
        'h2': ParagraphStyle('h2', fontName='Helvetica-Bold', fontSize=11.5, leading=15, textColor=VERMELL, spaceBefore=6),
        'kick': ParagraphStyle('k', fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=VERMELL),
        'cov': ParagraphStyle('c', fontName='Helvetica-Bold', fontSize=34, leading=40, textColor=TINTA, alignment=1),
        'covs': ParagraphStyle('cs', fontName='Helvetica', fontSize=12, leading=17, textColor=GRIS, alignment=1),
        'toc': ParagraphStyle('t', fontName='Helvetica', fontSize=11, leading=17, textColor=TINTA),
    }
    W, H = A4
    marge = 13 * mm
    cols, gap = 4, 4 * mm
    cw = (W - 2 * marge - (cols - 1) * gap) / cols
    avui = datetime.date.today().strftime('%d/%m/%Y')

    story = [Spacer(1, 62 * mm), Paragraph('Màquines Crown', st['cov']), Spacer(1, 5 * mm),
             Paragraph('Catàleg NEXE · Tardor-hivern 2026', st['covs']),
             Paragraph('Preus sense IVA · Vigència fins a gener 2027 o fins a exhaurir existències', st['covs']),
             Spacer(1, 16 * mm)]
    toc = []
    for titol, tipus in GRUPS:
        n = sum(1 for i in items if i['tipus'] in tipus)
        if n:
            toc.append([Paragraph('%s <font color="#8e8e93">· %d</font>' % (esc(titol.capitalize()), n), st['toc'])])
    story.append(Table(toc, colWidths=[110 * mm], hAlign='CENTER'))

    for titol, tipus in GRUPS:
        grup = [i for i in items if i['tipus'] in tipus]
        if not grup:
            continue
        story.append(PageBreak())
        story.append(Paragraph('CROWN', st['kick']))
        story.append(Paragraph(esc(titol), st['h1']))
        seccions = []
        for i in grup:
            if i['seccio'] not in seccions:
                seccions.append(i['seccio'])
        for sec in seccions:
            fila = [i for i in grup if i['seccio'] == sec]
            bloc = [Paragraph(esc(sec), st['h2']), Spacer(1, 1.5 * mm)]
            files = []
            for k in range(0, len(fila), cols):
                r = [targeta(i, cw - 6, st) for i in fila[k:k + cols]]
                r += [''] * (cols - len(r))
                files.append(r)
            for n, r in enumerate(files):
                t = Table([r], colWidths=[cw] * cols)
                t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'),
                                       ('LEFTPADDING', (0, 0), (-1, -1), 3),
                                       ('RIGHTPADDING', (0, 0), (-1, -1), 3),
                                       ('TOPPADDING', (0, 0), (-1, -1), 4),
                                       ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                                       ('LINEBELOW', (0, 0), (-1, -1), 0.4, LINIA)]))
                if n == 0:
                    story.append(KeepTogether(bloc + [t]))
                else:
                    story.append(KeepTogether(t))

    def peu(c, doc):
        c.saveState()
        c.setFont('Helvetica', 7)
        c.setFillColor(GRIS)
        c.drawString(marge, 8 * mm, 'NEXE · Màquines Crown · Preus sense IVA · ' + avui)
        c.drawRightString(W - marge, 8 * mm, 'Pàgina %d' % doc.page)
        c.restoreState()

    doc = SimpleDocTemplate(sortida, pagesize=A4, leftMargin=marge, rightMargin=marge,
                            topMargin=marge, bottomMargin=15 * mm, title='Màquines Crown — NEXE', author='NEXE')
    doc.build(story, onFirstPage=peu, onLaterPages=peu)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(ARREL, 'dist', 'Cataleg_Crown_NEXE.pdf'))
    ap.add_argument('--llista', action='store_true', help='Desa també un CSV amb els preus')
    a = ap.parse_args()
    items = llegir()
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    construir(items, a.out)
    print('PDF: %s (%d màquines)' % (a.out, len(items)))
    if a.llista:
        csvp = os.path.join(os.path.dirname(os.path.abspath(a.out)), 'Crown_preus.csv')
        with open(csvp, 'w', newline='', encoding='utf-8-sig') as f:
            w = csv.writer(f, delimiter=';')
            w.writerow(['Referència', 'Nom', 'Tipus', 'Preu fullet', 'Ports', 'Preu NEXE', 'Pàgina fullet'])
            for i in items:
                w.writerow([i['ref'], i['nom'], i['tipus'], ('%.2f' % i['fullet']).replace('.', ','),
                            ('%.2f' % (i['preu'] - i['fullet'])).replace('.', ','),
                            ('%.2f' % i['preu']).replace('.', ','), i['pag']])
        print('CSV: %s' % csvp)


if __name__ == '__main__':
    main()
