# Catàleg NEXE

Catàleg comercial de NEXE per a iPad i Mac: productes per a la pedra
(tall, polit, adhesius, químics, manipulació, maquinària, seguretat i art
funerari) amb fotos, referències, preus de venda i variants, comandes,
llistes i mode edició.

El catàleg es distribueix com **un sol fitxer HTML** que ho porta tot a dins
(dades, codi i imatges). Funciona sense connexió i s'obre amb Safari, Chrome
o l'app Documents. Aquest repositori conté el **codi font** d'aquest fitxer i
les eines per reconstruir-lo, en dues versions:

| Versió | Mida | Ús |
|---|---|---|
| Completa (`build`) | ~56 MB | Mac, fotos a resolució completa i totes les fotos de cada producte |
| Lleugera (`build --light`) | ~14 MB | iPad (app Documents) i publicació en línia: una foto per producte, reduïda |

---

## Contingut del repositori

```
src/
  index.template.html   Estructura HTML amb marcadors {{include:…}} i {{data:…}}
  css/styles.css        Estils
  js/app.js             Aplicació (navegació, fitxes, comandes, mode edició…)
  js/knowledge.js       Base de coneixement tècnic i assessor
  js/error-bar.js       Barra d'errors
  js/sqlite-bridge.js   Pont SQLite opcional (si no troba els fitxers, l'ignora)
  js/sw-register.js     Registre del service worker
data/
  products.json         Productes (964 entrades: 763 d'actius + 201 d'eliminats)
  variant-groups.json   Grups de variants (mides, colors…)
  light.json            Productes que conserven totes les fotos a la versió lleugera
images/
  manifest.json         Llista d'imatges (clau → tipus)
  imgs/, imatges/       1.500 imatges a resolució completa (JPEG, PNG, GIF)
public/
  manifest.json, sw.js, icons/   Fitxers per instal·lar-lo com a app
tools/
  nexe.py               import / build / verify
  build_pdf.py          PDF d'emergència
  requirements-pdf.txt  Dependències del PDF
```

Les entrades eliminades de `products.json` (`"cat": "_removed"`) s'han de
conservar: les fitxes es referencien per posició, i treure'n una
desplaçaria les altres.

Les branques:

| Branca | Contingut |
|---|---|
| `main` | Versió principal. Ara conté la còpia original a `original/`. |
| `backup-original-claude` | Còpia de seguretat del catàleg tal com estava a Claude (10/11/2026). No s'ha de tocar. |
| `desarrollo-catalogo-nexe` | Codi font, eines, PDF i aquesta documentació. |

---

## Dades privades (no van mai a GitHub)

El repositori és **públic**. Per això no conté:

- la llista de clients (`initialClients`: adreces, CIF, emails, descomptes…);
- la configuració i les credencials de Firebase;
- els preus de cost dels productes.

Aquestes dades viuen en una carpeta `private/` que `.gitignore` exclou:

```
private/clients.json    llista de clients
private/firebase.json   apiKey, authDomain, databaseURL, projectId,
                        storageBucket, messagingSenderId, appId, email, password
private/costs.json      {"índex del producte": cost}
```

Guarda una còpia d'aquesta carpeta en un lloc segur (no al repositori).
Sense ella el catàleg funciona igual: només no porta clients precarregats ni
sincronitza amb Firebase.

---

## Instal·lació

