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
import base64
import hashlib
import json
import os
import re
import shutil
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
  var lg = window._clientLang ? window._clientLang() : 'ca';
  if(lg !== 'ca') L.push('🌐 Idioma del client: ' + {es:'castellà', en:'anglès', uk:'ucraïnès'}[lg]);
  L.push('Enviat des del catàleg NEXE');
  var url = 'https://wa.me/' + CLIENT_WA + '?text=' + encodeURIComponent(L.join('\n'));
  var a = document.createElement('a');
  a.href = url; a.target = '_blank'; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
  _clientToast((window._clientT||String)('S\'obre WhatsApp amb la comanda: prem Enviar per fer-la arribar.'));
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

I18N_CSS = """
.lang-pick { position:relative; display:inline-flex; align-items:center; justify-content:center; min-width:46px; height:34px;
  margin-right:6px; padding:0 10px; border-radius:17px; border:1px solid rgba(0,0,0,.14); background:rgba(255,255,255,.75);
  font:700 13px -apple-system,system-ui,sans-serif; color:#1d1d1f; letter-spacing:.3px; flex:0 0 auto; }
.lang-pick select { position:absolute; inset:0; width:100%; height:100%; opacity:0; cursor:pointer; font-size:16px; }
body.presentation .lang-pick { background:#2c2c2e; color:#f5f5f7; border-color:rgba(255,255,255,.18); }
.prod-detail .price:empty::before, .variant-detail .price:empty::before, #vgPrice:empty::before { content:var(--i18n-price,'Preu segons la teva tarifa') !important; }
"""

