#!/usr/bin/env python3
"""
Catàleg per a clients: el catàleg general de NEXE SENSE PREUS, on el client
omple les seves dades i envia la comanda per WhatsApp al comercial.

  python3 tools/client_app.py                  # -> dist/clients/ (app instal·lable)
  python3 tools/client_app.py --site carpeta   # en una altra carpeta

Què el diferencia del catàleg intern:
- Els preus no hi són: es treuen de les dades (no només de la pantalla), de
  manera que no es poden veure ni mirant el codi de la pàgina. També es
  treuen les frases de les descripcions i variants que porten preus (€).
- Sense pestanya Clients, sense mode edició ni dades privades.
- La comanda demana nom, empresa, telèfon i població i s'envia per WhatsApp
  al número de WHATSAPP (sense preus ni totals).
- Memòria del navegador i service worker propis: no es barreja amb les
  apps NEXE i Crown si s'obren al mateix dispositiu.
"""
import argparse
import hashlib
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import nexe  # noqa: E402

WHATSAPP = '34610732047'          # número que rep les comandes (amb prefix 34)
WHATSAPP_TXT = '610 73 20 47'

PRICE_KEYS = {'p', 'price', 'cost', '_origPrice', 'pvp', 'preu', 'variantPrices'}
PRICE_RE = re.compile(r'\s*[:·\-–(]?\s*\d{1,5}(?:[.,]\d{1,2})?\s*€(?:\s*/\s*[\wàèéíòóúç]+)?\)?')

STORAGE_SHIM = """<script>/* Catàleg clients: memòria del navegador separada de les altres apps */
(function(){try{var P='clients_',S=Storage.prototype,L=window.localStorage;
['getItem','setItem','removeItem'].forEach(function(m){var o=S[m];S[m]=function(k){var a=Array.prototype.slice.call(arguments);
if(this===L&&typeof k==='string'&&k.indexOf(P)!==0)a[0]=P+k;return o.apply(this,a);};});}catch(e){}})();</script>"""

CLIENT_CSS = """
/* ── Catàleg per a clients: sense preus ── */
.nav-item[data-page="clients"], #btnEditMode, #orderPanelClient, .order-total-row,
.order-item-price, .order-item-subtotal, .order-item-variant-price, .order-promo,
#cartBarTotal, .cart-bar-client, .fav-btn ~ .price:empty, .prod-card .price, .search-result-item .price,
.edit-only { display:none !important; }
.prod-detail .price:empty, .variant-detail .price:empty, #vgPrice:empty { display:block; font-size:0; }
.prod-detail .price:empty::before, .variant-detail .price:empty::before, #vgPrice:empty::before {
  content:'Preu segons la teva tarifa'; font-size:15px; font-weight:600; color:#6e6e73; }
.client-form { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:4px 0 10px; }
.client-form input { width:100%; box-sizing:border-box; height:42px; padding:0 12px; border-radius:10px;
  border:1px solid rgba(0,0,0,.12); background:#fff; font:15px -apple-system,system-ui,sans-serif; color:#1d1d1f; }
.client-form input.err { border-color:#d70015; background:#fff2f2; }
.client-form .full { grid-column:1 / -1; }
.client-form-title { font-weight:700; font-size:15px; margin:2px 0 6px; }
.client-form-note { font-size:12px; color:#6e6e73; margin:-2px 0 8px; }
body.presentation .client-form input { background:#2c2c2e; color:#f5f5f7; border-color:rgba(255,255,255,.15); }
#orderShare.wa { background:#25d366 !important; color:#fff !important; }
"""

