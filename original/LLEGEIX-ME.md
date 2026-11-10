# Còpia de seguretat del Catàleg NEXE original

`index.html` és una còpia del catàleg tal com estava publicat a Claude el
10/11/2026 (versió 17 de l'artifact "Nexe Catàleg"): un únic fitxer HTML amb
productes, preus de venda, variants i imatges incrustades.

S'ha tret el següent abans de pujar-lo a GitHub (el repositori és públic):

- la llista de clients precarregada (`initialClients`), que queda buida;
- la configuració i les credencials de Firebase, que queden en blanc;
- els preus de cost (de productes i de variants), que queden a `null`.

Aquestes dades es conserven a part, fora del repositori (carpeta `private/`).
Sense elles el catàleg funciona igual; només no sincronitza clients amb Firebase.

Per obrir-lo: descarrega `index.html` i obre'l amb Safari o Chrome.