Només cal **Python 3.8 o posterior** (al Mac: `python3 --version`; si no hi
és, s'instal·la amb `xcode-select --install` o des de python.org).
La versió completa no necessita cap biblioteca addicional; la lleugera
necessita Pillow (`pip3 install pillow`).

```bash
git clone https://github.com/cristianbofa-dev/cataleg.git
cd cataleg
git checkout desarrollo-catalogo-nexe
# Opcional: copia la teva carpeta private/ dins del repositori
```

Per al PDF (un sol cop):

```bash
pip3 install -r tools/requirements-pdf.txt
python3 -m playwright install chromium
```

---

## Construir el catàleg

```bash
python3 tools/nexe.py build                  # → dist/index.html, versió completa (~56 MB)
python3 tools/nexe.py build --light          # → dist/lleuger/index.html, versió lleugera (~14 MB)
python3 tools/nexe.py build --with-private   # afegeix clients, Firebase i costos (també amb --light)
python3 tools/build_pdf.py                   # → dist/Cataleg_NEXE.pdf
```

Al costat de cada `index.html` es copien els fitxers per instal·lar-lo
(`manifest.json`, `sw.js`, `icons/`). La carpeta `dist/` no es puja a
GitHub: es torna a generar quan cal.

La versió lleugera incrusta la primera foto de cada producte reduïda a 520 px
(JPEG, qualitat 70); es pot ajustar amb `--max-size` i `--quality`. Les fotos
addicionals depenen de `--extras`:

| `--extras` | Fotos addicionals | Per a |
|---|---|---|
| `web` (per defecte) | Enllaçades a la web del proveïdor (`data/web-images.json`); la resta, petites dins l'HTML. Sense internet no surten (la galeria les amaga). | Fitxer per a l'app Documents |
| `bundle` | Totes en un fitxer `fotos-extra.js` al costat de l'HTML | Publicar a Claude (hi pugen els dos fitxers) |
| `files` | Cada foto com a fitxer a `imgs/` al costat de l'HTML | Un allotjament web propi |

Un artifact de Claude admet fins a 16 MB per fitxer i no carrega imatges
d'altres webs; per això s'hi publica amb `--extras bundle`:

```bash
python3 tools/nexe.py build --light --extras bundle --with-private --out publicar/index.html
# Puja publicar/index.html i publicar/fotos-extra.js
```

`data/web-images.json` es va generar el 11/11/2026 recorrent insemactools.es
amb el navegador; relaciona cada foto del catàleg amb la seva adreça a la web.

> ⚠️ Un `index.html` construït amb `--with-private` conté la llista de
> clients i la contrasenya de Firebase. És per al teu ús personal: no el
> publiquis ni el comparteixis.

---

## Modificar el catàleg

### Productes, preus i variants

Edita `data/products.json`. Camps principals de cada producte:

| Camp | Significat |
|---|---|
| `n` | Nom |
| `r` | Referència |
| `b` | Marca |
| `p` | Preu de venda |
| `d` | Descripció |
| `cat`, `subcat`, `fam` | Categoria i subcategoria del menú (`tall`, `polit`, `adhesius`, `quimics`, `manipulacio`, `instalacio`, `maquinaria`, `equip`, `funerari`) |
| `i`, `imgs` | Imatge principal i llista d'imatges (`imgs/nom.jpg`) |
| `insemacVariants` | Opcions del desplegable: `{"id", "label", "price", "star"}` |
| `variants` | Mides amb referència i preu pròpies |
| `cost` | Sempre `null` al repositori (el cost real és a `private/costs.json`) |

Els **productes nous s'afegeixen al final** de la llista. No esborris
entrades: per treure'n una, canvia-la per
`{"n": "", "cat": "_removed", ...}` com les que ja hi ha.

Els grups que mostren diverses fitxes com una de sola amb selector de mida
o color són a `data/variant-groups.json`.

### Imatges

1. Copia la foto a `images/imgs/` a bona resolució (la versió lleugera ja la redueix).
2. Afegeix-la a `images/manifest.json`: `["imgs/nom.jpg", "image/jpeg"]`.
3. Posa `"imgs/nom.jpg"` als camps `i` i `imgs` del producte.

### Menú, categories, ordre i textos de l'app

- Categories i subcategories del menú: `NAV_CATEGORIES`, al principi de
  `src/js/app.js` (el camp `img` és la foto del botó).
- Ordre de les fitxes de cada categoria: `_DEFAULT_ORDERS` a `src/js/app.js`.
- Estils: `src/css/styles.css`.

### Canvis fets des del mode edició de l'app

El mode edició (✏️) desa els canvis al dispositiu i els exporta amb el botó
💾 en un fitxer `nexe-overrides-AAAA-MM-DD.json`. Aquest fitxer:

- es pot tornar a carregar a l'app amb 📂 (per passar canvis d'un dispositiu a un altre);
- es pot aplicar al PDF: `python3 tools/build_pdf.py --overrides fitxer.json`.

Per integrar-los de manera permanent al codi font, passa'ls a
`data/products.json` (preus, noms, eliminacions) o a `_DEFAULT_ORDERS` (ordre).

### Importar un catàleg HTML ja fet

Si tens un `index.html` del catàleg modificat fora del repositori (per
exemple, descarregat de Claude), es pot tornar a convertir en codi font:

```bash
python3 tools/nexe.py import index.html   # actualitza src/, data/, images/ i private/
python3 tools/nexe.py verify index.html   # comprova que el build el reprodueix igual
git diff --stat                           # revisa què ha canviat
```