CLIENT_JS = r"""
/* ── Catàleg per a clients: comanda per WhatsApp ── */
var CLIENT_WA = '__WA__';
function _clientData(){
  try { return JSON.parse(localStorage.getItem('client_dades') || '{}'); } catch(e){ return {}; }
}
function _clientSaveData(){
  var d = {};
  ['nom','empresa','tel','poblacio'].forEach(function(k){
    var el = document.getElementById('cf_'+k); if(el) d[k] = el.value.trim();
  });
  try { localStorage.setItem('client_dades', JSON.stringify(d)); } catch(e){}
  return d;
}
function _clientInitForm(){
  var footer = document.getElementById('orderPanelFooter');
  if(!footer || document.getElementById('clientForm')) return;
  var d = _clientData();
  var box = document.createElement('div');
  box.id = 'clientForm';
  box.innerHTML = '<div class="client-form-title">Les teves dades</div>'
    + '<div class="client-form-note">Rebràs la confirmació i el preu de la comanda del teu comercial.</div>'
    + '<div class="client-form">'
    + '<input id="cf_nom" placeholder="Nom i cognoms *" autocomplete="name">'
    + '<input id="cf_empresa" placeholder="Empresa *" autocomplete="organization">'
    + '<input id="cf_tel" placeholder="Telèfon *" type="tel" autocomplete="tel">'
    + '<input id="cf_poblacio" placeholder="Població" autocomplete="address-level2">'
    + '</div>';
  footer.insertBefore(box, footer.firstChild);
  ['nom','empresa','tel','poblacio'].forEach(function(k){
    var el = document.getElementById('cf_'+k);
    el.value = d[k] || '';
    el.addEventListener('input', function(){ this.classList.remove('err'); _clientSaveData(); });
  });
  var share = document.getElementById('orderShare');
  if(share){ share.textContent = 'Enviar per WhatsApp'; share.classList.add('wa'); }
  var notes = document.getElementById('orderNotes');
  if(notes) notes.placeholder = 'Observacions (lloc d\'entrega, urgència…)';
}
function _clientSendWhatsApp(){
  if(!orderItems.length) return;
  var d = _clientSaveData(), missing = [];
  [['nom','cf_nom'],['empresa','cf_empresa'],['tel','cf_tel']].forEach(function(f){
    if(!d[f[0]]){ missing.push(f[1]); document.getElementById(f[1]).classList.add('err'); }
  });
  if(missing.length){ document.getElementById(missing[0]).focus(); return; }
  var L = [];
  L.push('🧾 *COMANDA — CATÀLEG NEXE*');
  L.push('👤 ' + d.nom);
  L.push('🏢 ' + d.empresa);
  L.push('📞 ' + d.tel);
  if(d.poblacio) L.push('📍 ' + d.poblacio);
  L.push('━━━━━━━━━━━━━━');
  for(var i=0;i<orderItems.length;i++){
    var it = orderItems[i], p = PRODS[it.idx];
    if(!p) continue;
    L.push('▸ *' + (p.n||'') + '*');
    if(it.variantLabel) L.push('   ' + it.variantLabel);
    L.push('   Ref: ' + (p.r||'—') + '  ·  Quantitat: ' + it.qty);
    if(it.notes) L.push('   📝 ' + it.notes);
  }
  L.push('━━━━━━━━━━━━━━');
  if(orderNotes) L.push('📌 ' + orderNotes);
  L.push('Enviat des del catàleg NEXE');
  var url = 'https://wa.me/' + CLIENT_WA + '?text=' + encodeURIComponent(L.join('\n'));
  var a = document.createElement('a');
  a.href = url; a.target = '_blank'; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
  _clientToast('S\'obre WhatsApp amb la comanda: prem Enviar per fer-la arribar.');
}
function _clientToast(t){
  var el = document.createElement('div');
  el.textContent = t;
  el.style.cssText = 'position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:10000;background:#1d1d1f;color:#fff;padding:12px 20px;border-radius:14px;font:600 15px -apple-system,system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.25);max-width:90vw;text-align:center';
  document.body.appendChild(el); setTimeout(function(){ el.remove(); }, 5000);
}
document.addEventListener('DOMContentLoaded', _clientInitForm);
if(document.readyState !== 'loading') _clientInitForm();
"""