I18N_JS = r"""<script>/* Catàleg clients: idiomes (CA/ES/EN/UK) */
(function(){
var D = __I18N__, ORIG = new WeakMap(), AORIG = new WeakMap(), ATTRS = ['placeholder','aria-label','title'];
var SHORT = {ca:'CA', es:'ES', en:'EN', uk:'УКР'};
var lang = null;
try { lang = localStorage.getItem('lang'); } catch(e){}
if(!D.languages[lang]){
  var n = (navigator.language||'ca').toLowerCase().slice(0,2);
  lang = n==='ca'?'ca': n==='es'||n==='gl'||n==='eu'?'es': n==='uk'||n==='ru'?'uk': n==='en'?'en':'es';
}
var PATS = D.patterns.map(function(x){ return {re:new RegExp(x.re), t:x.t}; });
function pl(n,a,b,c){ n=+n; var m10=n%10, m100=n%100;
  return (m10===1&&m100!==11)?a:(m10>=2&&m10<=4&&(m100<10||m100>=20))?b:c; }
function word(s){ var e=D.strings[s]; if(!e) return null; return lang==='ca' ? (e.ca||null) : (e[lang]||null); }
function tr(src){
  var core = src.trim(); if(!core) return null;
  var w = word(core);
  if(w===null){
    for(var i=0;i<PATS.length;i++){
      var m = core.match(PATS[i].re); if(!m) continue;
      var t = lang==='ca' ? PATS[i].t.ca : PATS[i].t[lang]; if(!t) return null;
      t = t.replace(/\$T(\d)/g, function(_,k){ var v=m[k]; return v.split(/, | i /).map(function(x){ var y=word(x)||word(x.charAt(0).toUpperCase()+x.slice(1)); return y?(m[k].charAt(0)===m[k].charAt(0).toLowerCase()&&lang!=='en'&&lang!=='uk'?y.charAt(0).toLowerCase()+y.slice(1):y):x; }).join(', '); })
           .replace(/\$(\d)/g, function(_,k){ return m[k]; })
           .replace(/\{pl:(\d+):([^|}]*)\|([^|}]*)\|([^}]*)\}/g, function(_,n,a,b,c){ return pl(n,a,b,c); });
      w = t; break;
    }
    if(w===null){
      // Prefix d'emoji o símbol: "🔪 Tall"
      var em = core.match(/^([^A-Za-zÀ-ÿ0-9\s]+)(\s*)([A-Za-zÀ-ÿ].*)$/);
      if(em){ var r0 = tr(em[3]); if(r0) w = em[1] + em[2] + r0; }
    }
    if(w===null){
      // Frases de l'assessor: traduir frase per frase
      var parts = core.match(/[^.]+\.(\s|$)/g);
      if(parts && parts.length>1 && parts.join('').trim()===core){
        var any=false, out = parts.map(function(p){ var r=tr(p.trim()); if(r){any=true;return r;} return p.trim(); });
        if(any) w = out.join(' ');
      }
    }
    if(w===null) return null;
  }
  return src.replace(core, w);
}
var busy=false, OBS=null;
function doText(node){
  var o = ORIG.has(node) ? ORIG.get(node) : node.nodeValue;
  if(!ORIG.has(node)) ORIG.set(node, o);
  var t = lang==='ca' && !hasCa(o) ? o : (tr(o) || o);
  if(node.nodeValue !== t) node.nodeValue = t;
}
function hasCa(o){ var c=o.trim(); var e=D.strings[c]; if(e&&e.ca) return true;
  for(var i=0;i<PATS.length;i++) if(PATS[i].t.ca && PATS[i].re.test(c)) return true; return false; }
function doEl(el){
  var m = AORIG.get(el); if(!m){ m={}; AORIG.set(el,m); }
  ATTRS.forEach(function(a){
    if(!el.hasAttribute(a)) return;
    if(!(a in m)) m[a]=el.getAttribute(a);
    var t = tr(m[a]) || m[a]; if(el.getAttribute(a)!==t) el.setAttribute(a,t);
  });
}
var SKIP = {SCRIPT:1, STYLE:1, NOSCRIPT:1};
function walk(root){
  if(root.nodeType===3){ if(root.parentNode && !SKIP[root.parentNode.nodeName] && root.parentNode.nodeName!=='TEXTAREA') doText(root); return; }
  if(root.nodeType!==1 || SKIP[root.nodeName] || root.id==='langPick') return;
  doEl(root);
  var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT, {acceptNode:function(n){
    if(n.nodeType===1) return (SKIP[n.nodeName]||n.id==='langPick') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    return NodeFilter.FILTER_ACCEPT; }});
  var n; while((n=w.nextNode())){ if(n.nodeType===3){ if(n.parentNode.nodeName!=='TEXTAREA') doText(n); } else doEl(n); }
}
function apply(){
  busy=true;
  document.documentElement.lang = lang;
  var pr = word('Preu segons la teva tarifa') || 'Preu segons la teva tarifa';
  document.documentElement.style.setProperty('--i18n-price', JSON.stringify(pr));
  walk(document.body);
  var t = word('Catàleg NEXE'); document.title = t || 'Catàleg NEXE';
  var b = document.getElementById('langPickLabel'); if(b) b.textContent = SHORT[lang];
  if(OBS) OBS.takeRecords();
  busy=false;
}
window._clientLang = function(){ return lang; };
window._clientT = function(s){ return lang==='ca' ? s : (tr(s)||s); };
function setLang(l){ lang=l; try{ localStorage.setItem('lang', l); }catch(e){} apply(); }
function addPicker(){
  var h = document.getElementById('header'); if(!h || document.getElementById('langPick')) return;
  var box = document.createElement('label'); box.className='lang-pick'; box.id='langPick';
  var sp = document.createElement('span'); sp.id='langPickLabel'; sp.textContent=SHORT[lang]; box.appendChild(sp);
  var sel = document.createElement('select'); sel.setAttribute('aria-label','Idioma / Language');
  Object.keys(D.languages).forEach(function(k){ var o=document.createElement('option'); o.value=k; o.textContent=D.languages[k]; if(k===lang) o.selected=true; sel.appendChild(o); });
  sel.addEventListener('change', function(){ setLang(sel.value); });
  box.appendChild(sel);
  var ob = document.getElementById('orderBtn'); h.insertBefore(box, ob || null);
}
function start(){
  addPicker(); apply();
  OBS = new MutationObserver(function(ms){
    if(busy) return; busy=true;
    ms.forEach(function(m){
      if(m.type==='characterData'){ ORIG.set(m.target, m.target.nodeValue); doText(m.target); }
      else if(m.type==='attributes'){ var mm=AORIG.get(m.target); if(!mm){ doEl(m.target); } else { var v=m.target.getAttribute(m.attributeName);
          var cur = tr(mm[m.attributeName]||'')||mm[m.attributeName]; if(v!==cur){ mm[m.attributeName]=v; doEl(m.target);} } }
      else m.addedNodes.forEach(function(n){ walk(n); });
    });
    OBS.takeRecords(); busy=false;
  });
  OBS.observe(document.body, {childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:ATTRS});
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
</script>"""


