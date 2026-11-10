/* Nexe Catàleg — service worker
 * Permet instal·lar el catàleg i obrir-lo sense connexió quan es publica
 * en un servidor web (GitHub Pages o similar). El catàleg porta totes les
 * dades i imatges dins index.html, així que n'hi ha prou de guardar aquest
 * fitxer i els pocs recursos de l'aplicació.
 * La versió la substitueix tools/nexe.py a cada build: quan canvia, el
 * navegador instal·la el nou service worker i la pàgina es recarrega.
 */
var VERSION = '__BUILD_VERSION__';
var CACHE = 'nexe-cataleg-' + VERSION;
var CORE = ['./', './index.html', './manifest.json',
            './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) { return cache.addAll(CORE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k.indexOf('nexe-cataleg-') === 0 && k !== CACHE;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Firebase, CDN: sense intervenir

  // Pàgina: primer la xarxa (per rebre actualitzacions), si falla la còpia guardada.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
        return res;
      }).catch(function () {
        return caches.match('./index.html');
      })
    );
    return;
  }

  // Resta de recursos: primer la còpia guardada.
  event.respondWith(
    caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        if (res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});

// L'aplicació envia la llista d'imatges per desar-les; aquí ja són dins
// l'HTML, així que el missatge s'ignora.
self.addEventListener('message', function () {});
