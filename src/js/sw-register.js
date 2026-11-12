if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  var _swRefreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', function(){
    if(_swRefreshing) return;
    _swRefreshing = true;
    window.location.reload();
  });
  // Avís (un sol cop per versió) quan el catàleg ja funciona sense connexió
  navigator.serviceWorker.addEventListener('message', function(e){
    var d = e.data || {};
    if(d.type !== 'NEXE_OFFLINE_STATUS' || !d.ready) return;
    try { if(localStorage.getItem('nexe_offline_ok') === d.version) return; localStorage.setItem('nexe_offline_ok', d.version); } catch(err) {}
    var t = document.createElement('div');
    t.textContent = '✓ Catàleg desat: ja funciona sense connexió';
    t.style.cssText = 'position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9999;background:#1d1d1f;color:#fff;padding:12px 20px;border-radius:14px;font:600 15px -apple-system,system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.25)';
    document.body.appendChild(t);
    setTimeout(function(){ t.remove(); }, 4500);
  });
  function _askOfflineStatus(){
    navigator.serviceWorker.ready.then(function(reg){
      if(reg.active) reg.active.postMessage({ type: 'NEXE_OFFLINE_STATUS' });
    });
  }
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js', {scope: './'}).then(function(){
      setTimeout(_askOfflineStatus, 3000);
    }).catch(function (err) {
      console.warn('Offline no disponible:', err);
    });
  });
}
