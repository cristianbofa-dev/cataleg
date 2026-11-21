"""Informació legal i controls dels dos catàlegs públics."""
from html import escape
from pathlib import Path

NAME = 'Cristian Botellero'
NIF = '43734502W'
ADDRESS = 'Polígon Collestret, carrer B, nau 1A, 25180 Alcarràs, Lleida, Espanya'
EMAIL = 'cristian@nexeindustrial.es'
SITE = 'https://www.nexeindustrial.es'
WHATSAPP = '34610732047'
TITLES = {
    'avis-legal': 'Avís legal',
    'privacitat': 'Privacitat',
    'galetes': 'Galetes',
    'contacte': 'Contacte',
}
ASSETS = Path(__file__).resolve().parents[1] / 'src' / 'legal'

IDENTITY = f"""<p>NEXE Industrial és el nom comercial de {NAME}, empresari individual (autònom),
amb NIF {NIF} i domicili a {ADDRESS}. Correu electrònic
<a href="mailto:{EMAIL}">{EMAIL}</a>.</p>"""

WHATSAPP_PRIVACY = """<p>Quan obres el xat, WhatsApp (un servei de Meta) rep
dades de connexió i tracta les dades del teu compte i de l’ús del servei segons
la seva pròpia política. WhatsApp Ireland Limited és l’entitat que presta
el servei a la regió europea. NEXE Industrial rep el número o les dades visibles
del teu perfil i el contingut que decideixis enviar. Si copies l’esborrany,
queda al porta-retalls del dispositiu fins que el substitueixis. En enganxar-lo
a WhatsApp, el contingut passa a aquesta aplicació. Revisa’l abans d’enviar-lo.
Consulta la <a href="https://www.whatsapp.com/legal/privacy-policy-eea">política de privacitat de WhatsApp per a la regió europea</a>,
inclosa la informació sobre transferències internacionals.</p>"""


def media_settings():
    return """<dialog id="mediaSettings" class="legal-dialog" aria-labelledby="mediaTitle" lang="ca">
  <form id="mediaForm">
    <h2 id="mediaTitle">Contingut extern</h2>
    <p>El catàleg funciona amb el contingut propi. Pots permetre fotos de proveïdors
       i vídeos de YouTube. Quan es carreguen, els proveïdors reben dades de connexió
       i poden llegir o desar informació al dispositiu. Si canvies quins
       continguts permetre, es tornarà a carregar la pàgina.</p>
    <p><a href="galetes.html">Consulta la política de galetes</a>.</p>
    <label><input type="checkbox" name="photos"> Fotos d’Insemac Tools i Cimaser</label>
    <label><input type="checkbox" name="videos"> Vídeos de YouTube (Google)</label>
    <div class="legal-actions">
      <button type="button" id="mediaReject">Rebutja-ho tot</button>
      <button type="submit">Desa la selecció</button>
      <button type="button" id="mediaAccept">Accepta-ho tot</button>
    </div>
    <p id="mediaStatus" role="status"></p>
  </form>
</dialog>
<aside id="mediaNotice" class="legal-notice" lang="ca" aria-label="Preferències de galetes" hidden>
  <p>NEXE Industrial demana permís per carregar fotos de proveïdors i vídeos de
     YouTube. Aquests tercers poden desar dades al navegador. YouTube també les
     pot fer servir per mesurar l’ús i personalitzar anuncis. Consulta la
     <a href="galetes.html">política de galetes</a>.</p>
  <div class="legal-actions">
    <button type="button" id="mediaNone">Rebutja-ho tot</button>
    <button type="button" data-media-settings>Configura</button>
    <button type="button" id="mediaAll">Accepta-ho tot</button>
  </div>
  <p id="mediaNoticeStatus" role="status"></p>
</aside>"""


def links(prefix=''):
    return ' '.join(
        f'<a href="{prefix}{slug}.html">{title}</a>' for slug, title in TITLES.items()
    )