SW_CLEANUP = """/* Catàleg NEXE per a clients: web sempre en línia, sense còpia offline.
 * Aquest service worker només elimina la còpia que desaven les versions anteriors. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) { return Promise.all(keys.filter(function (k) { return k.indexOf('crown-') !== 0; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.registration.unregister(); })
      .then(function () { return self.clients.matchAll({ type: 'window' }); })
      .then(function (list) { list.forEach(function (c) { c.navigate(c.url); }); })
  );
});
"""

NO_SW = r"""<script>/* Web per a clients: sense service worker ni còpia offline */
(function(){ try{ if('serviceWorker' in navigator){ navigator.serviceWorker.getRegistrations().then(function(rs){ rs.forEach(function(r){ if(!/\/crown\/$/.test(r.scope)) r.unregister(); }); }); }
  if(window.caches){ caches.keys().then(function(ks){ ks.forEach(function(k){ if(k.indexOf('crown-')!==0) caches.delete(k); }); }); } }catch(e){} })();</script>"""


def externalize_images(html, dest):
    """Treu les fotos incrustades (base64) de l'HTML i les desa com a fitxers
    amb la mateixa ruta (imgs/...). L'app ja carrega la ruta si no la troba incrustada."""
    a = html.index(nexe.IMAGES_PREFIX) + len(nexe.IMAGES_PREFIX)
    # el mapa és un objecte JSON compacte que acaba amb '};'
    b = html.index('};', a) + 1
    imgs = json.loads(html[a:b])
    n = 0
    for key, uri in imgs.items():
        m = re.match(r'data:[^;,]+;base64,(.*)$', uri, re.S)
        if not m or not key.startswith('imgs/'):
            continue
        dst = os.path.join(dest, key)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with open(dst, 'wb') as f:
            f.write(base64.b64decode(m.group(1)))
        n += 1
    left = {k: v for k, v in imgs.items() if not k.startswith('imgs/')}
    print('  %d fotos principals escrites com a fitxers' % n)
    return html[:a] + json.dumps(left, ensure_ascii=False, separators=(',', ':')) + html[b:]


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
    html = nexe.build_html(use_private=False, light=(520, 70), extras_mode='files', extra_files=extra)

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
    rep('<head>', '<head>\n' + STORAGE_SHIM + NO_SW)
    rep("if ('serviceWorker' in navigator && location.protocol !== 'file:') {", "if (false) { // web per a clients: sense còpia offline")
    i18n = json.load(open(os.path.join(nexe.ROOT, 'data', 'i18n-clients.json'), encoding='utf-8'))
    i18n.pop('_comment', None)
    rep('</body>', '<style>' + CLIENT_CSS + I18N_CSS + '</style>\n'
        + I18N_JS.replace('__I18N__', json.dumps(i18n, ensure_ascii=False).replace('</', '<\\/')) + '\n</body>')
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
    # Web sempre en línia: les fotos van com a fitxers a part (es carreguen
    # només quan es veuen) i sense còpia per treballar sense connexió.
    shutil.rmtree(os.path.join(dest, 'imgs'), ignore_errors=True)
    for old in ('fotos-extra.js',):
        if os.path.exists(os.path.join(dest, old)):
            os.remove(os.path.join(dest, old))
    html = externalize_images(html, dest)
    nexe.write_text(out, html)
    nexe.write_extra_files(dest, sorted(set(extra)), max_size=900, quality=78)
    nexe.copy_public(dest, html)
    # Service worker que només esborra la còpia sense connexió de versions anteriors
    nexe.write_text(os.path.join(dest, 'sw.js'), SW_CLEANUP)
    # Si hi ha un domini propi configurat (fitxer CNAME), es conserva tal qual
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
