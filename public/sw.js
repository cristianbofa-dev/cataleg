/* Nexe Catàleg — service worker
 * Fa que el catàleg instal·lat a la pantalla d'inici funcioni sense connexió.
 * El primer cop que s'obre amb internet desa la pàgina, les fotos
 * addicionals (fotos-extra.js) i les icones. Després s'obre sempre des
 * d'aquesta còpia, i amb connexió comprova si hi ha una versió nova.
 * La versió la posa tools/nexe.py a cada build: quan canvia, es desa la
 * versió nova i l'app es recarrega sola.
 */
var VERSION = '__BUILD_VERSION__';
var CACHE = 'nexe-cataleg-' + VERSION;
var CORE = ['./', './index.html', './fotos-extra.js', './manifest.json',
            './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
var OTHER_APPS = ['crown/']; // subcarpetes amb una app independent
var NETWORK_TIMEOUT = 4000; // amb poca cobertura, no esperar més: obrir la còpia desada

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // Un a un: si un fitxer opcional no hi és, la resta es desa igualment
      return Promise.all(CORE.map(function (url) {
        return cache.add(new Request(url, { cache: 'reload' })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k.indexOf('nexe-cataleg-') === 0 && k !== CACHE;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
      .then(notifyClients)
  );
});

function offlineStatus() {
  return caches.open(CACHE).then(function (cache) {
    return Promise.all(['./index.html', './fotos-extra.js'].map(function (u) { return cache.match(u); }));
  }).then(function (hits) {
    return { type: 'NEXE_OFFLINE_STATUS', ready: !!(hits[0] && hits[1]), version: VERSION };
  });
}
function notifyClients() {
  return offlineStatus().then(function (st) {
    return self.clients.matchAll({ type: 'window' }).then(function (list) {
      list.forEach(function (c) { c.postMessage(st); });
    });
  });
}

function fromNetwork(req, ms) {
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () { reject(new Error('timeout')); }, ms);
    fetch(req).then(function (res) { clearTimeout(timer); resolve(res); },
                    function (err) { clearTimeout(timer); reject(err); });
  });
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // altres webs: sense intervenir
  // Les apps que viuen en una subcarpeta (p. ex. crown/) tenen el seu propi service worker
  var scopePath = new URL(self.registration.scope).pathname;
  var rel = url.pathname.indexOf(scopePath) === 0 ? url.pathname.slice(scopePath.length) : '';
  for (var i = 0; i < OTHER_APPS.length; i++) if (rel.indexOf(OTHER_APPS[i]) === 0) return;

  // Pàgina: la xarxa si respon ràpid (per tenir la darrera versió); si no, la còpia.
  if (req.mode === 'navigate') {
    event.respondWith(
      fromNetwork(req, NETWORK_TIMEOUT).then(function (res) {
        if (res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
        }
        return res;
      }).catch(function () {
        return caches.match('./index.html').then(function (hit) {
          return hit || caches.match('./');
        });
      })
    );
    return;
  }

  // Resta (fotos-extra.js, icones…): primer la còpia desada.
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (hit) {
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

// La pàgina pregunta si ja ho té tot desat per funcionar sense connexió
self.addEventListener('message', function (event) {
  if (!event.data || event.data.type !== 'NEXE_OFFLINE_STATUS') return;
  offlineStatus().then(function (st) { if (event.source) event.source.postMessage(st); });
});