def integrate(html, *, crown=False, standalone=False):
    prefix = f'{SITE}/crown/' if standalone else ''
    footer = f'<footer class="legal-footer" lang="ca" aria-label="Informació legal">{links(prefix)}'
    if not crown:
        footer += ' <button type="button" data-media-settings>Preferències de galetes</button>'
    footer += '</footer>'
    terms = (
        'Venda exclusiva a professionals i empreses. Imports del catàleg i del resum sense IVA. '
        'El resum pot incloure ports i descomptes.'
        if crown else 'El pressupost indicarà el preu segons la tarifa aplicable.'
    )
    privacy = f"""<div class="order-legal" id="orderLegal" lang="ca">
  <p>{terms} El comercial confirmarà la disponibilitat, els ports, l’IVA i l’import final.
     La sol·licitud no formalitza la compra.</p>
  <p>{NAME} (NEXE Industrial) utilitza les dades per gestionar la teva sol·licitud.
     Evita incloure dades personals a les observacions. Consulta la
     <a href="{prefix}privacitat.html" target="_blank" rel="noopener">política de privacitat</a>
     per conèixer la base jurídica i els teus drets.</p>
  <p>Prepara el missatge, copia’l i obre WhatsApp. Tu decideixes si l’enganxes i l’envies.
     WhatsApp (Meta) tracta les dades segons la seva
     <a href="https://www.whatsapp.com/legal/privacy-policy-eea" target="_blank" rel="noreferrer">política de privacitat</a>.</p>
</div>"""
    draft = f"""<dialog id="waDraft" class="legal-dialog" aria-labelledby="waTitle" lang="ca">
  <form method="dialog">
    <h2 id="waTitle">Sol·licitud comercial</h2>
    <p id="waIntro"></p>
    <label for="waText">Esborrany del missatge</label>
    <textarea id="waText" rows="7" readonly></textarea>
    <div class="legal-actions">
      <button type="button" id="waCopy">Copia el missatge</button>
      <a id="waOpen" href="https://wa.me/{WHATSAPP}" target="_blank" rel="noreferrer">Obre WhatsApp</a>
      <button>Tanca</button>
    </div>
    <p id="waStatus" role="status"></p>
  </form>
</dialog>"""
    css = (ASSETS / 'public.css').read_text(encoding='utf-8')
    script = (ASSETS / 'public.js').read_text(encoding='utf-8')
    head = '<meta name="referrer" content="no-referrer">\n'
    head += f'<style>{css}</style>\n<script>{script}</script>\n'
    html = html.replace('<head>', '<head>\n' + head, 1)
    html = html.replace('  </div>\n\n  <nav class="nav"', f'    {footer}\n  </div>\n\n  <nav class="nav"', 1)
    html = html.replace('    <div class="order-actions">', f'    {privacy}\n    <div class="order-actions">', 1)
    html = html.replace('id="orderShare">Compartir', 'id="orderShare" aria-describedby="orderLegal">Prepara la sol·licitud')
    for field in ('orderNotes', 'addNotes'):
        html = html.replace(f'id="{field}"', f'id="{field}" autocomplete="off"')
    html = html.replace('</body>', draft + ('' if crown else media_settings()) + '\n</body>', 1)
    return html


