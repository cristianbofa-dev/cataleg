/* Controls per a les edicions públiques. */
(function () {
  'use strict';
  var consentKey = 'nexe_external_media';
  var lifetime = 365 * 24 * 60 * 60 * 1000;
  var photoOrigins = ['https://www.insemactools.es', 'https://www.cimaser.com'];
  var videoOrigins = ['https://www.youtube.com'];

  function readConsent() {
    try {
      var value = JSON.parse(localStorage.getItem(consentKey));
      if (value && value.version === 1 && value.expires > Date.now()) return value;
    } catch (error) {}
    return null;
  }

  window.nexeMediaAllowed = function (source, kind) {
    var choice = readConsent();
    if (!choice || choice[kind] !== true) return false;
    var origins = kind === 'photos' ? photoOrigins : videoOrigins;
    try { return origins.includes(new URL(source).origin); }
    catch (error) { return false; }
  };

  window.nexeWhatsAppDraft = function (text, isList) {
    var dialog = document.getElementById('waDraft');
    document.getElementById('waTitle').textContent = isList ? 'Comparteix la llista' : 'Sol·licitud comercial';
    document.getElementById('waIntro').textContent = isList
      ? 'Copia el text i enganxa’l a l’aplicació on vulguis compartir la llista.'
      : 'Copia l’esborrany i enganxa’l al xat. Revisa’l abans d’enviar el missatge a NEXE Industrial.';
    document.getElementById('waOpen').hidden = Boolean(isList);
    dialog.querySelector('textarea').value = text;
    document.getElementById('waStatus').textContent = '';
    dialog.showModal();
  };

  document.addEventListener('DOMContentLoaded', function () {
    var draft = document.getElementById('waDraft');
    var text = document.getElementById('waText');
    var status = document.getElementById('waStatus');
    draft.addEventListener('close', function () { text.value = ''; });
    document.getElementById('waCopy').addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(text.value);
        status.textContent = 'Missatge copiat.';
      } catch (error) {
        text.focus();
        text.select();
        status.textContent = 'Copia el text seleccionat amb les opcions del teu dispositiu.';
      }
    });

    var settings = document.getElementById('mediaSettings');
    if (!settings) return;
    var form = document.getElementById('mediaForm');
    var notice = document.getElementById('mediaNotice');
    var initial = readConsent();
    notice.hidden = Boolean(initial);

    function save(photos, videos) {
      try {
        localStorage.setItem(consentKey, JSON.stringify({
          version: 1, expires: Date.now() + lifetime, photos: photos, videos: videos
        }));
      } catch (error) {
        document.getElementById(settings.open ? 'mediaStatus' : 'mediaNoticeStatus').textContent =
          'El navegador no ha pogut desar la tria.';
        return;
      }
      notice.hidden = true;
      if (settings.open) settings.close();
      if (photos !== Boolean(initial && initial.photos) || videos !== Boolean(initial && initial.videos)) {
        location.reload();
      }
    }

    document.addEventListener('click', function (event) {
      if (!event.target.closest('[data-media-settings]')) return;
      var choice = readConsent();
      form.elements.photos.checked = Boolean(choice && choice.photos);
      form.elements.videos.checked = Boolean(choice && choice.videos);
      settings.showModal();
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      save(form.elements.photos.checked, form.elements.videos.checked);
    });
    ['mediaReject', 'mediaNone'].forEach(function (id) {
      document.getElementById(id).addEventListener('click', function () { save(false, false); });
    });
    ['mediaAccept', 'mediaAll'].forEach(function (id) {
      document.getElementById(id).addEventListener('click', function () { save(true, true); });
    });
    function syncConsent() {
      var choice = readConsent();
      if (Boolean(choice && choice.photos) !== Boolean(initial && initial.photos) ||
          Boolean(choice && choice.videos) !== Boolean(initial && initial.videos)) location.reload();
    }
    window.addEventListener('storage', syncConsent);
    window.addEventListener('pageshow', function (event) { if (event.persisted) syncConsent(); });
  });
})();
