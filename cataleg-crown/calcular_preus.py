#!/usr/bin/env python3
"""
Preus NEXE de les màquines Crown a partir dels costos (preu net del fullet).

  python3 cataleg-crown/calcular_preus.py [private/crown_netos_2026.xlsx]

Regles:
  - Ports (recàrrec) segons el tipus de maquines.txt: C +10, M +5, P +10, B +5, I +5.
    Carregadors (CAC/CAU): sense ports.
  - Si el cost de la màquina és de 300 € o més, no porta ports (el proveïdor no en cobra).
  - Preu = preu del fullet + ports, però mai per sota de cost / 0,7 (30 % de marge
    sobre el preu de venda) + ports. Si cal pujar-lo, s'arrodoneix amunt a ,90.

Escriu:
  cataleg-crown/preus_nexe.json   (públic: preu i ports de cada referència, sense costos)
  private/crown_costos.json       (privat: cost de cada referència)
  dist/Crown_marges.csv           (privat: taula per revisar marges)
"""
import csv
import json
import math
import os
import re
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
ARREL = os.path.dirname(AQUI)
sys.path.insert(0, AQUI)
import generar_pdf as gp  # noqa: E402

LLINDAR_PORTS = 300.0
MARGE_MIN = 0.30
PVP_SENSE_MINIM = 500.0
# Referència del catàleg -> referència de l'Excel quan no coincideixen
ALIES = {
    'CT21129HBX-2C1 BMC': 'CT21129HBX-2C1B', 'CT21151HMX-2C1 BMC': 'CT21151HMX-2C1',
    'CT22060-5IMC': 'CT22060HX-5IMC', 'CT28001HX-4 IMC': 'CT28001HX-4BMC',
    'CAB208016XE CB': 'CAB208016XE', 'CT13677-125RSVC': 'CT13677-125RSV',
    'CT13678-125RSVC': 'CT13678-125RSV', 'SET CROWN 10': 'SET 10',
    'XL35 MAG-BOR': 'XL35', 'MB38 MAG-BOR': 'MB38', 'MB50 MAG-BOR': 'MB50', 'MB100 MAG-BOR': 'MB100',
}
N = lambda s: re.sub(r'[^A-Z0-9]', '', str(s).upper())


def amunt_90(x):
    """Arrodoneix amunt al primer preu acabat en ,90 o ,00."""
    x = math.ceil(x * 100 - 1e-6) / 100
    f = math.floor(x)
    for c in (f, f + 0.9, f + 1):
        if c >= x - 1e-9:
            return round(c, 2)


def llegir_costos(xlsx):
    import openpyxl
    ws = openpyxl.load_workbook(xlsx, data_only=True).active
    out = {}
    for r in ws.iter_rows(min_row=3, values_only=True):
        if r[0] is not None and isinstance(r[4], (int, float)):
            out[N(r[0])] = float(r[4])
    return out


def main():
    xlsx = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ARREL, 'private', 'crown_netos_2026.xlsx')
    costos_x = llegir_costos(xlsx)
    items = gp.llegir(sense_preus_nexe=True)
    preus, costos, files, falten = {}, {}, [], []
    for it in items:
        cost = costos_x.get(N(ALIES.get(it['ref'], it['ref'])))
        fix = it['ref'] in gp.PREU_FIX or it['ref'].startswith(gp.PREU_FIX_PREFIXOS)
        if cost is None:
            falten.append(it['ref'])
            continue
        ports = 0 if (fix or cost >= LLINDAR_PORTS) else gp.RECARREC[it['tipus']]
        base = round(it['fullet'] + ports, 2)
        minim = amunt_90(cost / (1 - MARGE_MIN)) + ports
        # Màquines de més de 500 € al fullet: es manté el preu del catàleg encara que no arribi al 30 %
        preu = base if it['fullet'] > PVP_SENSE_MINIM else max(base, round(minim, 2))
        preus[it['ref']] = {'preu': preu, 'ports': ports}
        costos[it['ref']] = cost
        files.append([it['ref'], it['nom'], it['tipus'], cost, it['fullet'], ports, preu,
                      round((preu - ports - cost) / (preu - ports) * 100, 1),
                      'pujat al mínim' if preu > base else ''])
    json.dump(preus, open(os.path.join(AQUI, 'preus_nexe.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    os.makedirs(os.path.join(ARREL, 'private'), exist_ok=True)
    json.dump(costos, open(os.path.join(ARREL, 'private', 'crown_costos.json'), 'w'), indent=1)
    os.makedirs(os.path.join(ARREL, 'dist'), exist_ok=True)
    with open(os.path.join(ARREL, 'dist', 'Crown_marges.csv'), 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.writer(f, delimiter=';')
        w.writerow(['Referència', 'Nom', 'Tipus', 'Cost', 'PVP fullet', 'Ports', 'Preu NEXE', 'Marge % (sense ports)', 'Nota'])
        for r in files:
            w.writerow([str(x).replace('.', ',') if isinstance(x, float) else x for x in r])
    print('%d preus calculats, %d pujats al mínim del 30 %%, %d sense ports per cost >= 300 €' % (
        len(preus), sum(1 for r in files if r[8]), sum(1 for r in files if r[5] == 0 and not (r[0].startswith(gp.PREU_FIX_PREFIXOS)))))
    if falten:
        print('Sense cost a l\'Excel (es queden amb la regla de sempre):', ', '.join(falten))


if __name__ == '__main__':
    main()