def pages(*, crown=False):
    catalogue = 'Catàleg Crown' if crown else 'Catàleg NEXE'
    url = SITE + ('/crown/' if crown else '/')
    details = {
        'avis-legal': f"""{IDENTITY}
<h2>Abast dels catàlegs</h2>
<p>El <a href="{SITE}/">catàleg NEXE</a> i el <a href="{SITE}/crown/">catàleg Crown</a>
són catàlegs comercials gestionats per NEXE Industrial. Crown és una marca de
productes que NEXE Industrial comercialitza. Les marques i altres signes dels
productes corresponen als seus titulars respectius.</p>
<h2 id="sollicituds">Sol·licituds, preus i comandes</h2>
<p>Pots seleccionar productes i preparar una sol·licitud comercial. La web no
tramita pagaments. Afegir productes a la cistella, preparar un missatge o enviar-lo
per WhatsApp no formalitza una compra ni reserva existències.</p>
<p>El catàleg general NEXE no publica preus. Demana un pressupost; el comercial
t’indicarà la tarifa aplicable. La venda del catàleg Crown s’adreça exclusivament
a professionals i empreses. Els imports de Crown es mostren sense IVA. El resum
pot incloure els ports i descomptes que calcula el catàleg.</p>
<p>Abans de formalitzar una comanda, el comercial confirmarà les referències, la
disponibilitat, els preus, els descomptes aplicables, els ports, els impostos i
el total a pagar, així com les condicions aplicables. Si el catàleg general NEXE
dona lloc a una venda a un consumidor, abans d’acceptar l’oferta rebràs el preu
total amb impostos i la informació sobre lliurament, garanties i, quan escaigui,
desistiment. Es mantenen els drets que reconeix la normativa de consum.</p>""",
        'privacitat': f"""{IDENTITY}
<h2>Quines dades utilitzem i per què</h2>
<p>El catàleg NEXE et permet preparar un missatge amb nom, empresa, telèfon,
població opcional, productes, quantitats i observacions. A Crown pots preparar
un resum amb els productes, les quantitats, els imports i les observacions.
El catàleg no remet aquestes dades a un servidor de formularis. Si envies el
missatge, o si ens escrius per correu, utilitzem les dades de contacte i el
contingut per respondre, preparar el pressupost i gestionar la comanda si es formalitza.</p>
<p>La base jurídica és l’aplicació de mesures precontractuals a petició teva
o l’execució del contracte quan n’ets part (article 6.1.b del RGPD).
Per a consultes generals o contactes que actuen en nom d’una empresa, la base
és l’interès legítim a respondre i mantenir la relació professional (article 6.1.f
del RGPD i, quan és aplicable, article 19 de la LOPDGDD). Si es formalitza una venda,
tractem les dades necessàries per complir les obligacions legals de facturació,
comptabilitat i fiscalitat (article 6.1.c del RGPD).</p>
<h2>Allotjament i tercers</h2>
<p>GitHub Pages allotja el catàleg. Per servir les pàgines, l’allotjament rep
dades tècniques de la connexió, com l’adreça IP. Consulta la
<a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">declaració de privacitat de GitHub</a>.
Si autoritzes contingut extern a NEXE, les fotos i els vídeos es demanen als
proveïdors detallats a la <a href="galetes.html">política de galetes</a>.
Els enllaços a altres webs obren serveis que apliquen les seves pròpies polítiques.</p>
<h2>Si ens contactes per WhatsApp</h2>
{WHATSAPP_PRIVACY}
<h2>Conservació</h2>
<p>Conservem les comunicacions mentre són necessàries per gestionar la consulta,
el pressupost o la comanda. Si es formalitza una venda, conservem els documents
exigits durant els terminis legals aplicables. Quan calgui atendre o defensar
una reclamació, conservem les dades pertinents durant el termini aplicable.</p>
<h2>Els teus drets</h2>
<p>Pots demanar accés, rectificació, supressió i limitació del tractament,
oposar-t’hi o demanar la portabilitat quan correspongui. Escriu a
<a href="mailto:{EMAIL}">{EMAIL}</a>. Pots retirar l’autorització del
contingut extern des de les preferències del catàleg NEXE i presentar una
reclamació davant l’<a href="https://www.aepd.es/">Agència Espanyola de Protecció de Dades</a>.</p>""",
        'galetes': f"""<p>Aquesta política s’aplica als catàlegs NEXE i Crown.
Els catàlegs no instal·len galetes HTTP pròpies ni utilitzen
emmagatzematge de sessió (sessionStorage).</p>
<h2>Emmagatzematge tècnic</h2>
<p>La cistella, les llistes i els favorits, el tema visual i, a NEXE, l’idioma
triat es mantenen al navegador (localStorage) per recuperar les funcions i
preferències que utilitzes. Els camps de contacte i les observacions del
carretó es mantenen a la pàgina oberta. Pots suprimir la informació des de
les opcions del navegador per esborrar dades del lloc.</p>
<p>Crown utilitza un service worker i una memòria cau pròpia per obrir el
catàleg sense connexió i actualitzar-lo. NEXE funciona en línia; conserva un
mecanisme de migració que retira la còpia sense connexió de versions anteriors.
La memòria cau és tècnica i no conté el contingut de les sol·licituds.</p>
<h2>Contingut opcional al catàleg NEXE</h2>
<p>Les fotos externes d’<a href="https://www.insemactools.es/">Insemac Tools</a>
i <a href="https://www.cimaser.com/">Cimaser</a>, i els vídeos de
<a href="https://policies.google.com/privacy">YouTube (Google)</a>, es
carreguen només si autoritzes la categoria corresponent. Aquests proveïdors
reben la teva adreça IP i informació del navegador. Poden utilitzar galetes
o altres tecnologies sota les seves pròpies polítiques, incloses les finalitats
de mesurament i publicitat que pugui aplicar YouTube. El tractament vinculat a
aquesta càrrega es basa en el teu consentiment (article 6.1.a del RGPD).
Consulta <a href="https://policies.google.com/technologies/cookies">com fa servir Google les galetes</a>
i la seva política de privacitat per a la informació sobre transferències internacionals.</p>
<p>Pots acceptar o rebutjar totes dues categories o triar-les per separat.
La tria es desa al navegador fins a 12 mesos. Pots canviar-la o retirar-la
amb «Preferències de galetes» al peu del <a href="{SITE}/">catàleg NEXE</a>.
Retirar el permís atura les càrregues futures des del catàleg. Pots esborrar
les dades que els proveïdors ja hagin desat des del navegador.</p>
<p>Crown serveix les imatges des del mateix catàleg i no incorpora aquests
continguts opcionals. Els catàlegs no inclouen analítica ni publicitat pròpies.
Quan obres WhatsApp o un enllaç extern, s’aplica la política del servei de destinació.</p>""",
        'contacte': f"""{IDENTITY}
<p>Per demanar informació, confirmar disponibilitat o sol·licitar un pressupost,
escriu-nos per correu o <a href="https://wa.me/{WHATSAPP}" rel="noreferrer">obre un xat de WhatsApp</a>.
Consulta com tractem les teves dades a la <a href="privacitat.html">política de privacitat</a>.</p>""",
    }
    return {
        f'{slug}.html': f"""<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<title>{title} · {catalogue}</title>
<link rel="canonical" href="{url}{slug}.html">
<style>
body {{margin:0;background:#f5f5f7;color:#1d1d1f;font:1rem/1.55 system-ui,sans-serif}}
main,footer {{box-sizing:border-box;max-width:48rem;margin:auto;padding:1rem 1.25rem}}
a {{color:#124685;overflow-wrap:anywhere}}
h1,h2 {{line-height:1.2}}
h2 {{margin-top:1.5em;font-size:1.2rem}}
footer {{display:flex;flex-wrap:wrap;gap:.6rem 1.2rem;border-top:1px solid #ccc}}
</style>
</head>
<body>
<main>
<a href="./index.html">Torna a {escape(catalogue)}</a>
<h1>{title}</h1>
{details[slug]}
</main>
<footer aria-label="Informació legal">{links()}</footer>
</body>
</html>
"""
        for slug, title in TITLES.items()
    }


def write_pages(dest, *, crown=False):
    for filename, content in pages(crown=crown).items():
        (Path(dest) / filename).write_text(content, encoding='utf-8')
