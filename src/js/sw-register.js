if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  var _swRefreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', function(){
    if(_swRefreshing) return;
    _swRefreshing = true;
    window.location.reload();
  });

  // Estat de la còpia sense connexió: "Desant…" mentre baixa, i un avís quan ja està.
  var _offBanner = null, _offTimer = null, _offTries = 0;
  function _offShow(text, done){
    if(!_offBanner){
      _offBanner = document.createElement('div');
      _offBanner.style.cssText = 'position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9999;color:#fff;padding:12px 20px;border-radius:14px;font:600 15px -apple-system,system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.25);max-width:90vw;text-align:center';
      document.body.appendChild(_offBanner);
    }
    _offBanner.style.background = done ? '#248a3d' : '#1d1d1f';
    _offBanner.textContent = text;
  }
  function _offHide(){ if(_offBanner){ _offBanner.remove(); _offBanner = null; } }
  navigator.serviceWorker.addEventListener('message', function(e){
    var d = e.data || {};
    if(d.type !== 'NEXE_OFFLINE_STATUS') return;
    var seen = null;
    try { seen = localStorage.getItem('nexe_offline_ok'); } catch(err) {}
    if(d.ready){
      clearTimeout(_offTimer);
      if(seen === d.version){ _offHide(); return; }
      // Si la pàgina s'ha de recarregar per passar a la versió desada,
      // l'avís es mostra després de recarregar (si no, no es veuria).
      setTimeout(function(){
        if(_swRefreshing) return;
        _offShow('✓ Catàleg desat: ja funciona sense connexió', true);
        setTimeout(function(){
          try { localStorage.setItem('nexe_offline_ok', d.version); } catch(err) {}
          _offHide();
        }, 5000);
      }, 400);
    } else if(navigator.onLine !== false){
      if(seen !== d.version) _offShow('⏳ Desant el catàleg per fer-lo servir sense connexió… Deixa l\'app oberta.');
      _offSchedule();
    }
  });
  function _offAsk(){
    navigator.serviceWorker.getRegistration('./').then(function(reg){
      var w = navigator.serviceWorker.controller || (reg && reg.active);
      if(w && !(reg && reg.installing)){ w.postMessage({ type: 'NEXE_OFFLINE_STATUS' }); return; }
      // Encara s'està descarregant (primera vegada o versió nova)
      var seen = null;
      try { seen = localStorage.getItem('nexe_offline_ok'); } catch(err) {}
      if(!seen && navigator.onLine !== false) _offShow('⏳ Desant el catàleg per fer-lo servir sense connexió… Deixa l\'app oberta.');
      _offSchedule();
    });
  }
  function _offSchedule(){
    clearTimeout(_offTimer);
    if(++_offTries > 120) return; // ~10 minuts
    _offTimer = setTimeout(_offAsk, 5000);
  }
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js', {scope: './'}).then(function(){
      setTimeout(_offAsk, 1500);
    }).catch(function (err) {
      console.warn('Offline no disponible:', err);
    });
  });
}