def strip_prices(obj):
    """Treu tots els camps de preu i les mencions de preus dins dels textos."""
    if isinstance(obj, dict):
        for k in list(obj):
            if k in PRICE_KEYS:
                obj[k] = '' if k in ('p', 'price') else None
            else:
                obj[k] = strip_prices(obj[k])
        return obj
    if isinstance(obj, list):
        return [strip_prices(x) for x in obj]
    if isinstance(obj, str) and '€' in obj:
        lines = []
        for line in obj.split('\n'):
            if '€' not in line:
                lines.append(line)
                continue
            # Frases senceres sobre preus fora; si no, només el fragment del preu
            if re.search(r'(?i)\b(preu|precio|pvp|a partir de|descompte|promoci)', line):
                continue
            line = PRICE_RE.sub('', line).rstrip(' ·-–:,')
            if line.strip():
                lines.append(line)
        return re.sub(r'\n{3,}', '\n\n', '\n'.join(lines)).strip()
    return obj


def build(dest):
    extra = []
    html = nexe.build_html(use_private=False, light=(520, 70), extras_mode='bundle', extra_files=extra)

    # Productes sense preus
    a = html.index(nexe.PRODUCTS_PREFIX) + len(nexe.PRODUCTS_PREFIX)
    b = html.index('\n', a)
    while html[b - 1] != ';':
        b -= 1
    b -= 1  # posició del ';' final
    products = json.loads(html[a:b])
    products = strip_prices(products)
    for p in products:
        p.pop('promoBateria', None)
    html = html[:a] + nexe.compact(products) + html[b:]

    # Codi: preus buits i comanda per WhatsApp
    def rep(old, new):
        nonlocal html
        if html.count(old) != 1:
            sys.exit('No es troba (o es repeteix) al codi: %r' % old[:70])
        html = html.replace(old, new)
    rep("function formatPrice(v){ return v.toFixed(2).replace('.',',')+' €'; }",
        "function formatPrice(v){ return ''; } // catàleg per a clients: sense preus")
    rep("function shareOrder(){",
        CLIENT_JS.replace('__WA__', WHATSAPP)
        + "\nfunction shareOrder(){ return _clientSendWhatsApp(); }\nfunction _internalShareOrder(){")
    rep('<head>', '<head>\n' + STORAGE_SHIM)
    rep('</body>', '<style>' + CLIENT_CSS + '</style>\n</body>')
    html = html.replace('🛒 Pedido</span>', '🛒 La teva comanda</span>')
    html = html.replace('Veure pedido →', 'Veure comanda →')
    html = html.replace('➕ Afegir al pedido', '➕ Afegir a la comanda')
    html = html.replace('>Nexe Catàleg v1.0<', '>Catàleg NEXE<')
    html = html.replace('Catàleg comercial per a iPad',
                        'Comandes per WhatsApp al %s' % WHATSAPP_TXT)

    # Cap preu ha de quedar a les dades
    pa = html.index(nexe.PRODUCTS_PREFIX)
    pdata = html[pa:html.index('\n', pa)]
    left = re.findall(r'"(?:p|price|cost)":\s*"?[0-9]', pdata)
    if left or '€' in pdata:
        sys.exit('ATENCIÓ: queden preus a les dades (%d camps, € %s)' % (len(left), '€' in pdata))

    out = os.path.join(dest, 'index.html')
    nexe.write_text(out, html)
    nexe.write_extra_bundle(dest, sorted(set(extra)))
    nexe.copy_public(dest, html)
    sw = nexe.read_text(os.path.join(dest, 'sw.js'))
    sw = sw.replace('nexe-cataleg-', 'clients-cataleg-').replace("var OTHER_APPS = ['crown/', 'clients/'];", 'var OTHER_APPS = [];')
    nexe.write_text(os.path.join(dest, 'sw.js'), sw)
    man = json.load(open(os.path.join(dest, 'manifest.json'), encoding='utf-8'))
    man.update({'name': 'Catàleg NEXE', 'short_name': 'NEXE',
                'description': 'Catàleg NEXE: fes la teva comanda per WhatsApp'})
    nexe.write_text(os.path.join(dest, 'manifest.json'), json.dumps(man, ensure_ascii=False, indent=2) + '\n')
    print('Catàleg per a clients: %s (%d productes, %.1f MB, sense preus)'
          % (os.path.relpath(out), sum(1 for p in products if p.get('cat') != '_removed'), len(html.encode()) / 1e6))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--site', default=os.path.join(nexe.DIST, 'clients'))
    a = ap.parse_args()
    build(a.site)


if __name__ == '__main__':
    main()
