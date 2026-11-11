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

**Com a app instal·lable.** Puja el contingut de `dist/lleuger/` a qualsevol
allotjament web amb HTTPS. Des de Safari, l'iPad l'afegeix a la pantalla
d'inici amb *Compartir → Afegir a la pantalla d'inici*; el Mac, amb
*Arxiu → Afegir al Dock*. El service worker el desa per obrir-lo sense
connexió, i cada build nou canvia la versió perquè els dispositius rebin
l'actualització la propera vegada que tinguin connexió.

- **GitHub Pages:** *Settings → Pages*, branca amb `dist/` publicat. Tingues
  en compte que serà **públic**: qualsevol amb l'enllaç veurà els preus.
  Publica-hi només el build sense `--with-private`.
- **Claude:** es pot tornar a publicar `dist/lleuger/index.html` com a
  artifact privat.

**Pujar els canvis al repositori:**

```bash
git add data images src public tools README.md .gitignore
git commit -m "Descripció del canvi"
git push
```

Quan la branca de desenvolupament estigui revisada, s'integra a `main` amb un
*pull request* a GitHub.

---

## Recuperació

- El catàleg original de Claude (versió lleugera) és a la branca
  `backup-original-claude` (`original/index.html`). Les fotos a resolució
  completa són a `images/` d'aquesta branca.
- Qualsevol versió anterior es recupera amb `git log` i `git checkout <commit>`.
- `python3 tools/nexe.py verify <fitxer.html>` comprova que un build
  coincideix amb un HTML de referència (codi idèntic i dades idèntiques).
