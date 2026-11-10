
if (location.protocol === 'file:') {
  console.log('[SQLite] file:// detected, skipping SQLite, using legacy data');
  window._sqliteReady = 'skip';
} else {
  try {
    const bridge = await import('./src/catalog/catalog-bridge.js');
    await bridge.init();
    window._catalogBridge = bridge;
    window._catalogService = await import('./src/catalog/catalog-service.js');
    console.log('[SQLite] Bridge ready:', bridge.getDiagnostics());
    window._sqliteReady = true;
  } catch (err) {
    console.warn('[SQLite] Error:', err.message);
    window._sqliteReady = false;
  }
}