`import` separa automàticament els clients, les credencials i els costos cap a
`private/`, de manera que no acaben al repositori.

### Comprovar abans de pujar

```bash
python3 tools/nexe.py build && python3 tools/build_pdf.py
git status            # private/ i dist/ NO han d'aparèixer
```

Obre `dist/index.html` al navegador i revisa les categories que has tocat.

---

## Actualitzar i publicar

**A l'iPad o al Mac com a fitxer.** Copia `dist/index.html` (Mac) o
`dist/lleuger/index.html` (iPad) a iCloud Drive o a l'app Documents i
obre'l des d'allà.

**Com a app instal·lable que funciona sense connexió (GitHub Pages).**

```bash
bash tools/publish_pages.sh     # construeix la versió pública i la puja a la branca gh-pages
```

L'app és a https://cristianbofa-dev.github.io/cataleg/. A l'iPad: obrir-la
amb Safari → *Compartir → Afegir a la pantalla d'inici*. Al Mac: Safari →
*Arxiu → Afegir al Dock*.

- El primer cop cal connexió: es desen la pàgina, les fotos addicionals
  (`fotos-extra.js`) i les icones, uns 27 MB. Quan acaba surt l'avís
  "✓ Catàleg desat: ja funciona sense connexió".
- Després s'obre sempre sense internet. Amb connexió, si hi ha una versió
  nova, la desa i es recarrega sola (si la xarxa triga més de 4 s, obre la
  còpia desada).
- És **pública**: qui tingui l'enllaç veu els preus de venda. No hi ha mai
  clients, credencials ni costos (el script fa sempre el build públic), i
  per tant tampoc sincronització amb Firebase.

**Pujar els canvis al repositori:**

```bash
git add data images src public tools README.md .gitignore
git commit -m "Descripció del canvi"
git push
```

Quan la branca de desenvolupament estigui revisada, s'integra a `main` amb un
*pull request* a GitHub.

---

## Catàleg de màquines Crown

`cataleg-crown/` conté les 203 màquines del fullet Crown tardor-hivern 2026
(`maquines.txt`: pàgina, referència, nom, preu del fullet, tipus i secció) i
les seves fotos, i `generar_pdf.py` en fa un catàleg PDF a part amb el preu
NEXE: preu del fullet + 10 € (elèctriques de cable i packs màquina + bateria)
o + 5 € (màquines a bateria, bateries, carregadors, kits i instruments).

```bash
python3 cataleg-crown/generar_pdf.py --llista   # dist/Cataleg_Crown_NEXE.pdf i dist/Crown_preus.csv
```

També hi ha l'**app Catàleg Crown**: el mateix catàleg que NEXE (fitxes, cerca,
comandes, sense connexió) però només amb aquestes màquines.

```bash
python3 tools/crown_app.py                              # dist/crown/ (app instal·lable)
python3 tools/crown_app.py --out Cataleg_Crown.html     # un sol fitxer per a l'app Documents
```

`tools/publish_pages.sh` la publica a https://cristianbofa-dev.github.io/cataleg/crown/.
Té la memòria del navegador separada de NEXE (comandes, favorits i mode
edició no es barregen) i el seu propi service worker. Per afegir o canviar
màquines, edita `cataleg-crown/maquines.txt` (i la foto a `cataleg-crown/fotos/`).

---

## Catàleg per a clients (sense preus)

`tools/client_app.py` genera el catàleg general **sense preus** perquè els
clients facin comandes: el client afegeix productes, omple nom, empresa i
telèfon, i la comanda s'envia per WhatsApp al comercial (número a la
constant `WHATSAPP` del script). Els preus es treuen de les dades, no només
de la pantalla, i el script s'atura si en queda algun.

```bash
python3 tools/client_app.py     # dist/clients/
```

Es publica en un repositori a part, `cristianbofa-dev/cataleg-clients`, que
només conté la web sense preus i és on apunta el domini dels clients:

```bash
bash tools/publish_clients.sh     # genera i puja a ../cataleg-clients
```

Així els clients no poden arribar al catàleg intern amb preus, que continua
a https://cristianbofa-dev.github.io/cataleg/ (aquest repositori).

---

## Recuperació

- El catàleg original de Claude (versió lleugera) és a la branca
  `backup-original-claude` (`original/index.html`). Les fotos a resolució
  completa són a `images/` d'aquesta branca.
