
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  var _swRefreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', function(){
    if(_swRefreshing) return;
    _swRefreshing = true;
    window.location.reload();
  });
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js', {scope: './'}).catch(function (err) {
      console.warn('Offline no disponible:', err);
    });
  });
}