- Qualsevol versió anterior es recupera amb `git log` i `git checkout <commit>`.
- `python3 tools/nexe.py verify <fitxer.html>` comprova que un build
  coincideix amb un HTML de referència (codi idèntic i dades idèntiques).

### Idiomes del catàleg per a clients

El catàleg per a clients es pot llegir en català, castellà, anglès i ucraïnès (botó `CA/ES/EN/УКР` a la capçalera, sense banderes). L'idioma inicial surt de l'idioma del mòbil (si no és cap d'aquests, castellà) i queda recordat.

- Les traduccions són a `data/i18n-clients.json`: la clau és el text tal com surt a l'app i al costat hi ha `es`, `en`, `uk` (i `ca` quan cal corregir l'original). Per canviar una traducció, edita el fitxer i torna a publicar amb `bash tools/publish_clients.sh`.
- Es tradueix la interfície i les categories; els noms i descripcions dels productes es queden com els dona el proveïdor.
- La comanda de WhatsApp sempre arriba en català, amb una línia que diu l'idioma del client si no és el català.

### Recomanats de portada i venda creuada

`data/promo.json` decideix què surt a la secció **Recomanats** de la portada (sota les categories) i els productes de **"Sovint es compra amb…"** de cada fitxa. Serveix per al catàleg intern i per al de clients.

- `recomanats`: targetes amb etiqueta (`badge`), títol i frase de venda (`pitch`). Les de tipus `pack` porten diversos productes i un botó que els afegeix tots a la comanda d'un toc.
- `crossSell`: regles per subcategoria (`{"subcat": "discs-tall"}`) o per producte concret (`{"idx": 970}`); val la primera que coincideix. Si falten productes, s'omple amb altres de la mateixa categoria.
- Cada producte porta `idx` i `ref`; si l'índex deixa d'apuntar a la mateixa referència, el build s'atura i avisa.
- Els productes que afegeixis a la llista ⭐ Recomanats des de l'app també surten a la portada, darrere dels de `promo.json`.

### Catàleg amb contrasenya (GitHub Pages)

`tools/publish_pages.sh` publica el catàleg NEXE **xifrat**: porta preus, clients i costos (si hi ha `private/`), però sense la contrasenya és illegible, encara que el repositori i la web siguin públics. L'app Crown (`/crown/`) i el web de clients no canvien.

- Xifratge: `tools/xifrar.py` (ECDH P-256 + AES-256-GCM; la clau privada va dins `clau.json` protegida amb la contrasenya, PBKDF2-SHA256 de 600.000 iteracions). La pàgina d'entrada és `src/xifrat.html`.
- **Canviar la contrasenya** des de l'iPad: obrir la web amb `?clau` al final (o l'enllaç "Canviar la contrasenya"), posar l'actual i la nova, copiar el text i enganxar-lo a `clau.json` de la branca `gh-pages` a GitHub. Les publicacions següents agafen sempre el `clau.json` publicat, així que el canvi no es perd.
- **Oblidar l'iPad** (tornar a demanar la contrasenya): obrir la web amb `?oblidar`.
- Si s'oblida la contrasenya: `python3 tools/xifrar.py init` crea una clau nova (`data/clau-pagina.json`); cal esborrar `clau.json` de `gh-pages` abans de tornar a publicar.

### Web per a clients: sempre en línia

`tools/publish_clients.sh` també hi publica l'app Crown (amb preus) a `/crown/` (www.nexeindustrial.es/crown/). La neteja de còpies offline del web de clients no toca la de Crown.

El web de clients (`tools/client_app.py`) no es descarrega sencer: l'HTML només porta les dades (uns 2 MB, mig MB comprimit) i les fotos són fitxers a `imgs/` que es carreguen quan es veuen. No té còpia sense connexió; el seu `sw.js` només esborra la que desaven les versions anteriors.

### Preus Crown a partir dels costos

`python3 cataleg-crown/calcular_preus.py` llegeix els costos (`private/crown_netos_2026.xlsx`, no es publica) i escriu `cataleg-crown/preus_nexe.json` (només preu i ports, sense costos), que fan servir el PDF, l'app Crown i el catàleg general. Regles: ports segons el tipus (+10/+5, carregadors 0); sense ports si el cost és de 300 € o més; preu mínim = cost / 0,7 (30 % de marge sobre venda) + ports, arrodonit amunt a ,90 o ,00. També deixa `dist/Crown_marges.csv` per revisar marges.
