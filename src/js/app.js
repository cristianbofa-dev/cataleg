
/* Nexe Catàleg — Commercial iPad PWA */
(function(){
'use strict';

let PRODS = typeof insemac_products !== 'undefined' ? insemac_products : [];
const LISTS_KEY = 'nexe_comercial_lists_v2';
const PRES_KEY = 'nexe_comercial_presentation';
const NAV_CATEGORIES = [
  { id:'tall', nom:'Tall', icon:'🔪', img:'imatges/tall.JPG',
    cats:['tall'],
    subcats:[
      { id:'discs-tall', nom:'Discs de tall' },
      { id:'freses-tall', nom:'Freses i broques' },
      { id:'guies-suports', nom:'Guies i suports' }
    ]
  },
  { id:'polit', nom:'Polit i acabat', icon:'✨', img:'imatges/polit i acabat.JPG',
    cats:['polit'],
    subcats:[
      { id:'corones-abrasives', nom:'Corones abrasives' },
      { id:'lijes-papers', nom:'Lijes i papers' },
      { id:'cepells-envellir', nom:'Cepells d\'envellir' },
      { id:'abrillantadors-ceres', nom:'Abrillantadors i ceres' },
      { id:'rodets-plats', nom:'Rodets i plats' },
      { id:'maquines-polit', nom:'Màquines de polit' }
    ]
  },
  { id:'adhesius', nom:'Adhesius i segellat', icon:'🧴', img:'imatges/adhesius i segellat.JPG',
    cats:['adhesius'],
    subcats:[
      { id:'juntes-invisibles', nom:'Juntes invisibles' },
      { id:'silicones-polimers', nom:'Silicones i polímers MS' },
      { id:'masilles-pegaments', nom:'Massilles i pegaments' },
      { id:'pistolets-broquets', nom:'Pistolets i broquets' }
    ]
  },
  { id:'quimics', nom:'Químics i reparació', icon:'🧪', img:'imatges/quimics i reparacio.JPG',
    cats:['quimics'],
    subcats:[
      { id:'neteja-manteniment', nom:'Neteja i manteniment' },
      { id:'proteccio-pedra', nom:'Protecció de la pedra' },
      { id:'decapat-colorants', nom:'Decapat i colorants' },
      { id:'antilliscants-reparacio', nom:'Antilliscants i reparació' }
    ]
  },
  { id:'man-inst', nom:'Manipulació i instal·lació', icon:'🏗️', img:'imatges/manipulacio i instalacio.PNG',
    cats:['manipulacio','instalacio'],
    subcats:[
      { id:'ventoses', nom:'Ventoses', filter:{subcat:'ventoses'} },
      { id:'pinces-grapes', nom:'Pinces i grapes', filter:{subcat:['pinces-grapes','cintes-adhesives']} },
      { id:'carros-caballets', nom:'Carros i caballets', filter:{cat:'equip',subcat:'bancs-carros-caballet'} },
      { id:'refors-anclatges', nom:'Reforços i anclatges', filter:{subcat:'refors-anclatges'} },
      { id:'nivellacio', nom:'Nivellació i mesura', filter:{subcat:['nivells-mesura','perfils-accessoris','flejat-embalatge']} }
    ]
  },
  { id:'maquinaria', nom:'Maquinària', icon:'⚙️', img:'imatges/maquinaria.PNG',
    cats:['maquinaria'],
    subcats:[
      { id:'compressors', nom:'Compressors' },
      { id:'amoladores-talladores', nom:'Amoladores i talladores' },
      { id:'taladres', nom:'Taladres' },
      { id:'eines-neumatiques', nom:'Eines neumàtiques' }
    ]
  },
  { id:'seguretat-taller', nom:'Seguretat i taller', icon:'🦺', img:'imatges/seguretat.PNG',
    cats:['equip'],
    subcats:[
      { id:'emmagatzematge', nom:'Emmagatzematge' },
      { id:'calçat', nom:'Calçat de seguretat' },
      { id:'mascaretes-proteccio', nom:'Mascaretes i protecció' },
      { id:'roba-guants', nom:'Roba i guants' },
      { id:'eines-taller', nom:'Eines de taller' },
      { id:'higiene-consumibles', nom:'Higiene i consumibles' }
    ]
  },
  { id:'funerari', nom:'Art funerari', icon:'🕊️', img:'imatges/funerari_menu.jpg',
    cats:['funerari'],
    subcats:[
      { id:'funerari', nom:'Art funerari' }
    ]
  },
];

function _resolveImgPath(s){
  if(typeof s !== 'string') return s;
  if(s.indexOf('data:') === 0 || s.indexOf('http') === 0) return s;
  var m = (typeof window !== 'undefined') ? window.__IMG_DATA__ : null;
  return (m && Object.prototype.hasOwnProperty.call(m, s)) ? m[s] : s;
}
// Retorna una adreça d'imatge que es pot mostrar, o '' si no n'hi ha.
// Una ruta relativa (imgs/...) que no és dins del catàleg no es pot carregar
// quan el fitxer s'obre des del disc (file://): Safari la bloqueja.
function _imgSrc(s){
  if(!s || typeof s !== 'string') return '';
  var r = _resolveImgPath(s);
  if(r.indexOf('data:') === 0 || r.indexOf('http') === 0 || r.indexOf('blob:') === 0) return r;
  return location.protocol === 'file:' ? '' : r;
}
(function(){
  for(var ci=0; ci<NAV_CATEGORIES.length; ci++){
    if(NAV_CATEGORIES[ci].img) NAV_CATEGORIES[ci].img = _resolveImgPath(NAV_CATEGORIES[ci].img);
  }
  for(var pi=0; pi<PRODS.length; pi++){
    var pr = PRODS[pi];
    if(pr.i) pr.i = _resolveImgPath(pr.i);
    if(pr.imgs && pr.imgs.length){
      for(var gi=0; gi<pr.imgs.length; gi++) pr.imgs[gi] = _resolveImgPath(pr.imgs[gi]);
    }
  }
})();

const ADVISOR_STEPS = [
  {key:'work',title:'Quin treball s’ha de fer?',sub:'Aquesta decisió defineix l’ordre de les recomanacions.',options:[['cut','Tall','Disc, refrigeració i guia'],['glue','Enganxat','Adhesiu, preparació i unió'],['polish','Polit','Abrasius, polit i acabat'],['repair','Reparació','Reomplir, consolidar i acabar'],['install','Instal·lació','Manipulació, fixació i segellat']]},
  {key:'material',title:'Quin material treballareu?',sub:'La compatibilitat del material pesa més que la marca.',options:[['Granito','Granit','Dur i abrasiu'],['Mármol','Marbre','Més sensible'],['Porcelánico','Porcellànic','Tècnic i compacte'],['Cuarzo','Quars','Compacte'],['Sinterizado','Sinteritzat','Superfície tècnica']]},
  {key:'thickness',title:'Quin gruix té la peça?',sub:'Ajusta el control, la velocitat i l’eina de treball.',options:[['thin','Fins a 12 mm','Peça lleugera'],['standard','12–20 mm','Gruix estàndard'],['thick','Més de 20 mm','Peça massissa']]},
  {key:'environment',title:'On quedarà la peça?',sub:'Condiciona la resistència de l’adhesiu i el segellat.',options:[['interior','Interior','Condicions controlades'],['exterior','Exterior','Humitat, UV i temperatura']]},
  {key:'location',title:'On es farà el treball?',sub:'La mobilitat i la neteja canvien l’elecció de l’eina.',options:[['workshop','Taller','Precisió i producció'],['site','Obra','Mobilitat i muntatge']]},
  {key:'finish',title:'Quin nivell d’acabat necessita?',sub:'Prioritza velocitat, qualitat visual o una junta discreta.',options:[['functional','Funcional','Resistent i àgil'],['premium','Premium','Acabat molt uniforme'],['invisible','Junta invisible','Màxima integració visual']]},
  {key:'machine',title:'Quina màquina utilitzarà?',sub:'Evitem recomanar consumibles incompatibles amb el vostre equip.',options:[['grinder','Amoladora','Tall i desbast manual'],['bridge','Talladora de pont','Tall recte amb aigua'],['cnc','CNC','Producció i perfils'],['polisher','Polidora','Polit i acabat'],['manual','Manual','Muntatge i reparació']]}
];

let customLists = [], presentation = false, searchIdx = null;
let currentPage = 'home', navStack = [], _pages = null, advisorStep = 0, advisorAnswers = {};
let _returnCtx = null, _currentSubcat = null, _currentFilter = null, _lastSearch = '';

// Variant groups helpers
var autoVariantGroups = [];

function autoDetectVariantGroups(){
  autoVariantGroups = [];
  var groups = {};
  for(var i=0;i<PRODS.length;i++){
    var p = PRODS[i];
    if(p.variantGroup) continue;
    if(p.fam === 'vezzani') continue;
    var base = extractProductBaseName(p.n);
    if(!base || base.length < 3) continue;
    var key = ((p.b||'')+'::'+base).toLowerCase();
    if(!groups[key]) groups[key] = {base:base, brand:p.b||'', members:[], name:base};
    groups[key].members.push({idx:i, p:p});
  }
  var gid = 1;
  for(var key in groups){
    var g = groups[key];
    if(g.members.length >= 2){
      g.id = 'auto-'+gid++;
      autoVariantGroups.push(g);
    }
  }
}

function extractProductBaseName(name){
  if(!name) return null;
  var n = name.replace(/\s*\|.*$/, '').trim();
  if(!n) return null;
  var patterns = [
    /[,\s]*D\.?\s*[\d.,]+(?:\s*x\s*[\d.,]+)?\s*(?:mm|cm|″|")?\s*$/i,
    /[,\s]*H\.?\s*[\d.,]+\s*(?:mm)?\s*$/i,
    /[,\s]*h\.?\s*[\d.,]+\s*[-/]\s*[\d.,]+\s*(?:mm)?\s*$/i,
    /[,\s]*L\.?\s*[\d.,]+\s*(?:mm|cm)?\s*$/i,
    /[,\s]*[\d.,]+\s*x\s*[\d.,]+(?:\s*x\s*[\d.,]+)?\s*(?:mm|cm)?\s*$/i,
    /[,\s]*Gr\.?\s*[\d./]+\s*$/i,
    /[,\s]*[\d.,]+\s*(?:cv|W|HP|w)\s*$/i,
    /[,\s]*[\d.,]+\s*l(?:ts?)?\s*$/i,
    /[,\s]*[\d.,]+\s*bar\s*$/i,
    /[,\s]*[\d.,]+\s*l\s*\/?\s*min\s*$/i,
    /[,\s]*(?:Insonoro|insonoro|en\s+humedo|en\s+seco)\s*$/i,
    /\s*\([^)]*\)\s*$/,
  ];
  for(var pi=0;pi<patterns.length;pi++) n = n.replace(patterns[pi], '');
  n = n.trim();
  return n.length > 0 ? n : null;
}

function getVariantMemberLabel(member, def){
  if(member.label) return member.label;
  var suffix = getMemberSuffix(member.p.n, def.base||def.name);
  if(suffix) return suffix;
  if(member.p.r) return 'Ref. '+member.p.r;
  return member.p.n ? member.p.n.substring(0,40) : 'Opció';
}

function getMemberSuffix(fullName, baseName){
  if(!fullName || !baseName) return '';
  var name = fullName.replace(/\s*\|.*$/, '').trim();
  var base = baseName.trim();
  var idx = name.toLowerCase().indexOf(base.toLowerCase());
  if(idx === -1) return '';
  var suffix = name.substring(idx + base.length).trim();
  // Clean up leading punctuation/whitespace
  suffix = suffix.replace(/^[,:\s]+/, '');
  return suffix || '';
}

function getVariantGroupDef(id){
  if(typeof insemac_variant_groups !== 'undefined'){
    for(var i=0;i<insemac_variant_groups.length;i++){
      if(insemac_variant_groups[i].id === id) return insemac_variant_groups[i];
    }
  }
  for(var i=0;i<autoVariantGroups.length;i++){
    if(autoVariantGroups[i].id === id) return autoVariantGroups[i];
  }
  return null;
}
function getVariantProducts(groupId){
  var def = getVariantGroupDef(groupId);
  if(def && def.autoDetected && def.members) return def.members;
  if(!groupId.startsWith('auto-')){
    var out = [];
    for(var i=0;i<PRODS.length;i++){ if(PRODS[i].variantGroup === groupId) out.push({p:PRODS[i],idx:i}); }
    if(out.length > 0) return out;
    if(def && def.members) return def.members;
  }
  for(var i=0;i<autoVariantGroups.length;i++){
    if(autoVariantGroups[i].id === groupId) return autoVariantGroups[i].members;
  }
  return [];
}
function getVariantProduct(groupId, options){
  var def = getVariantGroupDef(groupId);
  if(def && !def.autoDetected){
    for(var i=0;i<PRODS.length;i++){
      var p = PRODS[i];
      if(p.variantGroup !== groupId) continue;
      var match = true;
      if(options && p.variantOptions){
        for(var k in options){
          if(p.variantOptions[k] !== options[k]){ match = false; break; }
        }
      }
      if(match) return {p:p, idx:i};
    }
    return null;
  }
  if(def && def.autoDetected && def.members){
    var selectedIdx = options && options._idx !== undefined ? parseInt(options._idx) : 0;
    if(selectedIdx >= 0 && selectedIdx < def.members.length) return def.members[selectedIdx];
    return def.members[0];
  }
  return null;
}

function getProductVariantGroupId(productIdx){
  // Check auto-detected groups
  for(var gi=0;gi<autoVariantGroups.length;gi++){
    var g = autoVariantGroups[gi];
    for(var mi=0;mi<g.members.length;mi++){
      if(g.members[mi].idx === productIdx) return g.id;
    }
  }
  // Check INSEMAC variant groups (insemac_variant_groups with members array)
  if(typeof insemac_variant_groups !== 'undefined'){
    for(var gi=0;gi<insemac_variant_groups.length;gi++){
      var g = insemac_variant_groups[gi];
      if(g.members && g.autoDetected){
        for(var mi=0;mi<g.members.length;mi++){
          if(g.members[mi].idx === productIdx) return g.id;
        }
      }
    }
  }
  return null;
}

// Show error on screen
function showError(msg){
  const el = document.getElementById('page-home');
  if(el) el.innerHTML = '<div style="padding:40px;color:#c00"><h2>Error</h2><pre style="white-space:pre-wrap">'+escHtml(msg)+'</pre></div>';
}

function escHtml(s){
  if(!s) return '';
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/* ── Edit Mode ── */
var _editMode = false;
var _editOverrides = {};  // {idx: {price: X}} or {idx: {deleted: true}}

function _loadEditOverrides(){
  try { _editOverrides = JSON.parse(localStorage.getItem('nexe_edit_overrides') || '{}'); } catch(e){ _editOverrides = {}; }
}
function _saveEditOverrides(){
  localStorage.setItem('nexe_edit_overrides', JSON.stringify(_editOverrides));
}


function _openAddProduct(){
  document.getElementById('editAddOverlay').classList.add('active');
  document.getElementById('editAddName').value = '';
  document.getElementById('editAddRef').value = '';
  document.getElementById('editAddPrice').value = '';
  document.getElementById('editAddDesc').value = '';
  document.getElementById('editAddImg').value = '';
  _clearVariantRows();
  document.getElementById('editAddName').focus();
}

function _saveNewProduct(){
  var name = document.getElementById('editAddName').value.trim();
  var price = parseFloat(document.getElementById('editAddPrice').value);
  var _vrows = _readVariantRows(document.getElementById('editAddVariants'));
  if(_vrows.length && isNaN(price)) price = _vrows[0].price;
  if(!name){ document.getElementById('editAddName').style.borderColor='#ff3b30'; return; }
  if(isNaN(price)){ document.getElementById('editAddPrice').style.borderColor='#ff3b30'; return; }

  var newProd = {
    n: name,
    r: document.getElementById('editAddRef').value.trim() || 'NOU-'+Date.now(),
    p: price,
    b: document.getElementById('editAddBrand').value.trim() || 'NEXE',
    s: '',
    i: document.getElementById('editAddImg').value.trim() || _imgPlaceholder,
    d: document.getElementById('editAddDesc').value.trim(),
    cat: document.getElementById('editAddCat').value,
    subcat: document.getElementById('editAddCat').value === 'funerari' ? 'funerari' : '',
    fam: 'custom',
    aplic: [],
    tipus: 'producte',
    unitat: 'unitat',
    imgs: [],
    variants: [],
    star: 0,
    _custom: true
  };
  if(_vrows.length){
    newProd.insemacVariants = [];
    for(var _vi=0;_vi<_vrows.length;_vi++) newProd.insemacVariants.push({id: 930000 + Date.now()%100000 + _vi, label: _vrows[_vi].label, price: _vrows[_vi].price, star: 0});
  }

  // Add to PRODS
  PRODS.push(newProd);
  _clearVariantRows();
  var newIdx = PRODS.length - 1;

  // Save to localStorage overrides
  var customProds = JSON.parse(localStorage.getItem('nexe_custom_products') || '[]');
  customProds.push(newProd);
  localStorage.setItem('nexe_custom_products', JSON.stringify(customProds));

  document.getElementById('editAddOverlay').classList.remove('active');

  // Re-render current view
  if(currentPage && currentPage.startsWith('category/')){
    showCategory(currentPage.split('/')[1], _currentSubcat, _currentFilter, _pages);
  } else {
    showHome(_pages);
  }

  // Re-apply edit overlay
  setTimeout(function(){ _showEditOverlay(); }, 100);
}

// Load custom products on init
function _loadCustomProducts(){
  try {
    var customProds = JSON.parse(localStorage.getItem('nexe_custom_products') || '[]');
    for(var i=0; i<customProds.length; i++){
      PRODS.push(customProds[i]);
    }
  } catch(e){}
}
_loadCustomProducts();

var _editObserver = null, _editOverlayScheduled = false;
function _scheduleEditOverlay(){
  if(_editOverlayScheduled) return;
  _editOverlayScheduled = true;
  var run = function(){ _editOverlayScheduled = false; if(_editMode) _showEditOverlay(); };
  if(window.requestAnimationFrame) requestAnimationFrame(run); else setTimeout(run, 50);
}
function _startEditObserver(){
  if(_editObserver || !window.MutationObserver) return;
  _editObserver = new MutationObserver(function(){ _scheduleEditOverlay(); });
  _editObserver.observe(document.body, {childList:true, subtree:true});
}
function _stopEditObserver(){
  if(_editObserver){ _editObserver.disconnect(); _editObserver = null; }
}

function _applyEditModeUI(){
  document.body.classList.toggle('edit-mode', _editMode);
  var fab = document.getElementById('editAddFab');
  if(fab) fab.style.display = _editMode ? 'flex' : 'none';
  var btn = document.getElementById('btnEditMode');
  if(btn) btn.classList.toggle('editing', _editMode);
  var banner = document.getElementById('editModeBanner');
  if(_editMode){
    if(!banner){
      banner = document.createElement('div');
      banner.id = 'editModeBanner';
      banner.textContent = '\u270f\ufe0f MODE EDICIÓ \u2014 toca \u2715 per eliminar \u00b7 toca el preu per editar';
      document.body.appendChild(banner);
    }
    banner.style.display = 'block';
    _startEditObserver();
    _showEditOverlay();
  } else if(banner){
    banner.style.display = 'none';
    _stopEditObserver();
    _hideEditOverlay();
  }
}

function _restoreEditMode(){
  try{
    if(localStorage.getItem('nexe_edit_mode') === '1'){
      var hasOverrides = false;
      try { var ov = JSON.parse(localStorage.getItem('nexe_edit_overrides') || '{}'); hasOverrides = ov && Object.keys(ov).length > 0; } catch(e){}
      if(hasOverrides){
        _editMode = true;
        _applyEditModeUI();
      } else {
        localStorage.setItem('nexe_edit_mode', '0');
      }
    }
  }catch(e){}
}
if(document.readyState === 'complete' || document.readyState === 'interactive'){
  setTimeout(_restoreEditMode, 0);
} else {
  document.addEventListener('DOMContentLoaded', _restoreEditMode);
}

function toggleEditMode(){
  _editMode = !_editMode;
  try{ localStorage.setItem('nexe_edit_mode', _editMode ? '1' : '0'); }catch(e){}
  _applyEditModeUI();
  if(!_editMode){
    // Re-render current view to apply changes
    if(currentPage && currentPage.startsWith('category/')){
      showCategory(currentPage.split('/')[1], _currentSubcat, _currentFilter, _pages);
    } else {
      showHome(_pages);
    }
  }
}

function _buildExportJson(){
  var out = {};
  Object.keys(_editOverrides).forEach(function(k){ out[k] = _editOverrides[k]; });
  try{
    var cp = JSON.parse(localStorage.getItem('nexe_custom_products') || '[]');
    if(cp && cp.length) out._customProducts = cp;
  }catch(e){}
  return out;
}
function _anchorDownload(blob, fname){
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = fname; a.style.display = 'none';
  document.body.appendChild(a); a.click();
  setTimeout(function(){ if(a.parentNode) a.parentNode.removeChild(a); URL.revokeObjectURL(url); }, 2000);
}
function _downloadJsonLocal(jsonStr, fname){
  var blob = new Blob([jsonStr], {type:'application/json'});
  if(window.showSaveFilePicker){
    window.showSaveFilePicker({suggestedName: fname, types:[{description:'JSON', accept:{'application/json':['.json']}}]})
      .then(function(h){ return h.createWritable().then(function(w){ return w.write(blob).then(function(){ return w.close(); }); }); })
      .catch(function(err){ if(err && err.name === 'AbortError') return; _anchorDownload(blob, fname); });
    return;
  }
  _anchorDownload(blob, fname);
}
function _downloadJson(jsonStr, fname){
  // Versió publicada (claude.ai): les descàrregues directes no funcionen, cal la capacitat "downloads"
  if(window.claude && typeof window.claude.use === 'function'){
    window.claude.use('downloads').then(function(dl){
      if(dl && dl.save){
        return dl.save({filename: fname, data: jsonStr}).catch(function(err){
          if(err && err.code === 'declined') return;
          alert('No s\'ha pogut desar l\'arxiu (' + ((err && (err.code || err.message)) || 'error') + '). Prova «Copia el codi».');
        });
      }
      return _downloadJsonLocal(jsonStr, fname);
    }).catch(function(){ _downloadJsonLocal(jsonStr, fname); });
    return;
  }
  _downloadJsonLocal(jsonStr, fname);
}
function _showSaveChooser(jsonStr, fname){
  var old = document.getElementById('saveChooserOverlay'); if(old) old.remove();
  var ov = document.createElement('div'); ov.className = 'edit-add-overlay active'; ov.id = 'saveChooserOverlay';
  var m = document.createElement('div'); m.className = 'edit-add-modal';
  var h = document.createElement('h3'); h.textContent = 'Desar els canvis'; m.appendChild(h);
  var box = document.createElement('div'); box.className = 'save-chooser'; m.appendChild(box);
  function addBtn(txt, cls, fn){ var b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = txt; b.onclick = fn; box.appendChild(b); }
  addBtn('\uD83D\uDCBE Desa a l\'arxiu (.json)', 'btn-save', function(){ _downloadJson(jsonStr, fname); ov.remove(); });
  var file = null;
  try{ file = new File([new Blob([jsonStr], {type:'application/json'})], fname, {type:'application/json'}); }catch(e){}
  if(file && navigator.share && navigator.canShare && navigator.canShare({files:[file]})){
    addBtn('\uD83D\uDCE4 Comparteix (AirDrop, Missatges\u2026)', 'btn-cancel', function(){ navigator.share({files:[file], title:'Backup Nexe'}).catch(function(){}); ov.remove(); });
  }
  addBtn('\uD83D\uDCCB Copia el codi', 'btn-cancel', function(){
    var done = function(){ alert('Codi copiat! Enganxa\'l a un arxiu .json per restaurar.'); ov.remove(); };
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(jsonStr).then(done).catch(function(){ prompt('Copia aquest codi manualment:', jsonStr); }); }
    else prompt('Copia aquest codi manualment:', jsonStr);
  });
  addBtn('Tanca', 'btn-cancel', function(){ ov.remove(); });
  ov.addEventListener('click', function(e){ if(e.target === ov) ov.remove(); });
  ov.appendChild(m); document.body.appendChild(ov);
}
function _saveToFile(){
  var data = _buildExportJson();
  if(Object.keys(data).length === 0){ alert('No hi ha canvis per desar.'); return; }
  var jsonStr = JSON.stringify(data, null, 2);
  var fname = 'nexe-overrides-' + new Date().toISOString().slice(0,10) + '.json';
  _showSaveChooser(jsonStr, fname);
}

/* ── Variants (mides amb preu) ── */
function _variantRowEl(label, price){
  var row = document.createElement('div'); row.className = 'vrow';
  var l = document.createElement('input'); l.type = 'text'; l.className = 'vlabel'; l.placeholder = 'Mida / color (ex: 30,48 cm - Negre)'; l.value = label || '';
  var pr = document.createElement('input'); pr.type = 'text'; pr.className = 'vprice'; pr.placeholder = '\u20AC';
  pr.setAttribute('inputmode', 'decimal'); pr.value = (price === undefined || price === null || price === '') ? '' : price;
  var x = document.createElement('button'); x.type = 'button'; x.className = 'vdel'; x.textContent = '\u2715'; x.onclick = function(){ row.remove(); };
  row.appendChild(l); row.appendChild(pr); row.appendChild(x);
  return row;
}
function _addVariantRow(container, label, price){ if(container) container.appendChild(_variantRowEl(label, price)); }
function _readVariantRows(container){
  var out = [];
  if(!container) return out;
  container.querySelectorAll('.vrow').forEach(function(r){
    var lab = r.querySelector('.vlabel').value.trim();
    var pr = parseFloat(String(r.querySelector('.vprice').value).replace(',', '.'));
    if(lab && !isNaN(pr)) out.push({label: lab, price: pr});
  });
  return out;
}
function _clearVariantRows(){ var c = document.getElementById('editAddVariants'); if(c) c.innerHTML = ''; }
function _applyVariantsToProduct(i){
  var o = _editOverrides[i], p = PRODS[i];
  if(!o || !p || o.variants === undefined) return;
  if(!o.variants.length){ delete p.insemacVariants; return; }
  var out = [];
  for(var k=0;k<o.variants.length;k++){
    out.push({id: 920000 + i*100 + k, label: String(o.variants[k].label || ''), price: parseFloat(o.variants[k].price) || 0, star: 0});
  }
  p.insemacVariants = out;
}
function _openVariantsEditor(idx){
  var p = PRODS[idx]; if(!p) return;
  var old = document.getElementById('variantsEditOverlay'); if(old) old.remove();
  var ov = document.createElement('div'); ov.className = 'edit-add-overlay active'; ov.id = 'variantsEditOverlay';
  var m = document.createElement('div'); m.className = 'edit-add-modal';
  m.innerHTML = '<h3>Mides i preus</h3><label class="vhelp">Cada fila \u00E9s una opci\u00F3 del desplegable \u00ABElige tu modelo\u00BB, amb el seu preu.</label><div id="variantsEditRows"></div>';
  var rows = m.querySelector('#variantsEditRows');
  var cur = p.insemacVariants || [];
  for(var i=0;i<cur.length;i++){
    var pr = cur[i].price;
    if(_editOverrides[idx] && _editOverrides[idx].variantPrices && _editOverrides[idx].variantPrices[i] !== undefined) pr = _editOverrides[idx].variantPrices[i];
    _addVariantRow(rows, cur[i].label, pr);
  }
  if(!cur.length) _addVariantRow(rows, '', '');
  var add = document.createElement('button'); add.type = 'button'; add.className = 'btn-cancel'; add.style.cssText = 'width:100%;margin-top:8px;flex:none';
  add.textContent = '+ Afegir mida amb preu'; add.onclick = function(){ _addVariantRow(rows, '', ''); };
  m.appendChild(add);
  var br = document.createElement('div'); br.className = 'btn-row';
  var cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'btn-cancel'; cancel.textContent = 'Cancel\u00B7lar'; cancel.onclick = function(){ ov.remove(); };
  var save = document.createElement('button'); save.type = 'button'; save.className = 'btn-save'; save.textContent = 'Desar';
  save.onclick = function(){
    var list = _readVariantRows(rows);
    _editOverrides[idx] = _editOverrides[idx] || {};
    _editOverrides[idx].variants = list;
    delete _editOverrides[idx].variantPrices;
    if(list.length) _editOverrides[idx].price = list[0].price;
    _applyVariantsToProduct(idx);
    _saveEditOverrides();
    ov.remove();
    var pd = document.getElementById('prodDetail'); if(pd) pd.remove();
    showProduct(idx);
  };
  br.appendChild(cancel); br.appendChild(save); m.appendChild(br);
  ov.addEventListener('click', function(e){ if(e.target === ov) ov.remove(); });
  ov.appendChild(m); document.body.appendChild(ov);
}

function _clearOverrides(){
  _editOverrides = {};
  _saveEditOverrides();
  try{ localStorage.setItem('nexe_edit_mode', '0'); }catch(e){}
  _editMode = false;
  _applyEditModeUI();
}

function _importOverrides(){
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e){
    var file = e.target.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(ev){
      try {
        var data = JSON.parse(ev.target.result);
        if(typeof data !== 'object' || data === null){ alert('Format incorrecte.'); return; }
        var _cpImp = data._customProducts; delete data._customProducts;
        if(_cpImp && _cpImp.length){ try{ localStorage.setItem('nexe_custom_products', JSON.stringify(_cpImp)); }catch(e){} }
        _editOverrides = data;
        _saveEditOverrides();
        _editMode = true;
        try{ localStorage.setItem('nexe_edit_mode', '1'); }catch(e){}
        _applyEditModeUI();
        if(currentPage && currentPage.startsWith('category/')){
          showCategory(currentPage.split('/')[1], _currentSubcat, _currentFilter, _pages);
        } else {
          showHome(_pages);
        }
        alert('Overrides importats! ' + Object.keys(data).length + ' canvis restaurats.' + ((_cpImp && _cpImp.length) ? ' (+ ' + _cpImp.length + ' productes nous: es recarrega el catàleg)' : ''));
        if(_cpImp && _cpImp.length){ location.reload(); }
      } catch(e){
        alert('Error en llegir l\'arxiu: ' + e.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function _showEditOverlay(){
  document.querySelectorAll('.prod-card').forEach(function(card){
    var idx = card.getAttribute('data-idx');
    var groupId = card.getAttribute('data-group');
    var _gc = card.parentNode && card.parentNode.getAttribute && card.parentNode.getAttribute('data-ctx');
    if(_gc && !card.querySelector('.edit-move')) _addMoveBar(card);
    // Delete / restore toggle (for regular products or variant group cards)
    if((idx !== null || groupId) && !card.querySelector('.edit-delete')){
      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'edit-delete';
      var wasDeleted = !!( _editOverrides[idx] && _editOverrides[idx].deleted );
      del.innerHTML = wasDeleted ? '\u21a9' : '\u2715';
      del.style.background = wasDeleted ? 'rgba(52,199,89,.9)' : 'rgba(255,59,48,.9)';
      if(wasDeleted) card.style.opacity = '0.35';
      // Capture member indices for variant groups
      var _memberIdxs = [];
      if(groupId){
        _memberIdxs = (typeof members !== 'undefined' && members) ? members.map(function(m){return m.idx;}) : [];
      }
      del.onclick = function(e){
        e.preventDefault();
        e.stopPropagation();
        var id = card.getAttribute('data-idx');
        var gid = card.getAttribute('data-group');
        var nowDeleted;
        if(gid){
          nowDeleted = !(_editOverrides['_vg:'+gid] && _editOverrides['_vg:'+gid].deleted);
          _editOverrides['_vg:'+gid] = _editOverrides['_vg:'+gid] || {};
          _editOverrides['_vg:'+gid].deleted = nowDeleted;
          for(var mi=0;mi<_memberIdxs.length;mi++){
            _editOverrides[_memberIdxs[mi]] = _editOverrides[_memberIdxs[mi]] || {};
            _editOverrides[_memberIdxs[mi]].deleted = nowDeleted;
          }
        } else if(id !== null){
          nowDeleted = !(_editOverrides[id] && _editOverrides[id].deleted);
          _editOverrides[id] = _editOverrides[id] || {};
          _editOverrides[id].deleted = nowDeleted;
        } else return;
        _saveEditOverrides();
        card.style.opacity = nowDeleted ? '0.35' : '';
        del.innerHTML = nowDeleted ? '\u21a9' : '\u2715';
        del.style.background = nowDeleted ? 'rgba(52,199,89,.9)' : 'rgba(255,59,48,.9)';
      };

      card.appendChild(del);
    }
    // Make card price editable
    var priceEl = card.querySelector('.price');
    if(priceEl && !priceEl.getAttribute('data-orig')){
      priceEl.setAttribute('data-orig', priceEl.textContent);
      priceEl.setAttribute('contenteditable', 'true');
      priceEl.setAttribute('inputmode', 'decimal');
      priceEl.onblur = function(){
        var id = card.getAttribute('data-idx');
        var val = parseFloat(String(this.textContent).replace(/[^\d.,]/g, '').replace(',', '.'));
        if(id !== null && !isNaN(val)){
          _editOverrides[id] = _editOverrides[id] || {};
          _editOverrides[id].price = val;
          _saveEditOverrides();
          this.textContent = formatPrice(val);
        } else {
          this.textContent = this.getAttribute('data-orig') || '';
        }
      };
      priceEl.onkeydown = function(e){ if(e.key === 'Enter'){ e.preventDefault(); this.blur(); } };
    }
  });
}

var _gridCtx = null;
var _DEFAULT_ORDERS = {"tall||": ["15", "22", "28", "29", "g:fresa-electrodepositada-marmol", "g:a@103", "g:a@109", "g:kgs-brocas-granito-continuas", "g:kgs-brocas-marmol-m14", "g:kgs-brocas-brazed", "g:kgs-discos-granito-turbo-laser", "g:kgs-discos-granito-turbo-reforzado", "g:kgs-discos-granito-big-bang", "g:kgs-discos-porcelanico-red-shine", "g:kgs-discos-porcelanico-turbo-v", "g:kgs-discos-marmol-reforzado", "g:kgs-discos-granito-rg-n2b", "g:kgs-discos-granito-rg-n2b-insonoro", "g:kgs-discos-dekton-rally-gold-3", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "16", "17", "23", "24", "25", "26", "27", "30", "31", "92", "93", "94", "95", "96", "97", "98", "99", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "121", "124", "125", "175", "176", "177", "178", "420", "757", "758", "759", "788", "789", "791", "794", "796", "797", "798", "799", "800", "874", "878", "891", "905", "906", "909", "914", "915", "923", "927", "928", "929", "930"], "polit||": ["g:lijas-diamantadas-3pasos", "g:lijas-diamantadas-star3", "347", "49", "48", "46", "45", "44", "953", "g:a@41", "g:aro-diamantado-helicoidal", "g:a@77", "g:a@79", "g:a@81", "g:a@83", "958", "g:a@551", "g:a@554", "g:cepillo-diamantado-envejecido", "g:ventosa-v200x200", "g:a@656", "g:plato-velcro-anclaje-rapido", "g:a@659", "g:kgs-laminilla-hybrid-t", "g:kgs-laminilla-hybrid", "g:kgs-esponja-diamante-color", "0", "32", "33", "34", "35", "36", "37", "38", "39", "40", "43", "47", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "62", "63", "64", "65", "66", "67", "68", "69", "70", "73", "74", "75", "76", "82", "89", "90", "91", "122", "123", "126", "127", "128", "129", "130", "131", "132", "133", "134", "135", "136", "137", "138", "139", "140", "141", "142", "143", "144", "145", "146", "166", "167", "168", "169", "170", "189", "190", "329", "330", "331", "332", "333", "334", "335", "336", "337", "338", "339", "340", "341", "342", "343", "344", "345", "346", "558", "559", "560", "640", "641", "642", "661", "662", "663", "664", "665", "666", "766", "771", "772", "773", "779"], "quimics||": ["321", "351", "360", "414", "g:a@768", "322", "323", "348", "349", "350", "352", "353", "354", "355", "356", "357", "358", "359", "361", "362", "363", "364", "365", "366", "367", "368", "369", "370", "371", "372", "373", "374", "375", "376", "377", "378", "379", "380", "381", "382", "383", "384", "385", "386", "387", "388", "389", "390", "391", "392", "393", "394", "395", "396", "397", "398", "399", "400", "401", "402", "403", "404", "405", "406", "407", "408", "409", "410", "411", "412", "413", "415", "416", "417", "418", "419", "569", "570", "571", "767", "770", "933", "935", "936"], "man-inst||": ["729", "940", "939", "g:a@613", "g:a@615", "g:ventosa-doble-efecto", "g:a@617", "g:a@618", "g:a@620", "g:a@623", "g:a@625", "g:a@627", "g:a@629", "g:a@631", "g:a@633", "g:a@635", "g:a@637", "g:flejadora-manual", "g:a@754", "461", "462", "463", "464", "465", "466", "467", "468", "469", "470", "471", "472", "473", "474", "475", "476", "477", "478", "479", "480", "481", "482", "483", "484", "485", "486", "487", "488", "489", "508", "509", "510", "511", "512", "513", "514", "515", "516", "517", "518", "519", "520", "521", "522", "523", "524", "525", "526", "527", "528", "529", "530", "531", "532", "533", "534", "535", "536", "537", "538", "539", "540", "541", "542", "543", "544", "545", "546", "564", "565", "566", "567", "568", "606", "607", "608", "609", "610", "611", "612", "643", "646", "647", "648", "649", "650", "651", "652", "653", "654", "670", "671", "672", "673", "674", "675", "676", "677", "678", "679", "680", "681", "682", "683", "684", "685", "686", "687", "688", "689", "690", "691", "692", "693", "694", "700", "701", "702", "703", "704", "705", "706", "707", "708", "709", "710", "711", "712", "713", "714", "715", "716", "717", "718", "719", "720", "721", "722", "723", "724", "725", "726", "727", "728", "730", "731", "732", "733", "734", "735", "736", "737", "738", "739", "740", "741", "742", "743", "744", "745", "746", "747", "748", "749", "750", "751", "752", "753", "756", "774", "942", "943", "944", "945", "946", "947", "948", "949", "950", "951", "952"], "maquinaria||": ["155", "154", "153", "147", "148", "149", "150", "151", "152", "156", "157", "158", "159", "160", "161", "162", "163", "164", "165", "171", "172", "173", "174", "191", "192", "193", "194", "195", "196", "197", "198", "199", "200", "201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "211", "212", "213", "214", "215", "216", "217", "218", "219", "220", "221", "222", "223", "224", "225", "226", "227", "228", "229", "230", "231", "232", "233", "234", "235", "236", "237", "238", "239", "240", "561", "562", "563"], "seguretat-taller||": ["655", "425", "422", "776", "775", "g:a@760", "g:a@762", "g:a@764", "184", "421", "423", "424", "426", "427", "428", "429", "430", "431", "432", "433", "434", "435", "436", "437", "438", "439", "440", "441", "442", "443", "444", "445", "446", "447", "448", "449", "450", "451", "452", "453", "454", "455", "456", "457", "458", "459", "460", "490", "491", "492", "493", "494", "495", "496", "497", "498", "499", "500", "501", "502", "503", "504", "505", "506", "507", "547", "548", "549", "550", "578", "579", "580", "581", "582", "583", "584", "585", "586", "587", "588", "589", "590", "591", "592", "593", "594", "595", "596", "597", "600", "601", "602", "603", "604", "605", "667", "668", "669", "g:a@572", "g:prolongador-cono-1-2-gas", "g:a@598", "179", "180", "181", "182", "183", "185", "186", "187", "188"], "adhesius||": ["959", "241", "243", "247", "250", "251", "310", "311", "312", "313", "314", "315", "316", "317", "318", "319", "320", "324", "325", "326", "327", "328", "695", "696", "697", "698", "699", "931", "932", "934", "937", "938"]};
function _cardKey(c){
  var g = c.getAttribute('data-group');
  if(!g) return c.getAttribute('data-idx') || '';
  if(g.indexOf('auto-') === 0){
    var d = getVariantGroupDef(g);
    if(d && d.members && d.members.length){
      var mn = 1e9;
      for(var i=0;i<d.members.length;i++){ if(d.members[i].idx < mn) mn = d.members[i].idx; }
      return 'g:a@' + mn;
    }
  }
  return 'g:' + g;
}
function _applySavedOrder(grid, ctx){
  var saved = _editOverrides['_ord:' + ctx] || _DEFAULT_ORDERS[ctx];
  if(!saved || !saved.length) return;
  var cards = [].slice.call(grid.children), map = {}, used = {};
  cards.forEach(function(c){ map[_cardKey(c)] = c; });
  var frag = document.createDocumentFragment();
  saved.forEach(function(k){ if(map[k] && !used[k]){ frag.appendChild(map[k]); used[k] = 1; } });
  cards.forEach(function(c){ var k = _cardKey(c); if(!used[k]) frag.appendChild(c); });
  grid.appendChild(frag);
}
function _persistOrder(grid){
  var ctx = grid.getAttribute('data-ctx'); if(!ctx) return;
  var keys = [];
  [].forEach.call(grid.children, function(c){ var k = _cardKey(c); if(k) keys.push(k); });
  _editOverrides['_ord:' + ctx] = keys;
  _saveEditOverrides();
}
function _addMoveBar(card){
  var wrap = card.querySelector('.img-wrap') || card;
  var bar = document.createElement('div'); bar.className = 'edit-move';
  function mk(txt, title, fn){
    var b = document.createElement('button'); b.type = 'button'; b.textContent = txt; b.title = title;
    b.onclick = function(e){ e.preventDefault(); e.stopPropagation(); fn(); };
    bar.appendChild(b);
  }
  function done(){ _persistOrder(card.parentNode); try{ card.scrollIntoView({block:'nearest'}); }catch(e){} }
  mk('\u2912', 'Al principi', function(){ var g = card.parentNode; g.insertBefore(card, g.firstChild); done(); });
  mk('\u25B2', 'Amunt', function(){ var g = card.parentNode, p = card.previousElementSibling; if(p) g.insertBefore(card, p); done(); });
  mk('\u25BC', 'Avall', function(){ var g = card.parentNode, n = card.nextElementSibling; if(n) g.insertBefore(n, card); done(); });
  mk('\u2913', 'Al final', function(){ var g = card.parentNode; g.appendChild(card); done(); });
  wrap.appendChild(bar);
}

function _hideEditOverlay(){
  document.querySelectorAll('.edit-delete, .edit-move').forEach(function(el){ el.remove(); });
  document.querySelectorAll('.prod-card .price').forEach(function(el){
    el.removeAttribute('contenteditable');
    el.removeAttribute('data-orig');
    el.onblur = null;
    el.onkeydown = null;
  });
}

// Override PRODS prices/deletions on load
_loadEditOverrides();

// Versió amb els canvis "enllaçats": els grups automàtics es renumeren, així que es neteja un cop el que hi havia guardat
(function _bakeCleanup(){
  try{
    var BV = 'bake-2026-10-31';
    if(localStorage.getItem('nexe_bake_version') === BV) return;
    var ch = false, BAKED = ['15','71','134','345','695','696','697','698','941'];
    Object.keys(_editOverrides).forEach(function(k){
      if(k.indexOf('_vg:auto-') === 0 || k.indexOf('_ord:') === 0 || BAKED.indexOf(k) > -1){ delete _editOverrides[k]; ch = true; }
    });
    if(ch) _saveEditOverrides();
    localStorage.setItem('nexe_bake_version', BV);
  }catch(_e){}
})();
if(Object.keys(_editOverrides).length > 0){
  Object.keys(_editOverrides).forEach(function(idx){
    var i = parseInt(idx);
    if(PRODS[i]){
      if(_editOverrides[i].deleted) PRODS[i]._deleted = true;
      if(_editOverrides[i].price !== undefined) PRODS[i]._origPrice = PRODS[i].p;
      if(_editOverrides[i].variants !== undefined){ try{ _applyVariantsToProduct(i); }catch(_e){} }
    }
  });
}


// Re-enllaça els membres dels grups de variants per REFERÈNCIA: els idx guardats són d'un ordre antic del catàleg
// i apuntaven a altres productes (o a productes nous, que quedaven segrestats pels grups KGS).
(function _relinkVariantGroups(){
  try{
  if(typeof insemac_variant_groups === 'undefined') return;
  var byRef = {};
  for(var pi=0; pi<PRODS.length; pi++){ var rr = PRODS[pi] && PRODS[pi].r; if(rr && byRef[rr] === undefined) byRef[rr] = pi; }
  for(var gi=0; gi<insemac_variant_groups.length; gi++){
    var vg = insemac_variant_groups[gi];
    if(!vg || !vg.members) continue;
    var fixed = [];
    for(var mi=0; mi<vg.members.length; mi++){
      var mem = vg.members[mi];
      if(mem && mem.ref !== undefined){
        if(byRef[mem.ref] !== undefined){ mem.idx = byRef[mem.ref]; fixed.push(mem); }
      } else fixed.push(mem);
    }
    vg.members = fixed;
  }
  }catch(_e){ if(window.console) console.warn('relink grups:', _e); }
})();

function init(){
  try{
    // DOM refs
    var main = document.getElementById('main');
    var pages = {
      main: document.getElementById('main'),
      home: document.getElementById('page-home'),
      category: document.getElementById('page-category'),
      advisor: document.getElementById('page-advisor'),
      clients: document.getElementById('page-clients'),
      lists: document.getElementById('page-lists'),
      listDetail: document.getElementById('page-list-detail'),
      settings: document.getElementById('page-settings'),
      categoryGrid: document.getElementById('categoryGrid'),
      listDetailGrid: document.getElementById('listDetailGrid'),
      filterBar: document.getElementById('filterBar')
    };
    var headerTitle = document.querySelector('.header-title');
    var btnBack = document.getElementById('btnBack');
    var navItems = document.querySelectorAll('.nav-item');
    var searchOverlay = document.getElementById('searchOverlay');
    var searchInput = document.getElementById('searchInput');
    var searchResults = document.getElementById('searchResults');
    var searchCancel = document.getElementById('searchCancel');
    var togglePres = document.getElementById('togglePresentation');
    var togglePresTop = document.getElementById('togglePresentationTop');

    // Load state
    try{ customLists = JSON.parse(localStorage.getItem(LISTS_KEY)) || []; }catch(e){}
    if(customLists.length === 0 || customLists[0].id !== '_favs'){
      customLists.unshift({id:'_favs',name:'Favorits',icon:'❤️',items:[],builtin:true});
      try{ var oldFavs = JSON.parse(localStorage.getItem('nexe_comercial_favs')) || []; }catch(ex){ oldFavs=[]; }
      if(oldFavs.length){ customLists[0].items = oldFavs; }
    }
    // Ensure _recomanats list exists
    var hasRecomanats = false;
    for(var ri=0;ri<customLists.length;ri++){ if(customLists[ri].id === '_recomanats'){ hasRecomanats = true; break; } }
    if(!hasRecomanats){
      // Pre-populate with initial Recomanats products (by reference)
      var initialRefs = ['90/FILM-EXTRA','075-030','90/PAP-180','90/PAP-MINI','4/BLA-C22'];
      var recomanatsItems = [];
      for(var pi=0;pi<PRODS.length;pi++){
        if(initialRefs.indexOf(PRODS[pi].r) > -1) recomanatsItems.push(pi);
      }
      customLists.push({id:'_recomanats',name:'Recomanats',icon:'⭐',items:recomanatsItems,builtin:true});
    }
    try{ presentation = localStorage.getItem(PRES_KEY) === '1'; }catch(e){}
    if(presentation) document.body.classList.add('presentation');

    // Initialize SQLite and reload PRODS from database
    initSQLiteBridge(pages).then(function(){
      initAfterSQLite(pages, headerTitle, btnBack, navItems, searchOverlay, searchInput, searchResults, searchCancel, togglePres, togglePresTop);
    }).catch(function(err){
      console.warn('[SQLite] Bridge error, using legacy data:', err.message);
      initAfterSQLite(pages, headerTitle, btnBack, navItems, searchOverlay, searchInput, searchResults, searchCancel, togglePres, togglePresTop);
    });
  }catch(e){
    showError('Error init: '+e.message+'\n'+e.stack);
  }
}

function initSQLiteBridge(pages){
  return new Promise(function(resolve, reject){
    if(window._sqliteReady === 'skip'){
      console.log('[SQLite] Skipped (file:// mode), using legacy data');
      resolve();
      return;
    }
    if(window._sqliteReady && window._catalogService){
      try{
        var bridge = window._catalogBridge;
        if(bridge && bridge.isReady()){
          var bridgeProds = bridge.getProducts();
          if(bridgeProds.length > 0){
            PRODS = bridgeProds;
            console.log('[SQLite] PRODS reloaded from bridge:', PRODS.length, 'products');
          }
        }
        resolve();
      }catch(e){
        reject(e);
      }
      return;
    }
    var waited = 0;
    var interval = setInterval(function(){
      waited += 100;
      if(window._sqliteReady){
        clearInterval(interval);
        try{
          var bridge = window._catalogBridge;
          if(bridge && bridge.isReady()){
            var bridgeProds = bridge.getProducts();
            if(bridgeProds.length > 0){
              PRODS = bridgeProds;
              console.log('[SQLite] PRODS reloaded from bridge:', PRODS.length, 'products');
            }
          }
          resolve();
        }catch(e){
          reject(e);
        }
      } else if(waited >= 5000){
        clearInterval(interval);
        console.warn('[SQLite] Timeout waiting for SQLite, using legacy data');
        resolve();
      }
    }, 100);
  });
}

function initAfterSQLite(pages, headerTitle, btnBack, navItems, searchOverlay, searchInput, searchResults, searchCancel, togglePres, togglePresTop){
  try{
    // Search index
    searchIdx = [];
    if(PRODS.length > 0){
      // Map source cat values → display names (uses NAV_CATEGORIES[i].cats array)
      var catNames = {};
      for(var ci=0;ci<NAV_CATEGORIES.length;ci++){
        var navCat = NAV_CATEGORIES[ci];
        for(var cj=0;cj<(navCat.cats||[]).length;cj++){
          catNames[navCat.cats[cj]] = navCat.nom;
        }
        // Subcat mappings — handle filter-based subcats
        for(var si=0;si<(navCat.subcats||[]).length;si++){
          var sub = navCat.subcats[si];
          var subcatKeys = [];
          if(sub.filter && sub.filter.subcat){
            var fsub = Array.isArray(sub.filter.subcat) ? sub.filter.subcat : [sub.filter.subcat];
            for(var fj=0;fj<fsub.length;fj++) subcatKeys.push(fsub[fj]);
          } else {
            subcatKeys.push(sub.id);
          }
          for(var kj=0;kj<subcatKeys.length;kj++){
            catNames[subcatKeys[kj]] = sub.nom;
          }
        }
      }
      // destacats is no longer a NAV_CATEGORY but products with cat='destacats' exist
      catNames['destacats'] = 'Recomendats';
      // Build variant group name + option labels lookup
      var vgLookup = {}, vgOptLookup = {};
      if(typeof insemac_variant_groups !== 'undefined'){
        for(var vi=0;vi<insemac_variant_groups.length;vi++){
          var vg = insemac_variant_groups[vi];
          vgLookup[vg.id] = vg.name;
          if(vg.options){
            for(var oi=0;oi<vg.options.length;oi++){
              var opt = vg.options[oi];
              if(opt.values){
                for(var vi2=0;vi2<opt.values.length;vi2++){
                  vgOptLookup[opt.values[vi2].id] = opt.values[vi2].label;
                }
              }
            }
          }
        }
      }
      for(var i=0;i<PRODS.length;i++){
        var p = PRODS[i];
        var catName = p.cat ? (catNames[p.cat]||'') : '';
        var subcatName = p.subcat ? (catNames[p.subcat]||'') : '';
        var vgName = p.variantGroup ? (vgLookup[p.variantGroup]||'') : '';
        if(!vgName){
          var insemacGid = getProductVariantGroupId(i);
          if(insemacGid){
            var insemacDef = getVariantGroupDef(insemacGid);
            if(insemacDef) vgName = insemacDef.name;
          }
        }
        var voNames = [];
        if(p.variantOptions){
          for(var ok in p.variantOptions){
            var val = p.variantOptions[ok];
            if(vgOptLookup[val]) voNames.push(vgOptLookup[val]);
          }
        }
        if(p.insemacVariants){
          for(var iv=0;iv<p.insemacVariants.length;iv++){
            voNames.push(p.insemacVariants[iv].label);
          }
        }
        searchIdx.push({idx:i,txt:((p.n||'')+' '+(p.b||'')+' '+(p.r||'')+' '+(p.d||'')+' '+catName+' '+subcatName+' '+vgName+' '+voNames.join(' ')).toLowerCase()});
      }
    }

    // Auto-detect variant groups
    autoDetectVariantGroups();

    // Hydrate INSEMAC variant group members with product references
    if(typeof insemac_variant_groups !== 'undefined'){
      for(var vi=0;vi<insemac_variant_groups.length;vi++){
        var vg = insemac_variant_groups[vi];
        if(vg.members && vg.autoDetected && vg.members.length > 0 && !vg.members[0].p){
          for(var mi=0;mi<vg.members.length;mi++){
            var midx = vg.members[mi].idx;
            if(midx !== undefined && midx >= 0 && midx < PRODS.length){
              vg.members[mi].p = PRODS[midx];
            }
          }
        }
      }
    }

    // Render home
    renderHome(pages);
    _pages = pages;

    // Settings
    renderSettings(pages);
    renderAdvisor(pages);

    // Nav
    for(var i=0;i<navItems.length;i++){
      navItems[i].addEventListener('click', function(){
        var page = this.getAttribute('data-page');
        if(page === 'search'){ openSearch(); return; }
        if(page === 'edit'){ toggleEditMode(); return; }
        navigate(page, null, pages);
      });
    }

    // Search
    if(searchInput){
      searchInput.addEventListener('input', function(){ _lastSearch = this.value; onSearchInput(this.value, searchResults); });
    }
    if(searchCancel){
      searchCancel.addEventListener('click', closeSearch);
    }
    if(searchOverlay){
      searchOverlay.addEventListener('click', function(e){
        if(e.target === searchOverlay) closeSearch();
      });
    }
    if(searchResults){
      searchResults.addEventListener('click', function(e){
        var item = e.target.closest('.search-result-item');
        if(item){
          _returnCtx = {type:'search', query:_lastSearch, underPage:currentPage};
          closeSearch();
          navigate('product/'+parseInt(item.getAttribute('data-idx')), null, pages);
        }
      });
    }
    if(searchInput){
      searchInput.addEventListener('keydown', function(e){
        if(e.key === 'Escape') closeSearch();
      });
    }

    // Presentation toggle (dark mode)
    if(togglePres){
      togglePres.classList.toggle('on', presentation);
      togglePres.addEventListener('click', togglePresentation);
    }
    if(togglePresTop){
      togglePresTop.textContent = presentation ? '☀️' : '🌙';
      togglePresTop.style.color = presentation ? '#ff6b35' : '';
      togglePresTop.setAttribute('aria-label', presentation ? 'Tema clar' : 'Tema fosc');
      togglePresTop.setAttribute('title', presentation ? 'Tema clar' : 'Tema fosc');
      togglePresTop.addEventListener('click', togglePresentation);
    }

    // Back
    if(btnBack) btnBack.addEventListener('click', goBack);

    // Show home by default
    showPage('home', null, pages, headerTitle, btnBack, navItems);
  }catch(e){
    showError('Error init: '+e.message+'\n'+e.stack);
  }
}

function renderHome(pages){
  pages.home.innerHTML = '<div class="home-hero"><div class="home-kicker">Catàleg professional</div></div><button class="home-search" id="homeSearch"><span class="search-icon">⌕</span><span>Cerca productes, marques o referències</span><span class="hint">Cerca</span></button><div class="quick-row" id="quickSearch"></div>';
  var quickTerms = ['Disc','Adhesiu','Ventosa','Compresor','Lija'];
  var quickRow = pages.home.querySelector('#quickSearch');
  for(var qi=0;qi<quickTerms.length;qi++){
    var quick = document.createElement('button');
    quick.textContent = quickTerms[qi];
    quick.addEventListener('click', function(term){ return function(){ openSearch(term); }; }(quickTerms[qi]));
    quickRow.appendChild(quick);
  }

  // Category grid
  var gridTitle = document.createElement('div');
  gridTitle.className = 'section-head';
  gridTitle.innerHTML = '<div><div class="section-kicker">Explora</div><div class="section-title">Categories</div></div>';
  pages.home.appendChild(gridTitle);
  var grid = document.createElement('div');
  grid.className = 'home-grid';
  var count = {};
  for(var pi=0;pi<PRODS.length;pi++){
    var p = PRODS[pi];
    for(var ci=0;ci<NAV_CATEGORIES.length;ci++){
      var cat = NAV_CATEGORIES[ci];
      if(isProductInNavCategory(p, cat)) count[cat.id] = (count[cat.id]||0)+1;
    }
  }
  for(var ci=0;ci<NAV_CATEGORIES.length;ci++){
    var cat = NAV_CATEGORIES[ci];
    var tile = document.createElement('button');
    tile.className = 'family-tile cat-'+cat.id;
    if(cat.img){
      tile.style.backgroundImage = 'url('+encodeURI(cat.img)+')';
      tile.style.backgroundSize = 'cover';
      tile.style.backgroundPosition = 'center';
      tile.setAttribute('data-has-img', '1');
    }
    tile.innerHTML = '<div class="bg-grad"></div><div class="glow"></div><span class="name">'+cat.nom+'</span><span class="count">'+(count[cat.id]||0)+' productes</span>';
    tile.addEventListener('click', function(id){ return function(){ navigate('category/'+id, null, pages); }; }(cat.id));
    grid.appendChild(tile);
  }
  pages.home.appendChild(grid);

  // Recomendados NEXE — read from _recomanats list
  var recomanatsContainer = document.createElement('div');
  recomanatsContainer.id = 'recomanatsSection';
  renderRecomanats(recomanatsContainer, pages);
  pages.home.appendChild(recomanatsContainer);

  var homeSearch = pages.home.querySelector('#homeSearch');
  if(homeSearch) homeSearch.addEventListener('click', function(){ openSearch(); });
}

function renderRecomanats(container, pages){
  container.innerHTML = '';
  var recomanatsList = null;
  for(var ri=0;ri<customLists.length;ri++){ if(customLists[ri].id === '_recomanats'){ recomanatsList = customLists[ri]; break; } }
  var featured = [];
  if(recomanatsList && recomanatsList.items.length){
    for(var fi=0;fi<recomanatsList.items.length && featured.length<12;fi++){
      var pidx = recomanatsList.items[fi];
      if(PRODS[pidx]) featured.push({p:PRODS[pidx],idx:pidx});
    }
  }
  if(featured.length){
    var featHead = document.createElement('div');
    featHead.className = 'section-head';
    featHead.innerHTML = '<div><div class="section-kicker">Recomanació NEXE</div><div class="section-title">Recomendats</div></div>';
    container.appendChild(featHead);
    var strip = document.createElement('div'); strip.className = 'spotlight-scroll';
    for(var sp=0;sp<featured.length;sp++){
      (function(item){ var card = document.createElement('div'); card.className = 'spotlight-card'; card.innerHTML = '<img src="'+escHtml(getImgSrc(item.p))+'" alt="" loading="lazy"><div class="info"><div class="brand">'+escHtml(item.p.b||'')+'</div><div class="name">'+escHtml(item.p.n||'')+'</div></div>'; card.addEventListener('click', function(){ navigate('product/'+item.idx, null, pages); }); strip.appendChild(card); })(featured[sp]);
    }
    container.appendChild(strip);
  } else {
    var ph = document.createElement('div'); ph.className = 'section-head';
    ph.innerHTML = '<div><div class="section-kicker">Pròximament</div><div class="section-title">Recomendats</div></div><div style="font-size:13px;color:rgba(29,29,31,.45);padding:4px 0 12px">Els productes recomanats es configuraran manualment.</div>';
    container.appendChild(ph);
  }
}

function refreshRecomanats(){
  var container = document.getElementById('recomanatsSection');
  if(container && _pages) renderRecomanats(container, _pages);
}

function isProductInNavCategory(p, cat){
  if(!p.cat) return false;
  // man-inst includes manipulacio + instalacio + equip/carros
  if(cat.id === 'man-inst'){
    if(p.cat === 'manipulacio' || p.cat === 'instalacio') return true;
    if(p.cat === 'equip' && p.subcat === 'bancs-carros-caballet') return true;
    return false;
  }
  // seguretat-taller: equip except carros (moved to man-inst)
  if(cat.id === 'seguretat-taller'){
    if(p.cat === 'equip' && p.subcat !== 'bancs-carros-caballet') return true;
    return false;
  }
  return cat.cats && cat.cats.indexOf(p.cat) > -1;
}

function renderSettings(pages){
  var listCount = customLists ? customLists.length : 0;
  var pc = document.getElementById('prodCount');
  var lc = document.getElementById('listCount');
  var vc = document.getElementById('verCount');
  if(pc) pc.textContent = PRODS.length+' productes';
  if(lc) lc.textContent = listCount+' llistes';
  if(vc) vc.textContent = NAV_CATEGORIES.length+' categories · v2.0';
  
  // Import/Export handlers
  var importBtn = document.getElementById('importClientsBtn');
  var exportBtn = document.getElementById('exportClientsBtn');
  var importFile = document.getElementById('importClientsFile');
  
  if(importBtn && importFile){
    importBtn.addEventListener('click', function(){ importFile.click(); });
    importFile.addEventListener('change', function(e){
      var file = e.target.files[0];
      if(!file) return;
      var reader = new FileReader();
      reader.onload = function(ev){
        try{
          var data = JSON.parse(ev.target.result);
          if(Array.isArray(data)){
            clients = data;
            _persistClients();
            alert('Importats ' + data.length + ' clients correctament.');
            renderClientList(document.getElementById('page-clients'), '');
          }else{
            alert('Format de fitxer incorrecte. Cal un array JSON.');
          }
        }catch(err){
          alert('Error al llegir el fitxer: ' + err.message);
        }
      };
      reader.readAsText(file);
    });
  }
  
  if(exportBtn){
    exportBtn.addEventListener('click', function(){
      var data = JSON.stringify(clients, null, 2);
      var blob = new Blob([data], {type: 'application/json'});
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'clients_nexe_' + new Date().toISOString().slice(0,10) + '.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}

function renderAdvisor(pages){
  advisorStep = 0; advisorAnswers = {};
  renderAdvisorStep(pages);
}

function renderAdvisorStep(pages){
  var step = ADVISOR_STEPS[advisorStep];
  if(!step) { renderAdvisorResult(pages); return; }
  var progress = Math.round((advisorStep / ADVISOR_STEPS.length) * 100);
  var html = '<div class="advisor-hero advisor-wizard"><div class="home-kicker">Assessor NEXE · '+(advisorStep+1)+' de '+ADVISOR_STEPS.length+'</div><div class="advisor-progress"><span style="width:'+progress+'%"></span></div><h1>'+step.title+'</h1><p>'+step.sub+'</p></div><div class="advisor-options" id="advisorOptions"></div>';
  if(advisorStep > 0) html += '<button class="filter-chip" id="advisorPrevious">‹ Enrere</button>';
  pages.advisor.innerHTML = html;
  var container = pages.advisor.querySelector('#advisorOptions');
  for(var i=0;i<step.options.length;i++){
    (function(option){
      var button = document.createElement('button'); button.className = 'advisor-case';
      button.innerHTML = '<span class="case-copy"><span class="case-title">'+option[1]+'</span><span class="case-sub">'+option[2]+'</span></span><span class="arrow">›</span>';
      button.addEventListener('click', function(){ advisorAnswers[step.key] = option[0]; advisorStep++; renderAdvisorStep(pages); });
      container.appendChild(button);
    })(step.options[i]);
  }
  var previous = pages.advisor.querySelector('#advisorPrevious');
  if(previous) previous.addEventListener('click', function(){ advisorStep--; renderAdvisorStep(pages); });
}

function getExpertRoles(a){
  var materialTerms = {Granito:['granito'],Mármol:['mármol','marmol'],Porcelánico:['porcelánico','porcelanico'],Cuarzo:['cuarzo'],Sinterizado:['sinterizado','dekton','porcelánico']}[a.material] || [];
  var discTerms = a.machine === 'bridge' ? ['corte húmedo'] : ['disco'];
  if(a.work === 'cut') return [
    {title:'Consumible de tall',terms:discTerms,termFilter:['disco'],note:'Seleccionat segons el material, el gruix i la màquina.'},
    {title:'Guia o control de tall',terms:['soporte amoladora','sistema de guiado'],termFilter:['soporte','guía','amoladora'],note:'Ajuda a mantenir un tall estable i repetible.'}
  ];
  if(a.work === 'glue') return [
    {title:'Adhesiu estructural',terms:['adhesivo','pegamento'],avoid:['pistola','boquilla'],termFilter:['adhesivo','pegamento','silicona'],note:'Escollit per unió i compatibilitat amb el material.'},
    {title:'Eina d\'aplicació',terms:['pistola adhesivo','pistola'],termFilter:['pistola'],note:'Permet una dosificació neta i controlada.'},
    {title:'Segellat final',terms:['sellador','siliconas y polimeros'],termFilter:['sellador','silicona'],note:'Protecció de la junta segons l\'entorn.'}
  ];
  if(a.work === 'polish') return [
    {title:'Eina de polit',terms:['pulidora neumática','pulidora'],termFilter:['pulidora','lijadora'],note:'Compatible amb el procés de polit seleccionat.'},
    {title:'Abrasiu de polit',terms:['coronas abrasivas','coronas diamantadas','resipox'],termFilter:['corona','lija','abrasivo'],note:'Progressió per arribar al nivell d\'acabat indicat.'},
    {title:'Acabat i protecció',terms:['abrillantadores y ceras','resina autopulimentable'],termFilter:['cera','abrillantador','resina'],note:'Finalitza el procés segons l\'acabat desitjat.'}
  ];
  if(a.work === 'repair') return [
    {title:'Producte de reparació',terms:['resina','pegamento','adhesivo'],avoid:['pistola','boquilla'],termFilter:['resina','masilla','adhesivo'],note:'Per consolidar o reomplir la zona afectada.'},
    {title:'Acabat de reparació',terms:['lij','disco','abrasivas'],termFilter:['lija','disco','abrasivo'],note:'Per integrar visualment la reparació.'}
  ];
  return [
    {title:'Manipulació de la peça',terms:['ventosa grabo','ventosa manual','ventosa'],termFilter:['ventosa','grabo'],note:'Adaptada al gruix i al muntatge en obra.'},
    {title:'Fixació o unió',terms:['adhesivo','sellador'],avoid:['pistola','boquilla'],termFilter:['adhesivo','sellador'],note:'Recomanat segons material i condicions de servei.'},
    {title:'Accessoris de muntatge',terms:['nivelador','ingletes y juntas','kit'],termFilter:['nivelador','inglete','junta','kit'],note:'Per a un posicionament precís.'}
  ];
}

function findAdvisorProduct(role, answers){
  var best = null, bestScore = -1;
  if(!window.NEXE_KNOWLEDGE) return findAdvisorProductLegacy(role, answers);
  for(var i=0;i<PRODS.length;i++){
    var p = PRODS[i];
    var score = NEXE_KNOWLEDGE.scoreProductByKnowledge(p, i, answers);
    if(!score) continue;
    if(role.termFilter && p.n){
      var nL = p.n.toLowerCase();
      var ok = false;
      for(var tf=0;tf<role.termFilter.length;tf++) if(nL.indexOf(role.termFilter[tf].toLowerCase()) > -1){ ok=true; break; }
      if(!ok) continue;
    }
    var bonus = 0;
    if(p.aplic && p.aplic.indexOf(answers.material) > -1) bonus += 5;
    score += bonus;
    if(score > bestScore){ bestScore = score; best = {p:p,idx:i}; }
  }
  if(best){
    var conf = 64 + (bestScore > 50 ? 22 : bestScore > 30 ? 12 : 0) + (answers.machine !== 'manual' ? 4 : 0);
    best.confidence = Math.min(98, conf);
    best.score = bestScore;
  }
  return best;
}

function findAdvisorProductLegacy(role, answers){
  var best = null, bestScore = -1;
  for(var i=0;i<PRODS.length;i++){
    var p = PRODS[i];
    var name = (p.n||'').toLowerCase();
    var section = (p.s||'').toLowerCase();
    var description = (p.d||'').toLowerCase();
    var score = 0;
    var excluded = false;
    if(role.avoid){ for(var x=0;x<role.avoid.length;x++) if(name.indexOf(role.avoid[x]) > -1) excluded = true; }
    if(excluded) continue;
    for(var t=0;t<role.terms.length;t++){
      if(name.indexOf(role.terms[t]) > -1) score += 12;
      else if(section.indexOf(role.terms[t]) > -1) score += 6;
      else if(description.indexOf(role.terms[t]) > -1) score += 2;
    }
    if(!score) continue;
    if(p.aplic && p.aplic.indexOf(answers.material) > -1) score += 14;
    if(answers.location === 'site' && (name.indexOf('portátil') > -1 || name.indexOf('manual') > -1)) score += 3;
    if(answers.finish === 'premium' && (name.indexOf('professional') > -1 || name.indexOf('pro ') > -1)) score += 2;
    if(score > bestScore){ bestScore = score; best = {p:p,idx:i}; }
  }
  if(best) best.confidence = Math.min(98, 64 + (best.p.aplic && best.p.aplic.indexOf(answers.material) > -1 ? 22 : 8) + (answers.machine !== 'manual' ? 4 : 0));
  return best;
}

function renderAdvisorResult(pages){
  var roles = getExpertRoles(advisorAnswers);
  var workLabel = {cut:'Tall',glue:'Enganxat',polish:'Polit',repair:'Reparació',install:'Instal·lació'}[advisorAnswers.work];
  pages.advisor.innerHTML = '<button class="filter-chip" id="advisorRestart">‹ Nova consulta</button><div class="advisor-result-head"><div class="home-kicker">Recomanació tècnica</div><h2>Kit per a '+workLabel.toLowerCase()+'</h2><p>La proposta té en compte material, gruix, entorn, ubicació, acabat i màquina.</p></div><div class="advisor-meta"><div><span>Material</span><strong>'+advisorAnswers.material+'</strong></div><div><span>Entorn</span><strong>'+(advisorAnswers.environment === 'exterior' ? 'Exterior' : 'Interior')+'</strong></div><div><span>Ubicació</span><strong>'+(advisorAnswers.location === 'site' ? 'Obra' : 'Taller')+'</strong></div></div>';
  pages.advisor.querySelector('#advisorRestart').addEventListener('click', function(){ renderAdvisor(pages); });
  for(var r=0;r<roles.length;r++){
    var role = roles[r];
    var item = findAdvisorProduct(role, advisorAnswers);
    if(!item) continue;
    (function(roleData, result){
      var section = document.createElement('section'); section.className = 'advisor-role';
      var why = 'Compatible amb '+advisorAnswers.material+'. '+roleData.note;
      if(window.NEXE_KNOWLEDGE && result.p){
        var k = NEXE_KNOWLEDGE.getProductKnowledge(result.p, result.idx);
        if(k){
          var usageLabels = k.uso ? k.uso.map(function(u){ return NEXE_KNOWLEDGE.getUsoLabel(u); }).join(', ') : '';
          var toolLabels = k.herramientas ? k.herramientas.map(function(t){ return NEXE_KNOWLEDGE.getToolLabel(t); }).join(', ') : '';
          if(k.dificultad) why += ' Nivell '+NEXE_KNOWLEDGE.getDifficultyLabel(k.dificultad)+'.';
          if(k.herramientas) why += ' Requereix '+toolLabels+'.';
        }
      }
      why += ' '+(advisorAnswers.environment === 'exterior' ? 'S\'ha valorat l\'ús a exterior.' : 'Pensat per a ús interior.');
      section.innerHTML = '<h3>'+roleData.title+' <span class="advisor-confidence">'+result.confidence+'% confiança</span></h3><p>'+escHtml(why)+'</p><button class="advisor-product"><img src="'+escHtml(getImgSrc(result.p))+'" alt="" loading="lazy"><span><span class="brand">'+escHtml(result.p.b||'')+'</span><span class="name">'+escHtml(result.p.n||'')+'</span></span><span class="open">›</span></button>';
      section.querySelector('.advisor-product').addEventListener('click', function(){ navigate('product/'+result.idx, null, pages); });
      pages.advisor.appendChild(section);
    })(role, item);
  }
}

// Restore previous context after closing a product/variant detail
function restoreReturnContext(){
  var ctx = _returnCtx;
  _returnCtx = null;
  // Remove overlays
  var pd = document.getElementById('prodDetail');
  if(pd) pd.remove();
  var vd = document.getElementById('variantDetail');
  if(vd) vd.remove();
  if(ctx && ctx.type === 'category'){
    navigate('category/' + ctx.catId, null, _pages, true);
    if(ctx.subcatId || ctx.filter){
      _currentSubcat = ctx.subcatId || null;
      _currentFilter = ctx.filter || null;
      showCategory(ctx.catId, _currentSubcat, _currentFilter, _pages);
    }
    if(ctx.scrollTop && _pages && _pages.main) _pages.main.scrollTop = ctx.scrollTop;
  } else if(ctx && ctx.type === 'search'){
    navigate(ctx.underPage || 'home', null, _pages, true);
    openSearch(ctx.query);
  } else if(ctx && ctx.type === 'page'){
    navigate(ctx.page, null, _pages, true);
  } else {
    navigate('home', null, _pages, true);
  }
  // Safety: ensure no lingering overlays
  var _pd = document.getElementById('prodDetail');
  if(_pd) _pd.remove();
  var _vd = document.getElementById('variantDetail');
  if(_vd) _vd.remove();
}

function navigate(page, data, pages, skipNavStack){
  if(page === currentPage && !page.startsWith('product/')) return;
  // Guard: prevent duplicate product/variant overlay creation (e.g., from delegated + individual handlers)
  if(page.startsWith('product/') || page.startsWith('variant/')){
    var existingId = page.startsWith('product/') ? 'prodDetail' : 'variantDetail';
    if(document.getElementById(existingId)){
      closeSearch();
      return;
    }
  }
  if(!skipNavStack){
    if(page === 'home' || page === 'lists' || page === 'settings'){
      navStack = [];
    }else if(!page.startsWith('product/') && !page.startsWith('variant/')){
      navStack.push(currentPage);
      if(navStack.length > 10) navStack.splice(0, navStack.length - 10);
    }
  }
  // Save return context when opening a product or variant detail
  if((page.startsWith('product/') || page.startsWith('variant/')) && !_returnCtx){
    if(currentPage.startsWith('category/')){
      var scrollSave = _pages && _pages.main ? _pages.main.scrollTop : 0;
      _returnCtx = {type:'category', catId:currentPage.split('/')[1], subcatId:_currentSubcat, filter:_currentFilter, scrollTop:scrollSave};
    } else {
      _returnCtx = {type:'page', page:currentPage};
    }
  }
  showPage(page, data, pages, document.querySelector('.header-title'), document.getElementById('btnBack'), document.querySelectorAll('.nav-item'), skipNavStack);
}

function goBack(){
  if(navStack.length > 0) navigate(navStack.pop(), null, _pages);
  else navigate('home', null, _pages);
}

function showPage(page, data, pages, headerTitle, btnBack, navItems, skipNavStack){
  currentPage = page;

  // Remove product/variant detail overlays if navigating away
  if(!page.startsWith('product/') && !page.startsWith('variant/')){
    var pd = document.getElementById('prodDetail');
    if(pd) pd.remove();
    var vd = document.getElementById('variantDetail');
    if(vd) vd.remove();
  }

  // Hide all pages
  var allPages = document.querySelectorAll('.page');
  for(var i=0;i<allPages.length;i++) allPages[i].classList.remove('active');
  if(!skipNavStack && pages.main) pages.main.scrollTop = 0;

  // Header
  if(btnBack) btnBack.hidden = !(navStack.length > 0 && page !== 'home' && page !== 'lists' && page !== 'settings');
  if(headerTitle){
    if(page === 'home') headerTitle.textContent = 'Nexe Catàleg';
    else if(page === 'lists') headerTitle.textContent = 'Llistes';
    else if(page.startsWith('list/')) headerTitle.textContent = 'Llista';
    else if(page === 'advisor') headerTitle.textContent = 'Assessor NEXE';
    else if(page === 'settings') headerTitle.textContent = 'Més';
    else if(page.startsWith('category/')){
      var catId = page.split('/')[1];
      var cat = null;
      for(var i=0;i<NAV_CATEGORIES.length;i++){ if(NAV_CATEGORIES[i].id === catId){ cat = NAV_CATEGORIES[i]; break; } }
      headerTitle.textContent = cat ? cat.icon+' '+cat.nom : 'Catàleg';
    }
  }

  // Nav
  for(var i=0;i<navItems.length;i++){
    var np = navItems[i].getAttribute('data-page');
    navItems[i].classList.toggle('active', np === page || (page.startsWith('category/') && np === 'home') || (page.startsWith('list/') && np === 'lists') || (page === 'clients' && np === 'clients'));
  }

  if(page === 'home'){ showHome(pages); return; }
  if(page === 'advisor'){ pages.advisor.classList.add('active'); return; }
  if(page === 'clients'){ showClients(pages); return; }
  if(page === 'lists'){ showLists(pages); return; }
  if(page.startsWith('list/')){ showListDetail(page.split('/')[1], pages); return; }
  if(page === 'settings'){ showSettings(pages); return; }
  if(page.startsWith('category/')){ showCategory(page.split('/')[1], null, null, pages); return; }
  if(page.startsWith('variant/')){ showVariantGroup(page.split('/')[1], pages); return; }
  if(page.startsWith('product/')){ showProduct(parseInt(page.split('/')[1])); return; }
  showHome(pages);
}

function showHome(pages){
  pages.home.classList.add('active');
}

function showCategory(catId, subcatId, filter, pages){
  pages.category.classList.add('active');

  // Find nav category definition
  var navCat = null;
  for(var i=0;i<NAV_CATEGORIES.length;i++){
    if(NAV_CATEGORIES[i].id === catId){ navCat = NAV_CATEGORIES[i]; break; }
  }
  if(!navCat) return;

  // Get products for this nav category
  var allProds = [];
  for(var i=0;i<PRODS.length;i++){
    if(_editOverrides[i] && _editOverrides[i].deleted) continue;
    var _vgCheck = PRODS[i].variantGroup || getProductVariantGroupId(i);
    if(_vgCheck && _editOverrides['_vg:'+_vgCheck] && _editOverrides['_vg:'+_vgCheck].deleted) continue;
    if(isProductInNavCategory(PRODS[i], navCat)) allProds.push(PRODS[i]);
  }

  // Apply subcategory filter
  var prods = allProds;
  if(subcatId){
    var subcatDef = null;
    for(var si=0;si<navCat.subcats.length;si++){
      if(navCat.subcats[si].id === subcatId){ subcatDef = navCat.subcats[si]; break; }
    }
    if(subcatDef && subcatDef.filter){
      // Custom filter (for man-inst merged subcats)
      var f = subcatDef.filter;
      prods = [];
      for(var i=0;i<allProds.length;i++){
        var p = allProds[i];
        var matchCat = !f.cat || (Array.isArray(f.cat) ? f.cat.indexOf(p.cat)>-1 : p.cat===f.cat);
        if(!matchCat) continue;
        var matchSub = !f.subcat || (Array.isArray(f.subcat) ? f.subcat.indexOf(p.subcat)>-1 : p.subcat===f.subcat);
        if(matchSub) prods.push(p);
      }
    } else {
      // Standard filter by subcat (also show products with empty subcat)
      prods = [];
      for(var i=0;i<allProds.length;i++){
        if(allProds[i].subcat === subcatId || !allProds[i].subcat) prods.push(allProds[i]);
      }
    }
  }

  // Apply brand/aplic filter on top of subcategory filter
  if(filter && filter.type){
    if(filter.type === 'marca'){
      var filtered = [];
      for(var i=0;i<prods.length;i++){ if(prods[i].b === filter.value) filtered.push(prods[i]); }
      prods = filtered;
    }else if(filter.type === 'aplic'){
      var filtered = [];
      for(var i=0;i<prods.length;i++){
        if(prods[i].aplic && prods[i].aplic.indexOf(filter.value) > -1) filtered.push(prods[i]);
      }
      prods = filtered;
    }
  }

  // Build brand/aplic filters (from allProds for full list)
  var brands = {}, aplics = {};
  for(var i=0;i<allProds.length;i++){
    var p = allProds[i];
    if(p.b) brands[p.b] = 1;
    if(p.aplic){ for(var j=0;j<p.aplic.length;j++) aplics[p.aplic[j]] = 1; }
  }
  var brandList = Object.keys(brands).sort();
  var aplicList = Object.keys(aplics).sort();

  // Art funerari: show a big-tile submenu of its subcategories instead of the full grid
  if(catId === 'vezzani' && !subcatId && !filter){
    renderVezzaniSubmenu(catId, navCat, allProds, pages);
    return;
  }

  // Filter bar with subcategories and brand/aplic
  renderFilterBar(catId, subcatId, filter, navCat, brandList, aplicList, pages);

  // Manipulació: sort Dogher + featured products first (visual order only, doesn't affect indexes)
  if(catId === 'man-inst' && !subcatId && !filter){
    prods = prods.slice().sort(function(a,b){
      var aPrio = a.featured ? 0 : 1;
      var bPrio = b.featured ? 0 : 1;
      return aPrio - bPrio;
    });
  }

  // Product grid
  _gridCtx = catId + '|' + (subcatId || '') + '|' + ((filter && filter.type) ? (filter.type + ':' + filter.value) : '');
  renderProductGrid(pages.categoryGrid, prods, pages);
}

function renderVezzaniSubmenu(catId, navCat, allProds, pages){
  pages.filterBar.innerHTML = '';
  var grid = pages.categoryGrid;
  grid.innerHTML = '';
  grid.className = 'subcat-grid';
  var head = document.createElement('div');
  head.className = 'section-head';
  head.innerHTML = '<div><div class="section-kicker">Art funerari</div><div class="section-title">Tria un apartat</div></div>';
  grid.appendChild(head);

  var subcats = navCat.subcats || [];
  for(var si=0;si<subcats.length;si++){
    (function(sc){
      var cnt = 0;
      for(var pi=0;pi<allProds.length;pi++){ if(allProds[pi].subcat === sc.id) cnt++; }
      var tile = document.createElement('button');
      tile.className = 'subcat-tile sub-' + sc.id;
      tile.innerHTML = '<div class="bg-grad"></div><div class="glow"></div><span class="name">' + escHtml(sc.nom) + '</span><span class="count">' + cnt + ' productes</span>';
      tile.addEventListener('click', function(){ _currentSubcat = sc.id; showCategory(catId, sc.id, null, pages); });
      grid.appendChild(tile);
    })(subcats[si]);
  }
}

function renderFilterBar(catId, activeSubcat, activeFilter, navCat, brands, aplics, pages){
  var bar = pages.filterBar;
  bar.innerHTML = '';

  // Subcategory chips
  var hasSubcats = navCat.subcats && navCat.subcats.length > 0;
  if(hasSubcats){
    var all = document.createElement('button');
    all.className = 'filter-chip' + (!activeSubcat ? ' active' : '');
    all.textContent = 'Tots';
    all.addEventListener('click', function(){ _currentSubcat = null; _currentFilter = null; showCategory(catId, null, null, pages); });
    bar.appendChild(all);
    for(var si=0;si<navCat.subcats.length;si++){
      var sc = navCat.subcats[si];
      var chip = document.createElement('button');
      chip.className = 'filter-chip' + (activeSubcat === sc.id ? ' active' : '');
      chip.textContent = sc.nom;
      chip.addEventListener('click', function(id){ return function(){ _currentSubcat = id; showCategory(catId, id, _currentFilter, pages); }; }(sc.id));
      bar.appendChild(chip);
    }
  }

  // Divider
  if(hasSubcats && ((brands.length > 0) || (aplics.length > 0))){
    var sep = document.createElement('span');
    sep.style.cssText = 'width:1px;height:24px;background:rgba(0,0,0,.1);flex-shrink:0;margin:0 2px';
    bar.appendChild(sep);
  }

  // Brand filter
  if(brands.length > 0){
    var chip = document.createElement('button');
    chip.className = 'filter-chip' + (activeFilter && activeFilter.type === 'marca' ? ' active' : '');
    chip.textContent = activeFilter && activeFilter.type === 'marca' ? activeFilter.value : 'Marca';
    chip.addEventListener('click', function(){ showFilterPickerCategory(catId, activeSubcat, activeFilter, 'Marca', brands, function(v){ _currentFilter = {type:'marca',value:v}; showCategory(catId, _currentSubcat, _currentFilter, pages); }, pages); });
    bar.appendChild(chip);
  }

  // Aplic filter
  if(aplics.length > 0){
    var chip = document.createElement('button');
    chip.className = 'filter-chip' + (activeFilter && activeFilter.type === 'aplic' ? ' active' : '');
    chip.textContent = activeFilter && activeFilter.type === 'aplic' ? activeFilter.value : 'Aplicació';
    chip.addEventListener('click', function(){ showFilterPickerCategory(catId, activeSubcat, activeFilter, 'Aplicació', aplics, function(v){ _currentFilter = {type:'aplic',value:v}; showCategory(catId, _currentSubcat, _currentFilter, pages); }, pages); });
    bar.appendChild(chip);
  }
}

function showFilterPickerCategory(catId, subcatId, activeFilter, title, options, onSelect, pages){
  var existing = document.querySelectorAll('.filter-picker');
  for(var i=0;i<existing.length;i++) existing[i].remove();
  var overlay = document.createElement('div');
  overlay.className = 'search-overlay filter-picker';
  overlay.innerHTML = '<div class="search-input-wrap"><span style="font-size:18px;color:var(--text2)">'+title+'</span><button class="cancel" id="fpClose">Tancar</button></div><div class="results" id="fpList"></div>';
  document.body.appendChild(overlay);

  var list = overlay.querySelector('#fpList');
  for(var i=0;i<options.length;i++){
    (function(opt){
      var item = document.createElement('div');
      item.className = 'search-result-item';
      item.innerHTML = '<div class="info"><div class="name">'+escHtml(opt)+'</div></div>';
      item.addEventListener('click', function(){ overlay.remove(); onSelect(opt); });
      list.appendChild(item);
    })(options[i]);
  }

  overlay.querySelector('#fpClose').addEventListener('click', function(){ overlay.remove(); });
}

function renderProductGrid(grid, prods, pages){
  grid.className = 'prod-grid';
  var savedScroll = pages && pages.main ? pages.main.scrollTop : 0;
  grid.innerHTML = '';

  // Collapse variant groups: group products by variantGroup
  var variantGroups = {};
  var variantProductIdx = {};
  var flatList = [];
  for(var i=0;i<prods.length;i++){
    var p = prods[i];
    var idx = -1;
    for(var j=0;j<PRODS.length;j++){ if(PRODS[j] === p){ idx = j; break; } }
    // Skip KGS individual products that are part of a group (hide from catalog)
    if(p.kgsGroup && !p.variants) continue;
    if(p.variantGroup){
      if(!variantGroups[p.variantGroup]) variantGroups[p.variantGroup] = [];
      variantGroups[p.variantGroup].push({p:p, idx:idx});
      variantProductIdx[idx] = true;
    } else {
      // Check auto-detected groups
      var autoGid = getProductVariantGroupId(idx);
      if(autoGid){
        if(!variantGroups[autoGid]) variantGroups[autoGid] = [];
        variantGroups[autoGid].push({p:p, idx:idx});
        variantProductIdx[idx] = true;
      } else {
        flatList.push({p:p, idx:idx});
      }
    }
  }

  // Add collapsed variant group cards
  var groupIds = Object.keys(variantGroups);
  for(var gi=0;gi<groupIds.length;gi++){
    var gid = groupIds[gi];
    var members = variantGroups[gid];
    var def = getVariantGroupDef(gid);
    if(!def) {
      // Fallback: show each product separately
      for(var mi=0;mi<members.length;mi++){
        flatList.push(members[mi]);
      }
      continue;
    }
    var first = members[0];
    var imgSrc = getImgSrc(first.p, first.idx);
    var defaultList = customLists.length ? customLists[0] : null;
    var isInDefault = defaultList && defaultList.items.indexOf(first.idx) > -1;
    var memberCount = members.length;

    var card = document.createElement('div');
    card.className = 'prod-card';
    card.setAttribute('data-group', gid);
    var variantMeta = '';
    if(def.options && def.options[0]){
      var colorCount = def.options[0].values.length;
      if(def.options[0].type === 'list' && def.options[0].values[0] && def.options[0].values[0].id.indexOf('-') > -1){
        var colorDots = '';
        if(def.options[0].popular){
          var pops = def.options[0].popular;
          for(var di=0;di<Math.min(pops.length,6);di++){
            colorDots += '<span class="variant-dot" style="background:'+getApproxSwatch(pops[di])+'"></span>';
          }
          if(colorCount > pops.length) colorDots += '<span class="variant-dot-more">+'+(colorCount-pops.length)+'</span>';
        }
        variantMeta = '<div class="variant-colors">'+colorDots+'</div><div class="variant-badge">🎨 '+colorCount+' colors</div>';
      } else {
        variantMeta = '<div class="variant-badge">🔧 '+memberCount+' variants</div>';
      }
    } else {
      variantMeta = '<div class="variant-badge">🔧 '+memberCount+' variants</div>';
    }
    card.innerHTML = '<div class="img-wrap"><img src="'+escHtml(imgSrc)+'" alt="'+escHtml(def.name||'')+'" loading="lazy"><button class="fav-btn'+(isInDefault?' active':'')+'" aria-label="Favorit">'+(isInDefault?'❤️':'🤍')+'</button></div><div class="info"><div class="brand">'+escHtml(def.brand||'')+'</div><div class="name">'+escHtml(def.name||'')+'</div>'+variantMeta+'</div>';
    card.addEventListener('click', function(id){ return function(e){
      if(e.target.closest('.fav-btn') || e.target.closest('.edit-delete') || e.target.closest('[contenteditable]')) return;
      navigate('variant/'+id, null, pages);
    }; }(gid));
    card.querySelector('.fav-btn').addEventListener('click', function(i,btn){ return function(e){
      e.stopPropagation();
      toggleDefaultList(i, btn);
    }; }(first.idx, card.querySelector('.fav-btn')));
    grid.appendChild(card);
  }

  // Regular products
  for(var i=0;i<flatList.length;i++){
    var item = flatList[i];
    var p = item.p;
    var idx = item.idx;
    var defaultList = customLists.length ? customLists[0] : null;
    var isInDefault = defaultList && defaultList.items.indexOf(idx) > -1;
    var imgSrc = getImgSrc(p, idx);
    var card = document.createElement('div');
    card.className = 'prod-card' + (isPortraitImgProduct(p) ? ' prod-contain' : '');
    card.setAttribute('data-idx', idx);
    var displayPrice = (_editOverrides[idx] && _editOverrides[idx].price !== undefined) ? _editOverrides[idx].price : (parseFloat(p.p)||0);
    var _cName = (_editOverrides[idx] && _editOverrides[idx].name !== undefined) ? _editOverrides[idx].name : p.n;
    var _cBrand = (_editOverrides[idx] && _editOverrides[idx].brand !== undefined) ? _editOverrides[idx].brand : p.b;
    var _cRef = (_editOverrides[idx] && _editOverrides[idx].ref !== undefined) ? _editOverrides[idx].ref : p.r;
    card.innerHTML = '<div class="img-wrap"><img src="'+escHtml(imgSrc)+'" alt="'+escHtml(_cName||'')+'" loading="lazy" onerror="_handleImgError(this)"><button class="fav-btn'+(isInDefault?' active':'')+'" aria-label="Favorit">'+(isInDefault?'❤️':'🤍')+'</button></div><div class="info"><div class="brand">'+(p.star?'<span class="star-brand">★</span>':'')+escHtml(_cBrand||'')+'</div><div class="name">'+escHtml(_cName||'')+'</div><div class="ref">'+escHtml(_cRef||'')+'</div><div class="price">'+formatPrice(displayPrice)+'</div></div>';
    card.addEventListener('click', function(i){ return function(e){
      if(e.target.closest('.fav-btn') || e.target.closest('.edit-delete') || e.target.closest('[contenteditable]')) return;
      var prod = PRODS[i];
      if(prod && prod.variantGroup){ navigate('variant/'+prod.variantGroup, null, pages); return; }
      var vgId2 = getProductVariantGroupId(i);
      if(vgId2){ navigate('variant/'+vgId2, null, pages); return; }
      navigate('product/'+i, null, pages);
    }; }(idx));
    card.querySelector('.fav-btn').addEventListener('click', function(i,btn){ return function(e){
      e.stopPropagation();
      toggleDefaultList(i, btn);
    }; }(idx, card.querySelector('.fav-btn')));
    grid.appendChild(card);
  }
  var _ctxNow = _gridCtx; _gridCtx = null;
  if(_ctxNow){ grid.setAttribute('data-ctx', _ctxNow); _applySavedOrder(grid, _ctxNow); } else { grid.removeAttribute('data-ctx'); }
  if(pages && pages.main) pages.main.scrollTop = savedScroll;
  if(_editMode) _showEditOverlay();
}

function getApproxSwatch(colorId){
  // Approximate swatches for known Integra colors
  var map = {
    'pure-white-0190':'#F5F5F0','white-2420':'#EEEDE8','white-north-2440':'#E8E6DF',
    'polar-white-3080':'#E6E5E0','perfect-white-3172':'#EBEAE4','glacier-white-3006':'#E0E3E4',
    'transparent-white-0271':'#E8E8E8','white-linen-0310':'#EAE6DC',
    'crystal-clear-1000':'#F0F0EC',
    'black-2080':'#2D2D2D','galaxy-black-2235':'#1A1A1A','satin-black-3062':'#3A3A3A',
    'graphite-3230':'#6B6B6B','iron-grey-3064':'#4A4A4A','storm-grey-2402':'#7A7A7A',
    'meteor-grey-2320':'#5C5C5C','slate-3060':'#585858','silver-3129':'#A0A0A0',
    'natural-grey-3069':'#8B8682','newport-grey-2360':'#8E8B86','new-gale-grey-2340':'#9C9893',
    'stellar-grey-2403':'#989490','geogris-3130':'#B8B4AE','cregris-3134':'#C5C0BA',
    'flint-2220':'#706C68','cinder-3074':'#605C58','pewter-0160':'#B0ACA4',
    'neutral-3029':'#D0CCC4','nacreto-3131':'#D4D0C8','cotton-3141':'#D8D4CC',
    'pumice-3149':'#C8C4BC','sand-3094':'#D4C8B4','sandstone-3157':'#C8BCA8',
    'sabbia-3139':'#D0C4B0','sahara-2380':'#C8B898','desert-2197':'#B8A888',
    'earth-3077':'#8B7D6B','manila-0133':'#D8CCB8','khaki-0110':'#C8B898',
    'champagne-3118':'#E0D4C0','nougat-3099':'#C4B09C','mocha-3121':'#908070',
    'vela-brown-2407':'#7A6B5A','oscurto-3142':'#403B35',
    'oyster-3065':'#D4CCC0','seashel-3035':'#E0D8CC','diana-pearl-2200':'#D8D0C4',
    'luna-pearl-2283':'#C8C4BC','cygnus-pearl-2195':'#B8B4AC',
    'rhin-3078':'#A09890','quarry-2375':'#888078','raton-3132':'#9C9488',
    'magic-3091':'#D0C8B8','medea-3186':'#C8C0B4','brie-3105':'#D8D0C4',
    'zenith-3276':'#707070','winter-white-3181':'#E8E8E4',
    'brownstone-3244':'#6B5B4A','onyx-3243':'#2A2A2A',
    'chameleon-3008':'#7A8A70','bright-white-3011':'#F0F0EC','beach-2065':'#D0C0A8',
    'amazon-3098':'#5A6A50','alpha-brown-2006':'#6B5A48'
  };
  return map[colorId] || '#E8E8ED';
}

function showVariantGroup(groupId, pages){
  var def = getVariantGroupDef(groupId);
  if(!def){ navigate('home', null, pages); return; }

  var members = getVariantProducts(groupId);
  if(members.length === 0) return;

  // Current selection
  var selectedOpts = {};
  if(def.options){
    for(var oi=0;oi<def.options.length;oi++){
      var opt = def.options[oi];
      selectedOpts[opt.id] = opt.values[0] ? opt.values[0].id : null;
    }
  } else if(def.autoDetected && members.length > 0){
    selectedOpts._idx = '0';
  }

  // Remove existing detail
  var existing = document.getElementById('variantDetail');
  if(existing) existing.remove();

  // Shared mutable state — updated on selection change
  var current = null;
  var p = null;
  var idx = -1;

  function getCurrent(){
    var cur = getVariantProduct(groupId, selectedOpts);
    return cur || members[0];
  }

  function updateVariantDisplay(){
    current = getCurrent();
    p = current.p;
    idx = current.idx;
    var detail = document.getElementById('variantDetail');
    if(!detail) return;

    // Update gallery image
    var track = detail.querySelector('.gallery > div');
    if(track){
      var imgs = [];
      var _updOverrideImgs = (_editOverrides[idx] && _editOverrides[idx].imgs) ? _editOverrides[idx].imgs : null;
      if(_updOverrideImgs && _updOverrideImgs.length > 0){
        for(var gi=0;gi<_updOverrideImgs.length;gi++){
          var simg = _updOverrideImgs[gi];
          if(_isValidImg(simg)) imgs.push(_imgSrc(simg) || _imgPlaceholder);
        }
      } else if(p.imgs && p.imgs.length > 0){
        for(var gi=0;gi<p.imgs.length;gi++){
          var simg = p.imgs[gi];
          if(_isValidImg(simg)) imgs.push(_imgSrc(simg) || _imgPlaceholder);
        }
      }
      if(!_editMode && imgs.length && imgs.every(function(x){ return x === _imgPlaceholder; })){ imgs = []; (p.imgs || []).forEach(function(x){ var u = _imgSrc(x); if(u) imgs.push(u); }); }
  if(imgs.length === 0 && _isValidImg(p.i)) imgs.push(_imgSrc(p.i) || _imgPlaceholder);
var fit = 'contain';
      track.innerHTML = imgs.map(function(s){ return '<img src="'+escHtml(s)+'" alt="" style="flex-shrink:0;width:100%;height:100%;object-fit:'+fit+'" onerror="_handleImgError(this)">'; }).join('');
      if(track.parentNode && track.parentNode._refresh) track.parentNode._refresh();
    }

    // Update ref and price
    var refEl = detail.querySelector('.ref');
    if(refEl){
      var _updRef = (_editOverrides[idx] && _editOverrides[idx].ref !== undefined) ? _editOverrides[idx].ref : p.r;
      refEl.textContent = 'Ref. '+(_updRef||'');
    }
    var priceEl = detail.querySelector('#vgPrice') || detail.querySelector('.price');
    if(priceEl){
      var overriddenPrice = (_editOverrides[idx] && _editOverrides[idx].price !== undefined) ? _editOverrides[idx].price : (parseFloat(p.p)||0);
      priceEl.textContent = formatPrice(overriddenPrice);
    }
    // Descripció del model seleccionat (fora del mode edició, on s'està editant)
    var descEl = detail.querySelector('.product-panel .desc');
    if(descEl && !_editMode){
      var _updDesc = (_editOverrides[idx] && _editOverrides[idx].desc !== undefined) ? _editOverrides[idx].desc : (p.d||def.description||'');
      descEl.textContent = _updDesc;
    }

    if(def.autoDetected){
      // Update variant chip active states
      detail.querySelectorAll('.variant-chip').forEach(function(chip){
        chip.classList.toggle('active', chip.getAttribute('data-mi') === selectedOpts._idx);
      });
    } else {
      // Update color chip / list item active states
      var opt = def.options && def.options[0];
      var selectedVal = opt ? selectedOpts[opt.id] : null;
      detail.querySelectorAll('.color-popular-chip').forEach(function(chip){
        chip.classList.toggle('active', chip.getAttribute('data-color') === selectedVal);
      });
      detail.querySelectorAll('.color-list-item').forEach(function(item){
        var isSel = item.getAttribute('data-color') === selectedVal;
        item.classList.toggle('selected', isSel);
        var radio = item.querySelector('.radio');
        if(radio) radio.classList.toggle('on', isSel);
      });
    }

    // Update knowledge panel (if it exists)
    var kPanel = detail.querySelector('.product-panel .k-grid');
    if(kPanel){
      var newK = buildKnowledgePanel(idx);
      if(newK){
        var temp = document.createElement('div');
        temp.innerHTML = newK;
        kPanel.parentElement.replaceWith(temp.firstChild);
      }
    }
  }

  function renderVariant(){
    current = getCurrent();
    p = current.p;
    idx = current.idx;
    var imgs = [];
    if(p.imgs && p.imgs.length > 0){
      for(var gi=0;gi<p.imgs.length;gi++){
        var simg = p.imgs[gi];
        if(_isValidImg(simg)) imgs.push(_imgSrc(simg) || _imgPlaceholder);
      }
    }
    if(!_editMode && imgs.length && imgs.every(function(x){ return x === _imgPlaceholder; })){ imgs = []; (p.imgs || []).forEach(function(x){ var u = _imgSrc(x); if(u) imgs.push(u); }); }
  if(imgs.length === 0 && _isValidImg(p.i)) imgs.push(_imgSrc(p.i) || _imgPlaceholder);
    if(imgs.length === 0) imgs.push('data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#e8e8ed" rx="12"/><text x="100" y="105" text-anchor="middle" fill="#999" font-size="14" font-family="sans-serif">Sense imatge</text></svg>'));

  var fit = 'contain'; // foto sencera, sense retallar
    var html = '<button class="close-btn" id="vgClose" aria-label="Tancar">✕</button>';
    html += '<div class="gallery" id="vgGallery"><div style="display:flex;height:100%">';
    for(var i=0;i<imgs.length;i++){
      html += '<div class="gallery-slide" data-gi="'+i+'" style="position:relative;flex-shrink:0;width:100%;height:100%">';
      html += '<img src="'+escHtml(imgs[i])+'" alt="" style="width:100%;height:100%;object-fit:'+fit+'" onerror="_handleImgError(this)">';
      if(_editMode) html += '<button class="gallery-img-del" data-gi="'+i+'" aria-label="Eliminar foto">\u2715</button>';
      html += '</div>';
    }
    if(p.video){
      html += '<iframe src="'+escHtml(p.video)+'" style="flex-shrink:0;width:100%;height:100%;border:none" allowfullscreen></iframe>';
    }
    html += '</div>';
    if(_editMode){
      html += '<button class="gallery-add-photo" id="vgGalleryAddPhoto" aria-label="Afegir foto">+ Foto</button>';
      html += '<input type="file" id="vgGalleryFileInput" accept="image/*" capture="environment" style="display:none" multiple>';
    }
    if(imgs.length > 1 || p.video){
      html += '<button class="gallery-arrow gallery-prev" id="vgGalleryPrev" aria-label="Anterior">‹</button>';
      html += '<button class="gallery-arrow gallery-next" id="vgGalleryNext" aria-label="Següent">›</button>';
    }
    html += '</div>';

    var _vgBrand = (_editOverrides[idx] && _editOverrides[idx].brand !== undefined) ? _editOverrides[idx].brand : def.brand;
    var _vgName = (_editOverrides[idx] && _editOverrides[idx].name !== undefined) ? _editOverrides[idx].name : def.name;
    var _vgRef = (_editOverrides[idx] && _editOverrides[idx].ref !== undefined) ? _editOverrides[idx].ref : p.r;
    html += '<div class="body">';
    html += '<div class="eyebrow'+(_editMode?' edit-text':'')+'"'+(_editMode?' contenteditable="true" data-field="brand" data-idx="'+idx+'"':'')+'>'+escHtml(_vgBrand||'')+'</div>';
    html += '<div class="name'+(_editMode?' edit-text':'')+'"'+(_editMode?' contenteditable="true" data-field="name" data-idx="'+idx+'"':'')+'>'+escHtml(_vgName||'')+'</div>';
    html += '<div class="ref'+(_editMode?' edit-text':'')+'"'+(_editMode?' contenteditable="true" data-field="ref" data-idx="'+idx+'"':'')+'>Ref. '+escHtml(_vgRef||'')+'</div>';
    var vgDisplayPrice = (_editOverrides[idx] && _editOverrides[idx].price !== undefined) ? _editOverrides[idx].price : (parseFloat(p.p)||0);
    html += '<div class="price'+(_editMode?' edit-price':'')+'" id="vgPrice"'+(_editMode?' contenteditable="true" data-idx="'+idx+'"':'')+'>'+formatPrice(vgDisplayPrice)+'</div>';

    // Sticky footer (rendered here as placeholder, moved to fixed position)
    html += '<div class="variant-sticky-footer" id="vgSticky">';
    html += '<button class="add-order-btn" id="vgAddOrder">➕ Afegir al pedido</button>';
    html += '<button class="add-list-btn" id="vgAddList">📋 Afegir a llista</button>';
    html += '</div>';

    if(def.autoDetected){
      // Variant selector for auto-detected groups
      var attrLabel = def.variantAttrLabel || 'Model';
      html += '<div class="section-head" style="margin:18px 0 10px"><div><div class="section-kicker">Selecciona</div><div class="section-title">'+escHtml(attrLabel)+'</div></div></div>';
      html += '<div class="variant-chip-row" id="variantChipRow">';
      for(var mi=0;mi<members.length;mi++){
        var m = members[mi];
        var label = getVariantMemberLabel(m, def);
        var isActive = (parseInt(selectedOpts._idx) === mi);
        html += '<button class="variant-chip'+(isActive?' active':'')+'" data-mi="'+mi+'">'+(m.p && m.p.star?'★ ':'')+escHtml(label)+'</button>';
      }
      html += '</div>';
    } else if(def.options && def.options[0] && def.options[0].type === 'list'){
      // Color selector for manual groups
      var opt = def.options[0];
      var selectedVal = selectedOpts[opt.id];
      html += '<div class="section-head" style="margin:18px 0 10px"><div><div class="section-kicker">Selecciona</div><div class="section-title">'+opt.label+'</div></div></div>';
      html += '<div class="color-selector" id="colorSelector">';
      html += '<input class="color-search" id="colorSearch" type="text" placeholder="🔍 Cerca color..." autocomplete="off">';

      // Popular colors
      if(opt.popular && opt.popular.length){
        html += '<div class="color-section-title">● Populars</div>';
        html += '<div class="color-popular-row" id="popularRow">';
        for(var pi=0;pi<opt.popular.length;pi++){
          var vid = opt.popular[pi];
          var vlabel = '';
          for(var vi=0;vi<opt.values.length;vi++){ if(opt.values[vi].id === vid){ vlabel = opt.values[vi].label; break; } }
          html += '<button class="color-popular-chip'+(selectedVal===vid?' active':'')+'" data-color="'+vid+'">'+escHtml(vlabel)+'</button>';
        }
        html += '</div>';
      }

      // Full list
      html += '<div class="color-section-title">▼ Tots els colors ('+opt.values.length+')</div>';
      html += '<div class="color-list" id="colorList">';
      for(var vi=0;vi<opt.values.length;vi++){
        var v = opt.values[vi];
        html += '<div class="color-list-item'+(selectedVal===v.id?' selected':'')+'" data-color="'+v.id+'"><span class="radio'+(selectedVal===v.id?' on':'')+'"></span>'+escHtml(v.label)+'</div>';
      }
      html += '</div></div>';
    }

    // Description
    var _vgDesc = (_editOverrides[idx] && _editOverrides[idx].desc !== undefined) ? _editOverrides[idx].desc : (p.d||def.description||'');
    html += '<div class="product-panel"><div class="eyebrow">Descripció</div><div class="desc'+(_editMode?' edit-text':'')+'"'+(_editMode?' contenteditable="true" data-field="desc" data-idx="'+idx+'"':'')+'>'+escHtml(_vgDesc)+'</div></div>';

    // Commercial section (only for manual groups with commercial data)
    if(!def.autoDetected && def.commercial){
      html += '<div class="commercial-section">';
      if(def.commercial.aplicacions && def.commercial.aplicacions.length){
        html += '<div class="commercial-block"><h4>🔧 Aplicacions recomanades</h4><ul>';
        for(var ai=0;ai<def.commercial.aplicacions.length;ai++){
          html += '<li>'+escHtml(def.commercial.aplicacions[ai])+'</li>';
        }
        html += '</ul></div>';
      }
      if(def.commercial.materialsCompatibles && def.commercial.materialsCompatibles.length){
        html += '<div class="commercial-block"><h4>🧱 Materials compatibles</h4><div>';
        for(var mi=0;mi<def.commercial.materialsCompatibles.length;mi++){
          html += '<span class="commercial-tag">'+escHtml(def.commercial.materialsCompatibles[mi])+'</span>';
        }
        html += '</div></div>';
      }
      if(def.commercial.competencia && def.commercial.competencia.length){
        html += '<div class="commercial-block"><h4>🏷️ Productes equivalents / competència</h4>';
        for(var ci=0;ci<def.commercial.competencia.length;ci++){
          html += '<div class="commercial-competitor"><strong>'+escHtml(def.commercial.competencia[ci].brand)+'</strong> '+escHtml(def.commercial.competencia[ci].product)+'</div>';
        }
        html += '</div>';
      }
      if(def.commercial.recomendacio){
        html += '<div class="commercial-recommend"><strong>⭐ Recomanació NEXE</strong><br>'+escHtml(def.commercial.recomendacio)+'</div>';
      }
      html += '</div>';
    }

    // Knowledge panel
    html += buildKnowledgePanel(idx);
    html += '</div>'; // .body

    var detail = document.createElement('div');
    detail.className = 'variant-detail';
    detail.id = 'variantDetail';
    detail.innerHTML = html;
    document.body.appendChild(detail);

    // Events
    detail.querySelector('#vgClose').addEventListener('click', restoreReturnContext);

    // Edit mode: price editing + delete for variant detail
    var vgPriceEl = detail.querySelector('#vgPrice');
    if(vgPriceEl && _editMode){
      vgPriceEl.addEventListener('blur', function(){
        var id = this.getAttribute('data-idx');
        var val = parseFloat(String(this.textContent).replace(/[^\d.,]/g, '').replace(',', '.'));
        if(id !== null && !isNaN(val)){
          _editOverrides[id] = _editOverrides[id] || {};
          _editOverrides[id].price = val;
          _saveEditOverrides();
          this.textContent = formatPrice(val);
        } else {
          this.textContent = formatPrice(PRODS[id]._origPrice || parseFloat(PRODS[id].p)||0);
        }
      });
      vgPriceEl.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); this.blur(); } });
      // Delete button
      var vgDelBtn = document.createElement('button');
      vgDelBtn.type = 'button';
      vgDelBtn.id = 'vgDeleteBtn';
      vgDelBtn.textContent = '\u2715 Eliminar';
      vgDelBtn.style.cssText = 'position:absolute;top:16px;right:16px;z-index:10;background:rgba(255,59,48,.92);color:#fff;border:none;border-radius:24px;padding:12px 18px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25)';
      vgDelBtn.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        var id = detail.querySelector('#vgPrice')?.getAttribute('data-idx');
        if(id !== null){
          _editOverrides[id] = _editOverrides[id] || {};
          _editOverrides[id].deleted = true;
          _saveEditOverrides();
        }
        var vd = document.getElementById('variantDetail'); if(vd) vd.remove();
        _returnCtx = null;
        navigate('home', null, _pages, true);
      });
      detail.appendChild(vgDelBtn);
    }

    // Variant text field overrides (edit mode)
    if(_editMode){
      detail.querySelectorAll('.edit-text').forEach(function(el){
        el.addEventListener('blur', function(){
          var field = el.getAttribute('data-field');
          var pIdx = parseInt(el.getAttribute('data-idx'));
          if(!field || isNaN(pIdx)) return;
          var val = el.textContent.trim();
          _editOverrides[pIdx] = _editOverrides[pIdx] || {};
          if(field === 'name') _editOverrides[pIdx].name = val;
          else if(field === 'brand') _editOverrides[pIdx].brand = val;
          else if(field === 'ref') _editOverrides[pIdx].ref = val;
          else if(field === 'desc') _editOverrides[pIdx].desc = val;
          _saveEditOverrides();
        });
        el.addEventListener('keydown', function(e){ if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); this.blur(); } });
      });
    }
    
    // Gallery navigation for variant detail
    _initGallery(detail.querySelector('#vgGallery'));

    // Variant gallery edit mode handlers
    if(_editMode){
      var vgDelBtns = detail.querySelectorAll('.gallery-img-del');
      vgDelBtns.forEach(function(btn){
        btn.addEventListener('click', function(e){
          e.preventDefault();
          e.stopPropagation();
          var gi = parseInt(btn.getAttribute('data-gi'));
          var overrideImgs = (_editOverrides[idx] && _editOverrides[idx].imgs) ? _editOverrides[idx].imgs.slice() : imgs.slice();
          if(gi >= 0 && gi < overrideImgs.length){
            overrideImgs.splice(gi, 1);
            if(overrideImgs.length === 0) overrideImgs.push(_imgPlaceholder);
            _editOverrides[idx] = _editOverrides[idx] || {};
            _editOverrides[idx].imgs = overrideImgs;
            _saveEditOverrides();
            renderVariant();
            // Restore scroll to same position
            var vgG = document.getElementById('vgGallery');
            if(vgG){
              var vgS = vgG.querySelectorAll('.gallery-slide, iframe');
              var target = gi >= vgS.length ? vgS.length - 1 : gi;
              if(target >= 0 && vgG._goTo) vgG._goTo(target, true);
            }
          }
        });
      });
      // Add photo button
      var vgAddPhotoBtn = detail.querySelector('#vgGalleryAddPhoto');
      var vgFileInput = detail.querySelector('#vgGalleryFileInput');
      if(vgAddPhotoBtn && vgFileInput){
        vgAddPhotoBtn.addEventListener('click', function(e){
          e.preventDefault();
          e.stopPropagation();
          vgFileInput.click();
        });
        vgFileInput.addEventListener('change', function(e){
          var files = e.target.files;
          if(!files || files.length === 0) return;
          var overrideImgs = (_editOverrides[idx] && _editOverrides[idx].imgs) ? _editOverrides[idx].imgs.slice() : imgs.slice();
          if(overrideImgs.length === 1 && overrideImgs[0] === _imgPlaceholder) overrideImgs = [];
          var processed = 0;
          var total = files.length;
          for(var fi=0;fi<files.length;fi++){
            (function(file){
              var reader = new FileReader();
              reader.onload = function(ev){
                var img = new Image();
                img.onload = function(){
                  var canvas = document.createElement('canvas');
                  var maxW = 800, maxH = 800;
                  var w = img.naturalWidth, h = img.naturalHeight;
                  if(w > maxW || h > maxH){
                    var ratio = Math.min(maxW/w, maxH/h);
                    w = Math.round(w*ratio);
                    h = Math.round(h*ratio);
                  }
                  canvas.width = w;
                  canvas.height = h;
                  canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                  var compressed = canvas.toDataURL('image/jpeg', 0.7);
                  overrideImgs.push(compressed);
                  processed++;
                  if(processed === total){
                    _editOverrides[idx] = _editOverrides[idx] || {};
                    _editOverrides[idx].imgs = overrideImgs;
                    _saveEditOverrides();
                    renderVariant();
                  }
                };
                img.src = ev.target.result;
              };
              reader.readAsDataURL(file);
            })(files[fi]);
          }
        });
      }
    }
    
    if(def.autoDetected){
      // Variant chip selection — updates in place, preserves scroll
      detail.querySelectorAll('.variant-chip').forEach(function(el){
        el.addEventListener('click', function(e){
          e.stopPropagation();
          selectedOpts._idx = this.getAttribute('data-mi');
          updateVariantDisplay();
        });
      });
    } else {
      // Color search
      var searchInput = detail.querySelector('#colorSearch');
      if(searchInput){
        searchInput.addEventListener('input', function(){
          var q = this.value.toLowerCase();
          var vd = document.getElementById('variantDetail');
          if(!vd) return;
          var items = vd.querySelectorAll('.color-list-item');
          for(var i=0;i<items.length;i++){
            var label = items[i].textContent.toLowerCase();
            items[i].style.display = (!q || label.indexOf(q) > -1) ? '' : 'none';
          }
        });
      }

      // Color list selection — updates in place, preserves scroll
      var optId = def.options && def.options[0] ? def.options[0].id : 'color';
      detail.querySelectorAll('.color-list-item').forEach(function(el){
        el.addEventListener('click', function(e){
          e.stopPropagation();
          selectedOpts[optId] = this.getAttribute('data-color');
          updateVariantDisplay();
        });
      });

      // Popular color selection — updates in place, preserves scroll
      detail.querySelectorAll('.color-popular-chip').forEach(function(el){
        el.addEventListener('click', function(e){
          e.stopPropagation();
          selectedOpts[optId] = this.getAttribute('data-color');
          updateVariantDisplay();
        });
      });
    }

    // Add to order
    detail.querySelector('#vgAddOrder').addEventListener('click', function(){
      var label = getVariantLabel(selectedOpts, def);
      showAddModal(idx, label);
    });
    detail.querySelector('#vgAddList').addEventListener('click', function(){ showAddToListPicker(idx); });
  }

  renderVariant();
}

function formatAttrValue(key, val){
  if(val === null || val === undefined) return null;
  var meta = (window.NEXE_KNOWLEDGE && NEXE_KNOWLEDGE.meta) ? NEXE_KNOWLEDGE.meta[key] : null;
  var label = meta ? meta.label : key;
  if(key === 'dificultad') return {label:label,text:NEXE_KNOWLEDGE ? NEXE_KNOWLEDGE.getDifficultyLabel(val) : val};
  if(key === 'herramientas' && Array.isArray(val)){
    var toolTexts = val.map(function(t){ return NEXE_KNOWLEDGE ? NEXE_KNOWLEDGE.getToolLabel(t) : t; });
    return {label:label,text:toolTexts.join(', ')};
  }
  if(key === 'uso' && Array.isArray(val)){
    var usoTexts = val.map(function(u){ return NEXE_KNOWLEDGE ? NEXE_KNOWLEDGE.getUsoLabel(u) : u; });
    return {label:label,text:usoTexts.join(', ')};
  }
  if(key === 'materiales' && Array.isArray(val)) return {label:label,text:val.join(', ')};
  if(key === 'noMateriales' && Array.isArray(val) && val.length) return {label:label,text:val.join(', ')};
  if(key === 'interior' || key === 'exterior') return {label:label,text:val ? 'Sí' : 'No'};
  if(key === 'resistenciaUV' || key === 'resistenciaQuimica' || key === 'alimentario') return {label:label,text:val ? 'Sí' : 'No'};
  if(key === 'complementarios') return null;
  if(typeof val === 'string' && val) return {label:label,text:val};
  return null;
}

function buildKnowledgePanel(idx){
  if(!window.NEXE_KNOWLEDGE) return '';
  var p = PRODS[idx];
  if(!p) return '';
  var k = NEXE_KNOWLEDGE.getProductKnowledge(p, idx);
  if(!k) return '';
  var html = '<div class="product-panel"><div class="eyebrow">Fitxa tècnica</div><div class="k-grid">';
  var keys = ['uso','materiales','noMateriales','dificultad','herramientas','interior','exterior','temperatura','tiempoAbierto','resistenciaUV','resistenciaQuimica','alimentario','color','viscosidad'];
  var count = 0;
  for(var i=0;i<keys.length;i++){
    var fv = formatAttrValue(keys[i], k[keys[i]]);
    if(!fv) continue;
    html += '<div class="k-item"><span class="k-label">'+escHtml(fv.label)+'</span><span class="k-value">'+escHtml(fv.text)+'</span></div>';
    count++;
  }
  if(count === 0) return '';
  html += '</div></div>';
  return html;
}

function getImgSrc(p, idx){
  // Primera foto que es pugui mostrar: la del mode edició, després les del producte
  var cands = [];
  if(idx !== undefined && _editOverrides[idx] && _editOverrides[idx].imgs) cands = cands.concat(_editOverrides[idx].imgs);
  if(p && p.imgs) cands = cands.concat(p.imgs);
  if(p && p.i) cands.push(p.i);
  for(var ci=0; ci<cands.length; ci++){ var src = _imgSrc(cands[ci]); if(src) return src; }
  return 'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#e8e8ed" rx="12"/><text x="100" y="100" text-anchor="middle" fill="#999" font-size="14" font-family="sans-serif">Imatge</text><text x="100" y="120" text-anchor="middle" fill="#999" font-size="14" font-family="sans-serif">no disponible</text></svg>');
}

var _imgPlaceholder = 'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#e8e8ed" rx="12"/><text x="100" y="100" text-anchor="middle" fill="#999" font-size="14" font-family="sans-serif">Imatge</text><text x="100" y="120" text-anchor="middle" fill="#999" font-size="14" font-family="sans-serif">no disponible</text></svg>');
function _handleImgError(img){
  img.onerror = null;
  // A la galeria, una foto que no carrega (p. ex. una foto de la web sense
  // connexió) es treu en lloc de deixar un forat, si n'hi ha d'altres.
  var track = img.closest ? img.closest('.gallery-track') : null;
  if(track && !_editMode){
    var slide = img.closest('.gallery-slide') || (img.parentNode === track ? img : null);
    var n = Array.prototype.filter.call(track.children, function(el){ return el.tagName === 'IMG' || el.classList.contains('gallery-slide'); }).length;
    if(slide && n > 1){ var gal = track.parentNode; slide.remove(); if(gal && gal._refresh) gal._refresh(); return; }
  }
  img.src = _imgPlaceholder;
}
// Els atributs onerror="_handleImgError(this)" s'executen fora d'aquest bloc
window._handleImgError = _handleImgError;

// ── Galeria de fotos (fitxa de producte i fitxa de grup) ──
// La pista (.gallery-track) és la que es desplaça; les fletxes i els punts
// queden fixos a sobre. Funciona amb el dit, amb les fletxes i amb els punts,
// i s'actualitza quan es canvia de model en una fitxa de grup.
function _initGallery(gal){
  if(!gal || !gal.firstElementChild) return;
  var track = gal.firstElementChild;
  track.classList.add('gallery-track');
  function mk(cls, label, txt){ var b = document.createElement('button'); b.className = cls; b.setAttribute('aria-label', label); b.textContent = txt; gal.appendChild(b); return b; }
  var prev = gal.querySelector('.gallery-prev') || mk('gallery-arrow gallery-prev', 'Anterior', '\u2039');
  var next = gal.querySelector('.gallery-next') || mk('gallery-arrow gallery-next', 'Següent', '\u203A');
  var dotsBox = gal.querySelector('.gallery-dots');
  if(!dotsBox){ dotsBox = document.createElement('div'); dotsBox.className = 'gallery-dots'; gal.appendChild(dotsBox); }
  dotsBox.innerHTML = '';
  function slides(){
    return Array.prototype.filter.call(track.children, function(el){
      return el.tagName === 'IMG' || el.tagName === 'IFRAME' || el.classList.contains('gallery-slide');
    });
  }
  function cur(){ var w = track.clientWidth || 1; return Math.round(track.scrollLeft / w); }
  function goTo(i, instant){
    var n = slides().length; if(!n) return;
    i = ((i % n) + n) % n;
    track.scrollTo({ left: i * track.clientWidth, behavior: instant ? 'auto' : 'smooth' });
    update(i);
  }
  function update(force){
    var n = slides().length;
    var c = force !== undefined ? force : Math.min(cur(), Math.max(0, n - 1));
    var show = n > 1;
    prev.style.display = next.style.display = show ? '' : 'none';
    dotsBox.style.display = show ? '' : 'none';
    if(dotsBox.children.length !== n){
      dotsBox.innerHTML = '';
      for(var d=0; d<n; d++){
        var b = document.createElement('button');
        b.className = 'gallery-dot'; b.setAttribute('aria-label', 'Imatge ' + (d+1));
        (function(k){ b.addEventListener('click', function(e){ e.stopPropagation(); goTo(k); }); })(d);
        dotsBox.appendChild(b);
      }
    }
    for(var k=0; k<dotsBox.children.length; k++) dotsBox.children[k].classList.toggle('active', k === c);
  }
  prev.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); goTo(cur() - 1); });
  next.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); goTo(cur() + 1); });
  var raf = 0;
  track.addEventListener('scroll', function(){ if(raf) return; raf = requestAnimationFrame(function(){ raf = 0; update(); }); });
  track.addEventListener('click', function(e){
    if(e.target.tagName !== 'IMG') return;
    var list = slides(), srcs = [], start = 0;
    list.forEach(function(el){
      var im = el.tagName === 'IMG' ? el : el.querySelector('img');
      if(!im) return;
      if(el === e.target || el.contains(e.target)) start = srcs.length;
      srcs.push(im.currentSrc || im.src);
    });
    if(srcs.length) _openLightbox(srcs, start);
  });
  window.addEventListener('resize', function(){ if(document.body.contains(gal)) goTo(cur(), true); });
  gal._goTo = goTo;
  gal._refresh = function(){ track.scrollLeft = 0; update(0); };
  update(0);
}

// Visor a pantalla completa: es passen les fotos amb el dit, les fletxes o el teclat
function _openLightbox(srcs, start){
  var n = srcs.length;
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  var h = '<button class="close" aria-label="Tancar">\u2715</button><div class="lb-track">';
  for(var i=0; i<n; i++) h += '<div class="lb-slide"><img src="'+escHtml(srcs[i])+'" alt=""></div>';
  h += '</div>';
  if(n > 1) h += '<button class="gallery-arrow gallery-prev" aria-label="Anterior">\u2039</button><button class="gallery-arrow gallery-next" aria-label="Següent">\u203A</button><div class="lb-count"></div>';
  lb.innerHTML = h;
  document.body.appendChild(lb);
  var track = lb.querySelector('.lb-track'), count = lb.querySelector('.lb-count');
  function cur(){ return Math.round(track.scrollLeft / (track.clientWidth || 1)); }
  function label(){ if(count) count.textContent = (Math.min(cur(), n-1) + 1) + ' / ' + n; }
  function goTo(i, instant){ i = ((i % n) + n) % n; track.scrollTo({ left: i * track.clientWidth, behavior: instant ? 'auto' : 'smooth' }); }
  function close(){ document.removeEventListener('keydown', onKey); lb.remove(); }
  function onKey(e){
    if(e.key === 'Escape') close();
    else if(e.key === 'ArrowLeft') goTo(cur() - 1);
    else if(e.key === 'ArrowRight') goTo(cur() + 1);
  }
  document.addEventListener('keydown', onKey);
  lb.querySelector('.close').addEventListener('click', function(e){ e.stopPropagation(); close(); });
  if(n > 1){
    lb.querySelector('.gallery-prev').addEventListener('click', function(e){ e.stopPropagation(); goTo(cur() - 1); });
    lb.querySelector('.gallery-next').addEventListener('click', function(e){ e.stopPropagation(); goTo(cur() + 1); });
  }
  track.addEventListener('click', function(e){ if(e.target.tagName !== 'IMG') close(); });
  track.addEventListener('scroll', label);
  requestAnimationFrame(function(){ goTo(start || 0, true); label(); });
}
function isVezzaniProduct(p){ return !!(p && p.fam === 'vezzani'); }
function isPortraitImgProduct(p){
  if(!p) return false;
  if(p.fam === 'vezzani') return true;
  var src = (p.imgs && p.imgs[0]) || p.i || '';
  return typeof src === 'string' && src.indexOf('imatges/') === 0;
}
function _isValidImg(s){
  return s && typeof s === 'string' && (s.indexOf('data:image/') === 0 || s.indexOf('http') === 0 || s.indexOf('imgs/') === 0 || s.indexOf('imatges/') === 0 || s.indexOf('vezzani_imgs/') === 0);
}

function getProductWorkType(p){
  var text = ((p.n||'')+' '+(p.s||'')+' '+(p.d||'')).toLowerCase();
  if(text.indexOf('inglet') > -1 || text.indexOf('junta') > -1 || text.indexOf('adhes') > -1) return 'Unió i muntatge';
  if(text.indexOf('pul') > -1 || text.indexOf('abrasi') > -1 || text.indexOf('brill') > -1) return 'Polit i acabat';
  if(text.indexOf('disco') > -1 || text.indexOf('corte') > -1 || text.indexOf('diamant') > -1) return 'Tall i desbast';
  if(text.indexOf('ventosa') > -1 || text.indexOf('manipul') > -1) return 'Manipulació';
  return 'Treball de taller';
}

function getProductToolHint(p){
  var text = ((p.n||'')+' '+(p.s||'')).toLowerCase();
  if(text.indexOf('disco') > -1 || text.indexOf('amoladora') > -1) return 'Amoladora o talladora';
  if(text.indexOf('corona') > -1 || text.indexOf('pulidora') > -1 || text.indexOf('lij') > -1) return 'Pulidora';
  if(text.indexOf('adhes') > -1 || text.indexOf('sellador') > -1 || text.indexOf('silicona') > -1) return 'Aplicador manual';
  if(text.indexOf('ventosa') > -1) return 'Manipulació manual';
  return 'Eina professional';
}

function getProductDifficulty(p){
  var text = ((p.n||'')+' '+(p.s||'')).toLowerCase();
  if(text.indexOf('cnc') > -1 || text.indexOf('inglet') > -1 || text.indexOf('diamant') > -1) return 'Professional';
  return 'Tècnic';
}

function showProduct(idx){
  var p = PRODS[idx];
  if(!p) { navigate('home'); return; }

  // If product belongs to a variant group, show the group page instead
  if(p.variantGroup){
    navigate('variant/'+p.variantGroup, null, _pages);
    return;
  }
  var vgId = getProductVariantGroupId(idx);
  if(vgId){
    navigate('variant/'+vgId, null, _pages);
    return;
  }

  // Remove existing
  var existing = document.getElementById('prodDetail');
  if(existing) existing.remove();

  var imgs = [];
  var overrideImgs = (_editOverrides[idx] && _editOverrides[idx].imgs) ? _editOverrides[idx].imgs : null;
  if(overrideImgs && overrideImgs.length > 0){
    for(var gi=0;gi<overrideImgs.length;gi++){
      var simg = overrideImgs[gi];
      if(_isValidImg(simg)) imgs.push(_imgSrc(simg) || _imgPlaceholder);
    }
  } else if(p.imgs && p.imgs.length > 0){
    for(var gi=0;gi<p.imgs.length;gi++){
      var simg = p.imgs[gi];
      if(_isValidImg(simg)) imgs.push(_imgSrc(simg) || _imgPlaceholder);
    }
  }
  if(!_editMode && imgs.length && imgs.every(function(x){ return x === _imgPlaceholder; })){ imgs = []; (p.imgs || []).forEach(function(x){ var u = _imgSrc(x); if(u) imgs.push(u); }); }
  if(imgs.length === 0 && _isValidImg(p.i)) imgs.push(_imgSrc(p.i) || _imgPlaceholder);
  if(imgs.length === 0) imgs.push(_imgPlaceholder);

  // Related
  var related = [];
  for(var i=0;i<PRODS.length;i++){
    if(i !== idx && (PRODS[i].cat === p.cat || PRODS[i].b === p.b)){
      related.push(i);
      if(related.length >= 10) break;
    }
  }

  var detail = document.createElement('div');
  detail.className = 'prod-detail';
  detail.id = 'prodDetail';

  var fit = 'contain'; // foto sencera, sense retallar
  var html = '<button class="close-btn" id="detailClose" aria-label="Tancar">✕</button>';
  html += '<div class="gallery" id="detailGallery"><div style="display:flex;height:100%">';
  for(var i=0;i<imgs.length;i++){
    html += '<div class="gallery-slide" data-gi="'+i+'" style="position:relative;flex-shrink:0;width:100%;height:100%">';
    html += '<img src="'+escHtml(imgs[i])+'" alt="" style="width:100%;height:100%;object-fit:'+fit+'" onerror="_handleImgError(this)">';
    if(_editMode) html += '<button class="gallery-img-del" data-gi="'+i+'" aria-label="Eliminar foto">✕</button>';
    html += '</div>';
  }
  if(p.video){
    html += '<iframe src="'+escHtml(p.video)+'" style="flex-shrink:0;width:100%;height:100%;border:none" allowfullscreen></iframe>';
  }
  html += '</div>';
  var totalSlides = imgs.length + (p.video ? 1 : 0);
  if(totalSlides > 1){
    html += '<button class="gallery-arrow gallery-prev" id="galleryPrev" aria-label="Anterior">‹</button>';
    html += '<button class="gallery-arrow gallery-next" id="galleryNext" aria-label="Següent">›</button>';
    html += '<div class="gallery-dots" id="galleryDots">';
    for(var d=0;d<totalSlides;d++){
      html += '<button class="gallery-dot'+(d===0?' active':'')+'" data-idx="'+d+'" aria-label="Imatge '+(d+1)+'"></button>';
    }
    html += '</div>';
  }
  if(_editMode){
    html += '<button class="gallery-add-photo" id="galleryAddPhoto" aria-label="Afegir foto">+ Foto</button>';
    html += '<input type="file" id="galleryFileInput" accept="image/*" capture="environment" style="display:none" multiple>';
  }
  html += '</div>';
  var compatible = p.aplic && p.aplic.length ? p.aplic.join(', ') : 'Consultar compatibilitat';
  var detailPrice = (_editOverrides[idx] && _editOverrides[idx].price !== undefined) ? _editOverrides[idx].price : (parseFloat(p.p)||0);
var _dName = (_editOverrides[idx] && _editOverrides[idx].name !== undefined) ? _editOverrides[idx].name : p.n;
  var _dBrand = (_editOverrides[idx] && _editOverrides[idx].brand !== undefined) ? _editOverrides[idx].brand : p.b;
  var _dRef = (_editOverrides[idx] && _editOverrides[idx].ref !== undefined) ? _editOverrides[idx].ref : p.r;
  html += '<div class="body"><div class="eyebrow'+(_editMode?' edit-text':'')+'"'+(_editMode?' contenteditable="true" data-field="brand" data-idx="'+idx+'"':'')+'>'+escHtml(_dBrand||'Producte professional')+'</div><div class="name'+(_editMode?' edit-text':'')+'"'+(_editMode?' contenteditable="true" data-field="name" data-idx="'+idx+'"':'')+'>'+(p.star?'<span class="star-badge-sm" title="Marge alt">★</span>':'')+escHtml(_dName||'')+'</div><div class="ref'+(_editMode?' edit-text':'')+'"'+(_editMode?' contenteditable="true" data-field="ref" data-idx="'+idx+'"':'')+'>Ref. '+escHtml(_dRef||'')+'</div><div class="price'+(_editMode?' edit-price':'')+'" id="detailPrice"'+(_editMode?' contenteditable="true" data-idx="'+idx+'"':'')+'>'+formatPrice(detailPrice)+'</div>';
  // Typeface size chips
  if(p.variants && p.variants.length > 0){
    html += '<div class="tf-sizes"><div class="tf-sizes-title">Tria la mida:</div><div class="tf-size-chips">';
    for(var vi=0;vi<p.variants.length;vi++){
      var v = p.variants[vi];
      var label = v.size || v.ref;
      html += '<button class="variant-chip'+(vi===0?' active':'')+'" data-vi="'+vi+'" data-ref="'+escHtml(v.ref)+'" data-price="'+escHtml(v.price)+'">'+escHtml(label)+'</button>';
    }
    html += '</div></div>';
  }
  if(p.insemacVariants && p.insemacVariants.length > 0){
    html += '<div class="insemac-variants"><label>Elige tu modelo:</label><select id="insemacVariantSelect">';
    for(var vi=0;vi<p.insemacVariants.length;vi++){
      html += '<option value="'+vi+'">'+(p.insemacVariants[vi].star?'★ ':'')+escHtml(p.insemacVariants[vi].label)+'</option>';
    }
    html += '</select></div>';
  }
  if(_editMode){ html += '<button type="button" class="edit-variants-btn" id="editVariantsBtn">\u270F\uFE0F '+((p.insemacVariants && p.insemacVariants.length) ? 'Editar mides i preus' : 'Afegir mides amb preu')+'</button>'; }
  html += '<button class="add-order-btn" id="addOrderBtn">➕ Afegir al pedido</button><button class="add-list-btn" id="addListBtn">📋 Afegir a llista</button><div class="advisor-meta"><div><span>Material</span><strong>'+escHtml(compatible)+'</strong></div><div><span>Treball</span><strong>'+escHtml(getProductWorkType(p))+'</strong></div><div><span>Nivell</span><strong>'+escHtml(getProductDifficulty(p))+'</strong></div></div><div class="product-panel"><div class="eyebrow">Per a què serveix</div><div class="desc'+(_editMode?' edit-text':'')+'"'+(_editMode?' contenteditable="true" data-field="desc" data-idx="'+idx+'"':'')+'>'+escHtml((_editOverrides[idx]&&_editOverrides[idx].desc!==undefined?_editOverrides[idx].desc:p.d)||'Informació disponible pròximament.')+'</div></div>';
  if(p.specs && p.specs.length > 0){
    html += '<div class="product-panel"><div class="eyebrow">Fitxa tècnica</div><div class="specs-grid">';
    for(var si=0;si<p.specs.length;si++){
      var spec = p.specs[si];
      if(spec.isModel){
        html += '<div class="spec-model"><div class="spec-model-name">'+escHtml(spec.label)+'</div><div class="spec-model-value">'+escHtml(spec.value)+'</div></div>';
      } else {
        html += '<div class="spec-item"><span class="spec-label">'+escHtml(spec.label)+'</span><span class="spec-value">'+escHtml(spec.value)+'</span></div>';
      }
    }
    html += '</div></div>';
  }
  html += '<div class="product-panel"><div class="eyebrow">Eina necessària</div><div class="desc">'+escHtml(getProductToolHint(p))+'</div></div>'+buildKnowledgePanel(idx)+'</div>';
  if(p.aplic && p.aplic.length > 0){
    html += '<div class="eyebrow">Materials i aplicacions</div><div class="tags">';
    for(var i=0;i<p.aplic.length;i++) html += '<span class="tag">'+escHtml(p.aplic[i])+'</span>';
    html += '</div>';
  }
  if(p.u) html += '<a class="product-source" href="'+escHtml(p.u)+'" target="_blank" rel="noopener">Veure informació del producte ↗</a>';
  if(related.length > 0){
    html += '<div class="section-title">Productes complementaris</div><div class="rel-scroll">';
    for(var i=0;i<related.length;i++){
      var rp = PRODS[related[i]];
      html += '<div class="rel-card" data-idx="'+related[i]+'"><img src="'+escHtml(getImgSrc(rp))+'" alt="" loading="lazy"><div class="info"><div class="name">'+escHtml(rp.n||'')+'</div><div class="brand">'+escHtml(rp.b||'')+'</div></div></div>';
    }
    html += '</div>';
  }
  html += '</div>';
  detail.innerHTML = html;
  document.body.appendChild(detail);

  // Events
  detail.querySelector('#detailClose').addEventListener('click', restoreReturnContext);
  
  // Edit mode: make detail price editable
  var detailPriceEl = detail.querySelector('#detailPrice');
  if(detailPriceEl && _editMode){
    detailPriceEl.setAttribute('contenteditable', 'true');
    detailPriceEl.setAttribute('data-idx', idx);
    detailPriceEl.style.cursor = 'pointer';
    detailPriceEl.style.border = '1.5px dashed #ff6b35';
    detailPriceEl.style.borderRadius = '8px';
    detailPriceEl.style.padding = '4px 10px';
    detailPriceEl.addEventListener('blur', function(){
      var val = parseFloat(this.textContent.replace(/[^\d.,]/g, '').replace(',', '.'));
      if(!isNaN(val)){
        _editOverrides[idx] = _editOverrides[idx] || {};
        // Save per-variant if dropdown is present
        var vs = detail.querySelector('#insemacVariantSelect');
        if(vs && p.insemacVariants){
          _editOverrides[idx].variantPrices = _editOverrides[idx].variantPrices || {};
          _editOverrides[idx].variantPrices[parseInt(vs.value)] = val;
        }
        _editOverrides[idx].price = val;
        _saveEditOverrides();
        this.textContent = formatPrice(val);
      } else {
        this.textContent = formatPrice(PRODS[idx]._origPrice || parseFloat(PRODS[idx].p)||0);
      }
    });
    detailPriceEl.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ e.preventDefault(); this.blur(); } });
    // Text field overrides: name, brand, ref, desc
    detail.querySelectorAll('.edit-text').forEach(function(el){
      el.addEventListener('blur', function(){
        var field = el.getAttribute('data-field');
        var pIdx = parseInt(el.getAttribute('data-idx'));
        if(!field || isNaN(pIdx)) return;
        var val = el.textContent.trim();
        _editOverrides[pIdx] = _editOverrides[pIdx] || {};
        if(field === 'name') _editOverrides[pIdx].name = val;
        else if(field === 'brand') _editOverrides[pIdx].brand = val;
        else if(field === 'ref') _editOverrides[pIdx].ref = val;
        else if(field === 'desc') _editOverrides[pIdx].desc = val;
        _saveEditOverrides();
      });
      el.addEventListener('keydown', function(e){ if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); this.blur(); } });
    });
  }

  // Edit mode: delete product directly from the detail sheet
  if(_editMode){
    var detailDelBtn = document.createElement('button');
    detailDelBtn.type = 'button';
    detailDelBtn.id = 'detailDeleteBtn';
    detailDelBtn.textContent = '\u2715 Eliminar';
    detailDelBtn.style.cssText = 'position:absolute;top:16px;right:16px;z-index:10;background:rgba(255,59,48,.92);color:#fff;border:none;border-radius:24px;padding:12px 18px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25)';
    detailDelBtn.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      _editOverrides[idx] = _editOverrides[idx] || {};
      _editOverrides[idx].deleted = true;
      _saveEditOverrides();
      var _pd = document.getElementById('prodDetail');
      if(_pd) _pd.remove();
      _returnCtx = null;
      navigate('home', null, _pages, true);
    });
    detail.appendChild(detailDelBtn);
  }
  
  // Gallery navigation
  _initGallery(detail.querySelector('#detailGallery'));

  // Edit mode: gallery image delete buttons
  if(_editMode){
    var delBtns = detail.querySelectorAll('.gallery-img-del');
    delBtns.forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        var gi = parseInt(btn.getAttribute('data-gi'));
        var overrideImgs = (_editOverrides[idx] && _editOverrides[idx].imgs) ? _editOverrides[idx].imgs.slice() : imgs.slice();
        if(gi >= 0 && gi < overrideImgs.length){
          overrideImgs.splice(gi, 1);
          if(overrideImgs.length === 0) overrideImgs.push(_imgPlaceholder);
          _editOverrides[idx] = _editOverrides[idx] || {};
          _editOverrides[idx].imgs = overrideImgs;
          _saveEditOverrides();
          // Re-render gallery
          var pd = document.getElementById('prodDetail');
          if(pd) pd.remove();
          showProduct(idx);
          // Jump back to same slide or last
          var newGallery = document.getElementById('detailGallery');
          if(newGallery){
            var newSlides = newGallery.querySelectorAll('.gallery-slide, iframe');
            var target = gi >= newSlides.length ? newSlides.length - 1 : gi;
            if(target >= 0 && newGallery._goTo) newGallery._goTo(target, true);
          }
        }
      });
    });
    // Add photo button
    var addPhotoBtn = detail.querySelector('#galleryAddPhoto');
    var fileInput = detail.querySelector('#galleryFileInput');
    if(addPhotoBtn && fileInput){
      addPhotoBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
      });
      fileInput.addEventListener('change', function(e){
        var files = e.target.files;
        if(!files || files.length === 0) return;
        var overrideImgs = (_editOverrides[idx] && _editOverrides[idx].imgs) ? _editOverrides[idx].imgs.slice() : imgs.slice();
        // Remove placeholder if present
        if(overrideImgs.length === 1 && overrideImgs[0] === _imgPlaceholder) overrideImgs = [];
        var processed = 0;
        var total = files.length;
        for(var fi=0;fi<files.length;fi++){
          (function(file){
            var reader = new FileReader();
            reader.onload = function(ev){
              // Compress: resize to max 800px, JPEG 0.7
              var img = new Image();
              img.onload = function(){
                var canvas = document.createElement('canvas');
                var maxW = 800, maxH = 800;
                var w = img.naturalWidth, h = img.naturalHeight;
                if(w > maxW || h > maxH){
                  var ratio = Math.min(maxW/w, maxH/h);
                  w = Math.round(w*ratio);
                  h = Math.round(h*ratio);
                }
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                var compressed = canvas.toDataURL('image/jpeg', 0.7);
                overrideImgs.push(compressed);
                processed++;
                if(processed === total){
                  _editOverrides[idx] = _editOverrides[idx] || {};
                  _editOverrides[idx].imgs = overrideImgs;
                  _saveEditOverrides();
                  var pd = document.getElementById('prodDetail');
                  if(pd) pd.remove();
                  showProduct(idx);
                }
              };
              img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
          })(files[fi]);
        }
      });
    }
  }

  
  detail.querySelectorAll('.rel-card').forEach(function(c){
    c.addEventListener('click', function(){
      detail.remove();
      navigate('product/'+parseInt(c.getAttribute('data-idx')), null, _pages);
    });
  });
  var evBtn = detail.querySelector('#editVariantsBtn');
  if(evBtn) evBtn.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); _openVariantsEditor(idx); });
  var addBtn = detail.querySelector('#addOrderBtn');
  if(addBtn) addBtn.addEventListener('click', function(){
    var variantLabel = null;
    var variantPrice = null;
    // Check tf-size-chips (typeface/KGS variants)
    var selTf = detail._selectedTfVariant;
    if(selTf && p.variants && p.variants.length > 0){
      variantLabel = selTf.ref + ' · ' + selTf.size;
      variantPrice = parseFloat(selTf.price) || null;
    }
    // Check insemacVariants dropdown
    var vs = detail.querySelector('#insemacVariantSelect');
    if(!variantLabel && vs && p.insemacVariants){
      var selectedIdx = parseInt(vs.value);
      if(selectedIdx >= 0 && selectedIdx < p.insemacVariants.length){
        variantLabel = p.insemacVariants[selectedIdx].label;
        if(_editOverrides[idx] && _editOverrides[idx].variantPrices && _editOverrides[idx].variantPrices[selectedIdx] !== undefined){
          variantPrice = _editOverrides[idx].variantPrices[selectedIdx];
        } else {
          variantPrice = p.insemacVariants[selectedIdx].price;
        }
      }
    }
    showAddModal(idx, variantLabel, variantPrice);
  });
  var listBtn = detail.querySelector('#addListBtn');
  if(listBtn) listBtn.addEventListener('click', function(){ showAddToListPicker(idx); });
  var variantSelect = detail.querySelector('#insemacVariantSelect');
  if(variantSelect && p.insemacVariants){
    variantSelect.addEventListener('change', function(){
      var selectedIdx = parseInt(variantSelect.value);
      if(selectedIdx >= 0 && selectedIdx < p.insemacVariants.length){
        // Check per-variant override first, then original price
        var vp;
        if(_editOverrides[idx] && _editOverrides[idx].variantPrices && _editOverrides[idx].variantPrices[selectedIdx] !== undefined){
          vp = _editOverrides[idx].variantPrices[selectedIdx];
        } else {
          vp = p.insemacVariants[selectedIdx].price;
        }
        if(vp !== undefined){
          var priceEl = detail.querySelector('.prod-detail .price');
          if(priceEl) priceEl.textContent = formatPrice(vp);
        }
      }
    });
  }
  // Typeface size chips events
  var tfChips = detail.querySelectorAll('.tf-size-chips .variant-chip');
  if(tfChips.length > 0 && p.variants){
    detail._selectedTfVariant = p.variants[0]; // default to first
    tfChips.forEach(function(chip){
      chip.addEventListener('click', function(){
        tfChips.forEach(function(c){ c.classList.remove('active'); });
        chip.classList.add('active');
        var vi = parseInt(chip.getAttribute('data-vi'));
        if(p.variants[vi]){
          detail._selectedTfVariant = p.variants[vi];
          var priceEl = detail.querySelector('#detailPrice');
          var priceNum = parseFloat(p.variants[vi].price);
          if(priceEl) priceEl.textContent = isNaN(priceNum) ? p.variants[vi].price : formatPrice(priceNum);
          var refEl = detail.querySelector('.prod-detail .ref');
          if(refEl) refEl.textContent = 'Ref. ' + p.variants[vi].ref;
        }
      });
    });
    // Override add-to-list to use selected variant
    var listBtnTf = detail.querySelector('#addListBtn');
    if(listBtnTf){
      var origListHandler = listBtnTf.onclick;
      listBtnTf.removeEventListener('click', arguments.callee);
      var newListBtn = listBtnTf.cloneNode(true);
      listBtnTf.parentNode.replaceChild(newListBtn, listBtnTf);
      newListBtn.addEventListener('click', function(){
        var sel = detail._selectedTfVariant;
        if(sel && p.variants && p.variants.length > 0){
          // Find PRODS index of the variant ref, or use parent idx with variant info
          var variantIdx = -1;
          for(var pi=0;pi<PRODS.length;pi++){
            if(PRODS[pi].r === sel.ref){ variantIdx = pi; break; }
          }
          if(variantIdx > -1){
            showAddToListPicker(variantIdx);
          } else {
            // Variant not in PRODS, add parent with variant label
            showAddToListPicker(idx);
          }
        } else {
          showAddToListPicker(idx);
        }
      });
    }
  }
}

function onSearchInput(q, resultsContainer){
  if(q.length < 2){
    resultsContainer.innerHTML = '<div class="search-empty"><div class="icon">🔍</div>Cerca productes, marques o referències</div>';
    return;
  }
  q = q.toLowerCase();
  var terms = q.split(/\s+/);
  var results = [];
  for(var i=0;i<searchIdx.length;i++){
    var si = searchIdx[i];
    var match = true;
    for(var t=0;t<terms.length;t++){
      if(si.txt.indexOf(terms[t]) === -1){ match = false; break; }
    }
    if(match) results.push(si.idx);
    if(results.length >= 50) break;
  }
  renderSearchResults(results, q, resultsContainer, getAdvisorIntent(q));
}

function renderSearchResults(indices, q, container, adviceId){
  if(indices.length === 0){
    container.innerHTML = '<div class="search-empty"><div class="icon">😕</div>No s\'han trobat resultats</div>';
    return;
  }
  var html = '';
  if(adviceId){
    var advice = null; for(var a=0;a<ADVISOR_CASES.length;a++) if(ADVISOR_CASES[a].id === adviceId) advice = ADVISOR_CASES[a];
    if(advice) html += '<button class="advisor-search-card" data-advice="'+advice.id+'"><strong>✦ Veure kit: '+advice.title+'</strong><span>Disc, eines i productes complementaris</span></button>';
  }
  for(var i=0;i<indices.length;i++){
    var p = PRODS[indices[i]];
    if(!p) continue;
    var name = escHtml(p.n||'');
    var sub = escHtml([p.b,p.r].filter(Boolean).join(' · '));
    var re = new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').split(/\s+/).join('|')+')','gi');
    name = name.replace(re, '<mark style="background:var(--accent);color:#fff;border-radius:2px;padding:0 2px">$1</mark>');
    html += '<div class="search-result-item" data-idx="'+indices[i]+'"><img src="'+escHtml(getImgSrc(p))+'" alt="" loading="lazy" onerror="_handleImgError(this)"><div class="info"><div class="name">'+(p.star?'<span class="star-badge-sm" title="Marge alt">★</span>':'')+name+'</div><div class="sub">'+sub+'</div><div class="price">'+formatPrice(parseFloat(p.p)||0)+'</div></div></div>';
  }
  container.innerHTML = html;
  var advisorButton = container.querySelector('.advisor-search-card');
  if(advisorButton) advisorButton.addEventListener('click', function(){ closeSearch(); navigate('advisor', null, _pages); showAdvisorCase(this.getAttribute('data-advice'), _pages); });
}

// Advisor intent detection (stub — expand with keyword matching)
var ADVISOR_CASES = [];
function getAdvisorIntent(q){
  return null;
}

function openSearch(initialQuery){
  var overlay = document.getElementById('searchOverlay');
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  overlay.hidden = false;
  overlay.style.display = 'flex';
  input.value = initialQuery || '';
  input.focus();
  if(initialQuery) onSearchInput(initialQuery, results);
  else results.innerHTML = '<div class="search-empty"><div class="icon">🔍</div>Cerca productes, marques o referències</div>';
}

function closeSearch(){
  var overlay = document.getElementById('searchOverlay');
  if(overlay){
    overlay.hidden = true;
    overlay.style.display = 'none';
  }
  var input = document.getElementById('searchInput');
  if(input) input.value = '';
  // Safety: ensure some page is visible
  var anyActive = document.querySelector('.page.active');
  if(!anyActive) navigate('home', null, _pages, true);
}

/* ── SISTEMA DE LLISTES PERSONALITZADES ── */
function saveListsLocal(){
  localStorage.setItem(LISTS_KEY, JSON.stringify(customLists));
}

function saveLists(){
  saveListsLocal();
  syncListsToFirebase();
}

function getDefaultList(){
  return customLists.length ? customLists[0] : null;
}

function getListById(id){
  for(var i=0;i<customLists.length;i++) if(customLists[i].id === id) return customLists[i];
  return null;
}

function toggleDefaultList(idx, btn){
  var list = getDefaultList();
  if(!list) return;
  var pos = -1;
  for(var i=0;i<list.items.length;i++) if(list.items[i] === idx){ pos=i; break; }
  if(pos > -1){
    list.items.splice(pos, 1);
    if(btn){ btn.textContent = '🤍'; btn.classList.remove('active'); }
  }else{
    list.items.push(idx);
    if(btn){ btn.textContent = '❤️'; btn.classList.add('active'); }
  }
  saveLists();
}

function addToList(listId, productIdx){
  var list = getListById(listId);
  if(!list) return;
  if(list.items.indexOf(productIdx) > -1) return;
  list.items.push(productIdx);
  saveLists();
  if(listId === '_recomanats') refreshRecomanats();
}

function removeFromList(listId, productIdx){
  var list = getListById(listId);
  if(!list) return;
  var pos = -1;
  for(var i=0;i<list.items.length;i++) if(list.items[i] === productIdx){ pos=i; break; }
  if(pos > -1){ list.items.splice(pos,1); saveLists(); if(listId === '_recomanats') refreshRecomanats(); }
}

function createList(name, icon){
  var id = 'list_' + Date.now() + '_' + Math.random().toString(36).substr(2,4);
  customLists.push({id:id, name:name, icon:icon||'📋', items:[], builtin:false});
  saveLists();
  return id;
}

function deleteList(listId){
  for(var i=0;i<customLists.length;i++){
    if(customLists[i].id === listId && !customLists[i].builtin){
      customLists.splice(i,1); saveLists(); return true;
    }
  }
  return false;
}

var LIST_ICONS = ['⭐','🔥','🏆','💎','🎯','🏗️','🛠️','🔧','⚙️','🧰','📦','🏛️','🍳','🪟','🚪','🔩','🧲','🪚','🔨','🎨'];

function showLists(pages){
  pages.lists.classList.add('active');
  var html = '<div style="padding:6px 0 4px"><div class="section-title">Les meves llistes</div></div><div class="lists-grid">';
  for(var i=0;i<customLists.length;i++){
    var l = customLists[i];
    var count = l.items.length;
    var builtinLabel = l.builtin ? '<span class="badge-builtin">Per defecte</span>' : '';
    html += '<button class="list-card" data-list="'+l.id+'">'+builtinLabel+'<span class="icon">'+l.icon+'</span><span class="name">'+escHtml(l.name)+'</span><span class="count">'+count+' producte'+(count!==1?'s':'')+'</span></button>';
  }
  html += '<button class="list-card create-card" id="createListCard"><span class="icon">➕</span><span class="name">Nova llista</span></button>';
  html += '</div>';
  pages.lists.innerHTML = html;

  pages.lists.querySelectorAll('.list-card[data-list]').forEach(function(card){
    card.addEventListener('click', function(){
      var listId = this.getAttribute('data-list');
      navigate('list/'+listId, null, pages);
    });
  });
  var createBtn = pages.lists.querySelector('#createListCard');
  if(createBtn) createBtn.addEventListener('click', openCreateListModal);
}

function showListDetail(listId, pages){
  pages.listDetail.classList.add('active');
  var list = getListById(listId);
  if(!list){
    pages.listDetailGrid.innerHTML = '<div class="empty-state"><div class="icon">😕</div><div class="title">Llista no trobada</div></div>';
    return;
  }
  // Update header
  var ht = document.querySelector('.header-title');
  if(ht) ht.textContent = list.icon+' '+list.name;

  var prods = [];
  for(var i=0;i<list.items.length;i++){
    if(PRODS[list.items[i]]) prods.push(PRODS[list.items[i]]);
  }

  if(prods.length === 0){
    pages.listDetailGrid.innerHTML = '<div class="empty-state"><div class="icon">'+list.icon+'</div><div class="title">Llista buida</div><div style="font-size:13px;color:rgba(29,29,31,.45);margin-top:4px">Afegeix productes des de la fitxa de cada producte</div></div>';
  }else{
    renderProductGrid(pages.listDetailGrid, prods, pages);
  }

  // List action bar
  var actionBar = document.createElement('div');
  actionBar.className = 'filter-bar';
  actionBar.style.padding = '8px 0 16px';
  if(!list.builtin){
    var delBtn = document.createElement('button');
    delBtn.className = 'filter-chip';
    delBtn.textContent = '🗑️ Eliminar llista';
    delBtn.addEventListener('click', function(){
      if(confirm('Eliminar la llista «'+list.name+'»?')){
        deleteList(list.id);
        navigate('lists', null, pages);
      }
    });
    actionBar.appendChild(delBtn);
  }
  if(prods.length > 0){
    var shareBtn = document.createElement('button');
    shareBtn.className = 'filter-chip';
    shareBtn.textContent = '📤 Compartir llista';
    shareBtn.addEventListener('click', function(){ shareList(list); });
    actionBar.appendChild(shareBtn);
  }
  pages.listDetail.appendChild(actionBar);
}

function openCreateListModal(){
  var modal = document.getElementById('createListModal');
  if(!modal) return;
  modal.hidden = false;
  var nameInput = document.getElementById('createListName');
  var picker = document.getElementById('iconPicker');
  if(nameInput) nameInput.value = '';
  if(picker){
    picker.innerHTML = '';
    var selected = '⭐';
    for(var i=0;i<LIST_ICONS.length;i++){
      (function(ic){
        var btn = document.createElement('button');
        btn.textContent = ic;
        btn.className = ic === selected ? 'selected' : '';
        btn.addEventListener('click', function(){
          picker.querySelectorAll('button').forEach(function(b){ b.classList.remove('selected'); });
          btn.classList.add('selected');
          selected = ic;
        });
        picker.appendChild(btn);
      })(LIST_ICONS[i]);
    }
  }

  var confirmBtn = document.getElementById('createListConfirm');
  if(confirmBtn){
    var newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
    newBtn.addEventListener('click', function(){
      var name = nameInput ? nameInput.value.trim() : '';
      if(!name) return;
      createList(name, selected);
      modal.hidden = true;
      var pages = _pages;
      if(pages && pages.lists) showLists(pages);
    });
  }

  var closeBtn = document.getElementById('createListClose');
  if(closeBtn){
    var newClose = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newClose, closeBtn);
    newClose.addEventListener('click', function(){ modal.hidden = true; });
  }
  modal.addEventListener('click', function(e){ if(e.target === modal) modal.hidden = true; });
}

function showAddToListPicker(productIdx){
  var modal = document.getElementById('listPicker');
  var body = document.getElementById('listPickerBody');
  if(!modal || !body) return;
  modal.hidden = false;
  body.innerHTML = '';
  for(var i=0;i<customLists.length;i++){
    (function(list, idx){
      var isIn = list.items.indexOf(productIdx) > -1;
      var item = document.createElement('div');
      item.className = 'list-picker-item';
      item.innerHTML = '<span class="li">'+list.icon+'</span><div class="info"><div class="name">'+escHtml(list.name)+'</div><div class="sub">'+list.items.length+' productes</div></div><span class="check'+(isIn?' on':'')+'">'+(isIn?'✓':'')+'</span>';
      item.addEventListener('click', function(){
        if(isIn){
          removeFromList(list.id, productIdx);
        }else{
          addToList(list.id, productIdx);
        }
        modal.hidden = true;
      });
      body.appendChild(item);
    })(customLists[i], i);
  }

  var closeBtn = document.getElementById('listPickerClose');
  if(closeBtn){
    var newClose = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newClose, closeBtn);
    newClose.addEventListener('click', function(){ modal.hidden = true; });
  }

  var newBtn = document.getElementById('listPickerNew');
  if(newBtn){
    var newNewBtn = newBtn.cloneNode(true);
    newBtn.parentNode.replaceChild(newNewBtn, newBtn);
    newNewBtn.addEventListener('click', function(){
      modal.hidden = true;
      openCreateListModal();
    });
  }

  modal.addEventListener('click', function(e){ if(e.target === modal) modal.hidden = true; });
}

function shareList(list){
  if(!list || list.items.length === 0) return;
  var lines = [];
  lines.push(list.icon+' *'+list.name+'*');
  lines.push('━'.repeat(30));
  lines.push('');
  for(var i=0;i<list.items.length;i++){
    var p = PRODS[list.items[i]];
    if(!p) continue;
    lines.push('▸ *'+escHtml(p.n||'')+'*');
    var info = 'Ref: '+(p.r||'');
    if(p.p) info += '  |  '+formatPrice(parseFloat(p.p));
    lines.push('  '+info);
    lines.push('');
  }
  lines.push('Generat amb Nexe Catàleg');
  var text = lines.join('\n');

  if(navigator.share){
    navigator.share({title:list.name, text:text}).catch(function(){});
  } else {
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try{ document.execCommand('copy'); }catch(e){}
    document.body.removeChild(ta);
    var wa = 'https://wa.me/?text='+encodeURIComponent(text);
    window.open(wa, '_blank');
  }
}

function showSettings(pages){
  pages.settings.classList.add('active');
}

function togglePresentation(){
  presentation = !presentation;
  localStorage.setItem(PRES_KEY, presentation ? '1' : '0');
  document.body.classList.toggle('presentation', presentation);
  var btn = document.getElementById('togglePresentation');
  if(btn) btn.classList.toggle('on', presentation);
  var topBtn = document.getElementById('togglePresentationTop');
  if(topBtn){
    topBtn.textContent = presentation ? '☀️' : '🌙';
    topBtn.style.color = presentation ? '#ff6b35' : '';
    topBtn.setAttribute('aria-label', presentation ? 'Tema clar' : 'Tema fosc');
    topBtn.setAttribute('title', presentation ? 'Tema clar' : 'Tema fosc');
  }
}

/* ── SISTEMA DE PEDIDOS ── */
var orderItems = [];
var orderNotes = '';
var orderClientId = null;
var orderClientName = '';

function loadOrder(){
  try{ orderItems = JSON.parse(localStorage.getItem('nexe_order')) || []; }catch(e){ orderItems = []; }
  try{ orderNotes = localStorage.getItem('nexe_order_notes') || ''; }catch(e){ orderNotes = ''; }
  try{ var c = JSON.parse(localStorage.getItem('nexe_order_client')); if(c){ orderClientId = c.id; orderClientName = c.nom || c.name; } }catch(e){}
}

function saveOrder(){
  localStorage.setItem('nexe_order', JSON.stringify(orderItems));
  localStorage.setItem('nexe_order_notes', orderNotes);
  if(orderClientId) localStorage.setItem('nexe_order_client', JSON.stringify({id:orderClientId, name:orderClientName}));
  else localStorage.removeItem('nexe_order_client');
  updateOrderBadge();
  updateCartBar();
}

function updateOrderBadge(){
  var badge = document.getElementById('orderBadge');
  if(!badge) return;
  var count = orderItems.reduce(function(s,i){ return s+i.qty; }, 0);
  badge.textContent = count || '';
  badge.classList.toggle('show', count > 0);
}

function getOrderTotal(){
  var total = 0;
  for(var i=0;i<orderItems.length;i++){
    var p = PRODS[orderItems[i].idx];
    if(!p) continue;
    total += (orderItems[i].price || (parseFloat(p.p)||0)) * orderItems[i].qty;
  }
  return total;
}

function formatPrice(v){ return v.toFixed(2).replace('.',',')+' €'; }
// basePrice = product.p (sale price).
// Future: getEffectivePrice(product, client) applies tariff rules using client.tarifa
function getEffectivePrice(product, client){
  // For now, base price only. Later: product + client.tarifa → tariff-based price
  return parseFloat(product.p) || 0;
}

function initCartBar(){
  if(document.getElementById('cartBar')) return;
  var bar = document.createElement('div');
  bar.className = 'cart-bar';
  bar.id = 'cartBar';
  bar.hidden = true;
  bar.innerHTML = '<div class="cart-bar-left"><span class="cart-bar-icon">🛒</span><span class="cart-bar-count" id="cartBarCount">0</span><span class="cart-bar-client" id="cartBarClient"></span><span class="cart-bar-total" id="cartBarTotal">0,00 €</span></div><button class="cart-bar-btn" id="cartBarBtn">Veure pedido →</button>';
  document.body.appendChild(bar);
  document.getElementById('cartBarBtn').addEventListener('click', openOrderPanel);
  updateCartBar();
}

function updateCartBar(){
  var bar = document.getElementById('cartBar');
  if(!bar) return;
  var count = orderItems.reduce(function(s,i){ return s+i.qty; }, 0);
  var total = getOrderTotal();
  document.getElementById('cartBarCount').textContent = count;
  document.getElementById('cartBarTotal').textContent = formatPrice(total);
  var clientEl = document.getElementById('cartBarClient');
  if(clientEl) clientEl.textContent = orderClientId && orderClientName ? orderClientName : '';
  if(count > 0){
    bar.hidden = false;
    void bar.offsetHeight;
    bar.style.transform = '';
    bar.style.opacity = '';
  }else{
    bar.style.transform = 'translateY(80px)';
    bar.style.opacity = '0';
    clearTimeout(bar._hideTimer);
    bar._hideTimer = setTimeout(function(){ bar.hidden = true; }, 300);
  }
}

function showAddToast(msg){
  var toast = document.getElementById('addToast');
  if(!toast){
    toast = document.createElement('div');
    toast.className = 'add-toast';
    toast.id = 'addToast';
    document.body.appendChild(toast);
  }
  toast.textContent = '✓ ' + (msg || 'Afegit al pedido');
  toast.classList.add('show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(function(){ toast.classList.remove('show'); }, 1800);
}

function getVariantLabel(selectedOpts, def){
  if(!def) return null;
  if(def.autoDetected){
    if(selectedOpts._idx !== undefined && def.members){
      var mi = parseInt(selectedOpts._idx);
      if(mi >= 0 && mi < def.members.length){
        var ml = getVariantMemberLabel(def.members[mi], def);
        if(ml && def.variantAttrLabel) return def.variantAttrLabel + ': ' + ml;
        return ml;
      }
    }
    return null;
  }
  if(!def.options) return null;
  var parts = [];
  for(var oi=0;oi<def.options.length;oi++){
    var opt = def.options[oi];
    var valId = selectedOpts[opt.id];
    if(valId && opt.values){
      for(var vi=0;vi<opt.values.length;vi++){
        if(opt.values[vi].id === valId){
          parts.push(opt.label + ': ' + opt.values[vi].label);
          break;
        }
      }
    }
  }
  return parts.join(', ') || null;
}

function showAddModal(idx, variantLabel, variantPrice){
  var p = PRODS[idx];
  if(!p) return;
  var modal = document.getElementById('addModal');
  var title = document.getElementById('addModalTitle');
  var productInfo = document.getElementById('addModalProduct');
  var qtyInput = document.getElementById('addQty');
  var notesInput = document.getElementById('addNotes');
  var confirmBtn = document.getElementById('addConfirm');
  if(!modal) return;

  title.textContent = p.n ? p.n.substring(0,60) : 'Afegir al pedido';
  productInfo.innerHTML = '<img src="'+escHtml(getImgSrc(p))+'" alt="" onerror="_handleImgError(this)"><div class="info"><div class="name">'+escHtml(p.n||'')+'</div><div class="ref">'+escHtml(p.r||'')+'</div></div>';
  if(variantLabel) productInfo.innerHTML += '<div class="order-item-variant" style="margin-top:6px">'+escHtml(variantLabel)+'</div>';
  if(variantPrice !== null && variantPrice !== undefined) productInfo.innerHTML += '<div class="order-item-variant-price" style="margin-top:4px;font-size:14px;font-weight:600;color:#ff6b35">'+formatPrice(variantPrice)+'</div>';
  qtyInput.value = 1;
  notesInput.value = '';
  modal.hidden = false;

  var newConfirm = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
  newConfirm.addEventListener('click', function(){
    var qty = parseInt(qtyInput.value) || 1;
    if(qty < 1) qty = 1;
    var notes = notesInput.value.trim();
    var vLabel = variantLabel || null;
    var found = false;
    for(var i=0;i<orderItems.length;i++){
      if(orderItems[i].idx === idx && orderItems[i].variantLabel === vLabel){
        orderItems[i].qty += qty;
        if(notes) orderItems[i].notes = notes;
        found = true;
        break;
      }
    }
    if(!found) orderItems.push({idx:idx, qty:qty, notes:notes, price:variantPrice !== null ? variantPrice : (parseFloat(p.p)||0), variantLabel:vLabel});
    saveOrder();
    modal.hidden = true;
    showAddToast(variantLabel || null);
  });

  var minus = document.getElementById('addQtyMinus');
  var plus = document.getElementById('addQtyPlus');
  var close = document.getElementById('addModalClose');

  var newMinus = minus.cloneNode(true); minus.parentNode.replaceChild(newMinus, minus);
  var newPlus = plus.cloneNode(true); plus.parentNode.replaceChild(newPlus, plus);
  var newClose = close.cloneNode(true); close.parentNode.replaceChild(newClose, close);

  newMinus.addEventListener('click', function(){ var v = parseInt(qtyInput.value)||1; if(v>1) qtyInput.value = v-1; });
  newPlus.addEventListener('click', function(){ var v = parseInt(qtyInput.value)||1; qtyInput.value = v+1; });
  newClose.addEventListener('click', function(){ modal.hidden = true; });
  modal.addEventListener('click', function(e){ if(e.target === modal) modal.hidden = true; });
}

function renderOrderPanel(){
  var body = document.getElementById('orderPanelBody');
  var footer = document.getElementById('orderPanelFooter');
  var totalEl = document.getElementById('orderTotal');
  var notesEl = document.getElementById('orderNotes');
  if(!body) return;

  // Update client info
  var clientNameEl = document.getElementById('orderPanelClientName');
  if(clientNameEl) clientNameEl.textContent = orderClientId && orderClientName ? orderClientName : '—';
  var shipAddrEl = document.getElementById('orderPanelClientAddress');
  if(!shipAddrEl){
    shipAddrEl = document.createElement('div');
    shipAddrEl.id = 'orderPanelClientAddress';
    shipAddrEl.className = 'order-panel-client-address';
    var pc = document.getElementById('orderPanelClient');
    if(pc) pc.parentNode.insertBefore(shipAddrEl, pc.nextSibling);
  }
  var shipText = '';
  if(orderClientId){
    var c = getClient(orderClientId);
    if(c) shipText = getClientShippingAddress(c);
  }
  shipAddrEl.textContent = shipText ? shipText.replace(/\n/g, ', ') : '';
  shipAddrEl.style.display = shipText ? '' : 'none';

  if(orderItems.length === 0){
    body.innerHTML = '<div class="empty-state" style="padding:40px 0"><div class="icon" style="font-size:48px">🛒</div><div class="title">Pedido buit</div><div style="font-size:13px;color:rgba(29,29,31,.45)">Afegeix productes des de la fitxa de cada producte</div></div>';
    if(totalEl) totalEl.textContent = '0,00 €';
    if(notesEl) notesEl.value = orderNotes || '';
    return;
  }

  var html = '';
  for(var i=0;i<orderItems.length;i++){
    var item = orderItems[i];
    var p = PRODS[item.idx];
    if(!p) continue;
    var subtotal = (item.price || (parseFloat(p.p)||0)) * item.qty;
    html += '<div class="order-item" data-oi="'+i+'">';
    html += '<img class="order-item-img" src="'+escHtml(getImgSrc(p))+'" alt="" onerror="_handleImgError(this)">';
    html += '<div class="order-item-info">';
    html += '<div class="order-item-name">'+escHtml(p.n||'')+'</div>';
    html += '<div class="order-item-ref">'+escHtml(p.r||'')+'</div>';
    if(item.variantLabel) html += '<div class="order-item-variant">'+escHtml(item.variantLabel)+'</div>';
    html += '<div class="order-item-price">'+formatPrice(item.price || (parseFloat(p.p)||0))+'</div>';
    html += '</div>';
    html += '<div class="order-item-right">';
    html += '<div class="order-item-subtotal">'+formatPrice(subtotal)+'</div>';
    html += '<div class="order-item-actions">';
    html += '<div class="qty-stepper" style="transform:scale(.8);transform-origin:right center">';
    html += '<button class="qty-btn" data-oi="'+i+'" data-action="minus">−</button>';
    html += '<input type="number" class="qty-input" value="'+item.qty+'" min="1" style="width:40px;height:36px;font-size:14px" data-oi="'+i+'" data-action="qty">';
    html += '<button class="qty-btn" data-oi="'+i+'" data-action="plus">+</button>';
    html += '</div>';
    html += '<button class="order-item-del" data-oi="'+i+'" data-action="del" aria-label="Eliminar">✕</button>';
    html += '</div>';
    if(item.notes) html += '<div class="order-item-notes">'+escHtml(item.notes)+'</div>';
    html += '</div></div>';
  }
  body.innerHTML = html;

  if(totalEl) totalEl.textContent = formatPrice(getOrderTotal());
  if(notesEl){
    notesEl.value = orderNotes || '';
    var newNotes = notesEl.cloneNode(true);
    notesEl.parentNode.replaceChild(newNotes, notesEl);
    newNotes.addEventListener('input', function(){ orderNotes = this.value; saveOrder(); });
  }
}

function openOrderPanel(){
  renderOrderPanel();
  var panel = document.getElementById('orderPanel');
  if(panel) panel.hidden = false;
}

function closeOrderPanel(){
  var panel = document.getElementById('orderPanel');
  if(panel) panel.hidden = true;
}

function clearOrder(){
  if(orderItems.length === 0) return;
  orderItems = [];
  orderNotes = '';
  saveOrder();
  renderOrderPanel();
  updateCartBar();
}

function shareOrder(){
  if(orderItems.length === 0) return;
  var lines = [];
  lines.push('🧾 *PEDIDO NEXE*');
  if(orderClientId && orderClientName){
    lines.push('👤 *Client:* '+orderClientName);
    var c = getClient(orderClientId);
    if(c){
      var sa = getClientShippingAddress(c);
      if(sa) lines.push('📦 *Direcció d\'enviament:* '+sa.replace(/\n/g, ', '));
    }
  }
  lines.push('━'.repeat(30));
  lines.push('');
  for(var i=0;i<orderItems.length;i++){
    var item = orderItems[i];
    var p = PRODS[item.idx];
    if(!p) continue;
    var subtotal = (item.price || (parseFloat(p.p)||0)) * item.qty;
    lines.push('▸ *'+escHtml(p.n||'')+'*');
    if(item.variantLabel) lines.push('  '+escHtml(item.variantLabel));
    lines.push('  Ref: '+escHtml(p.r||'')+'  |  Quant: '+item.qty+'  |  '+formatPrice(subtotal));
    if(item.notes) lines.push('  📝 '+escHtml(item.notes));
    lines.push('');
  }
  lines.push('━'.repeat(30));
  lines.push('*TOTAL: '+formatPrice(getOrderTotal())+'*');
  if(orderNotes) lines.push('📌 '+orderNotes);
  lines.push('');
  lines.push('Generat amb Nexe Catàleg');
  var text = lines.join('\n');

  if(navigator.share){
    navigator.share({title:'Pedido Nexe',text:text}).catch(function(){});
  } else {
    // Fallback: copy to clipboard
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try{ document.execCommand('copy'); }catch(e){}
    document.body.removeChild(ta);
    // Also open WhatsApp if available
    var wa = 'https://wa.me/?text='+encodeURIComponent(text);
    window.open(wa, '_blank');
  }
}

// Wire order events
function initOrderSystem(){
  loadOrder();
  updateOrderBadge();

  var orderBtn = document.getElementById('orderBtn');
  if(orderBtn) orderBtn.addEventListener('click', openOrderPanel);

  var panelClose = document.getElementById('orderPanelClose');
  if(panelClose) panelClose.addEventListener('click', closeOrderPanel);

  var panelBg = document.getElementById('orderPanel');
  if(panelBg){
    panelBg.addEventListener('click', function(e){ if(e.target === panelBg) closeOrderPanel(); });
    // Delegated order item actions (registered once on static parent)
    panelBg.addEventListener('click', function(e){
      var btn = e.target.closest('[data-action]');
      if(!btn) return;
      var oi = parseInt(btn.getAttribute('data-oi'));
      if(isNaN(oi) || !orderItems[oi]) return;
      var action = btn.getAttribute('data-action');
      if(action === 'del'){
        orderItems.splice(oi,1);
        saveOrder();
        renderOrderPanel();
        return;
      }
      if(action === 'plus'){
        orderItems[oi].qty++;
        saveOrder();
        renderOrderPanel();
        return;
      }
      if(action === 'minus'){
        if(orderItems[oi].qty > 1){
          orderItems[oi].qty--;
        } else {
          if(!confirm('Eliminar aquest producte del pedido?')) return;
          orderItems.splice(oi,1);
        }
        saveOrder();
        renderOrderPanel();
        return;
      }
    });
    panelBg.addEventListener('change', function(e){
      var inp = e.target.closest('[data-action="qty"]');
      if(!inp) return;
      var oi = parseInt(inp.getAttribute('data-oi'));
      if(isNaN(oi) || !orderItems[oi]) return;
      var v = parseInt(inp.value)||1;
      if(v<1){ orderItems.splice(oi,1); }else{ orderItems[oi].qty=v; }
      saveOrder();
      renderOrderPanel();
    });
  }

  var clearBtn = document.getElementById('orderClear');
  if(clearBtn) clearBtn.addEventListener('click', function(){ if(confirm('Buida el pedido?')) clearOrder(); });

  var shareBtn = document.getElementById('orderShare');
  if(shareBtn) shareBtn.addEventListener('click', shareOrder);

  var clientBtn = document.getElementById('orderPanelClientBtn');
  if(clientBtn) clientBtn.addEventListener('click', function(){
    showClientPicker(function(){
      renderOrderPanel();
      updateCartBar();
    });
  });

  initCartBar();
}

/* ── CLIENTS (ERP-compatible data layer) ── */
const CLIENTS_KEY = 'ft_clients';
var clients = [];

function _clientPrimaryContact(c){
  return c.contactes && c.contactes.length ? c.contactes[0] : { nom: '', tel: '', email: '' };
}

function loadClients(){
  // Always start from initialClients (the full set) and merge localStorage edits
  var saved = [];
  try{ saved = JSON.parse(localStorage.getItem(CLIENTS_KEY)) || []; }catch(e){ saved = []; }
  if(typeof initialClients !== 'undefined' && initialClients.length > saved.length){
    // initialClients has more — use it as base, merge any local edits
    var savedMap = {};
    for(var i=0;i<saved.length;i++) if(saved[i] && saved[i].id) savedMap[saved[i].id] = saved[i];
    clients = [];
    for(var j=0;j<initialClients.length;j++){
      var ic = initialClients[j];
      if(savedMap[ic.id]) clients.push(savedMap[ic.id]);
      else clients.push(ic);
    }
    _persistClients();
  } else {
    clients = saved;
  }
  // Load from initialClients if localStorage is empty
  if(clients.length === 0 && typeof initialClients !== 'undefined' && initialClients.length > 0){
    clients = initialClients;
    _persistClients();
  }
  // Migrate existing clients to new billingAddress/shippingAddress object format
  for(var _i=0;_i<clients.length;_i++){
    if(!clients[_i].billingAddress) clients[_i] = _normalizeClient(clients[_i]);
  }
  if(orderClientId){
    var found = getClient(orderClientId);
    if(found){
      var pc = _clientPrimaryContact(found);
      orderClientName = found.nom || pc.nom;
    } else {
      orderClientId = null;
      orderClientName = '';
    }
  }
}

function _persistClients(){
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

function saveClients(){
  _persistClients();
  syncClientsToFirebase();
}

function generateClientId(){
  return 'c' + Date.now();
}

var _clientColors = ['#f59e0b','#22c55e','#3b82f6','#a855f7','#ef4444','#06b6d4','#ec4899'];

function _normalizeAddress(raw, defaults){
  if(typeof raw === 'object' && raw !== null)
    return { street: (raw.street||'').trim(), cp: (raw.cp||'').trim(), poblacio: (raw.poblacio||raw.city||'').trim(), provincia: (raw.provincia||'').trim() };
  var s = (typeof raw === 'string' ? raw : '').trim();
  var d = defaults || {};
  return { street: s || (d.street||''), cp: (d.cp||''), poblacio: (d.poblacio||''), provincia: (d.provincia||'') };
}

function _normalizeClient(data){
  var nom = (data.nom || data.name || data.contact || '').trim();
  var contactNom = (data.contact || '').trim();
  var tel = (data.tel || data.phone || '').trim();
  var email = (data.email || '').trim();
  var contactes = data.contactes && data.contactes.length ? data.contactes :
    [{ nom: contactNom || nom, carrec: '', tel: tel, email: email, principal: true }];
  if(!contactes.some(function(c){ return c.principal; })) contactes[0].principal = true;
  var pc = contactes.reduce(function(a,c){ return c.principal ? c : a; }, contactes[0]);

  // Billing address: prefer structured object, fallback to old string fields
  var billingAddr = typeof data.billingAddress === 'object' && data.billingAddress !== null
    ? data.billingAddress
    : { street: (data.adreca || data.billingAddress || '').trim(), cp: (data.cp||'').trim(), poblacio: (data.poblacio||data.city||'').trim(), provincia: (data.provincia||'').trim() };
  // Shipping address: prefer structured object, fallback to old deliveryAddress string, then copy billing
  var oldDelivery = (typeof data.deliveryAddress === 'string' ? data.deliveryAddress : '').trim();
  var shippingAddr = typeof data.shippingAddress === 'object' && data.shippingAddress !== null
    ? data.shippingAddress
    : _normalizeAddress(oldDelivery || '', billingAddr);
  if(!oldDelivery && !data.shippingAddress) shippingAddr = { street: billingAddr.street, cp: billingAddr.cp, poblacio: billingAddr.poblacio, provincia: billingAddr.provincia };

  return {
    id: data.id || generateClientId(),
    nom: nom,
    cif: (data.cif || '').trim(),
    adreca: billingAddr.street,
    cp: billingAddr.cp,
    poblacio: billingAddr.poblacio,
    provincia: billingAddr.provincia,
    pais: (data.pais || 'Espanya').trim(),
    contactes: contactes,
    contacte: pc.nom,
    tel: pc.tel,
    email: pc.email,
    condicions: data.condicions || '30 dies',
    tarifa: data.tarifa || 'B',
    descompte: typeof data.descompte === 'number' ? data.descompte : (data.discount || 0),
    actiu: data.actiu !== undefined ? data.actiu : true,
    color: data.color || _clientColors[clients.length % _clientColors.length],
    notes: (data.notes || '').trim(),
    coord: data.coord || null,
    deliveryAddress: shippingAddr.street || oldDelivery,
    billingAddress: { street: billingAddr.street, cp: billingAddr.cp, poblacio: billingAddr.poblacio, provincia: billingAddr.provincia },
    shippingAddress: { street: shippingAddr.street, cp: shippingAddr.cp, poblacio: shippingAddr.poblacio, provincia: shippingAddr.provincia },
    createdAt: data.createdAt || Date.now(),
    updatedAt: Date.now()
  };
}

function addClient(data){
  var c = _normalizeClient(data);
  c.id = generateClientId();
  c.color = _clientColors[clients.length % _clientColors.length];
  clients.push(c);
  saveClients();
  return c;
}

function updateClient(id, data){
  for(var i=0;i<clients.length;i++){
    if(clients[i].id === id){
      var c = clients[i];
      var old = { nom: c.nom, contact: c.contacte, tel: c.tel, email: c.email, adreca: c.adreca, cp: c.cp, poblacio: c.poblacio, provincia: c.provincia, cif: c.cif, notes: c.notes, condicions: c.condicions, tarifa: c.tarifa, descompte: c.descompte, deliveryAddress: c.deliveryAddress, billingAddress: c.billingAddress, shippingAddress: c.shippingAddress };
      var merged = _normalizeClient({ id: id,
        nom: data.nom !== undefined ? data.nom : old.nom,
        contact: data.contact !== undefined ? data.contact : old.contact,
        tel: data.tel !== undefined ? data.tel : old.tel,
        email: data.email !== undefined ? data.email : old.email,
        adreca: data.adreca !== undefined ? data.adreca : old.adreca,
        cp: data.cp !== undefined ? data.cp : old.cp,
        poblacio: data.poblacio !== undefined ? data.poblacio : old.poblacio,
        provincia: data.provincia !== undefined ? data.provincia : old.provincia,
        cif: data.cif !== undefined ? data.cif : old.cif,
        notes: data.notes !== undefined ? data.notes : old.notes,
        condicions: data.condicions !== undefined ? data.condicions : old.condicions,
        tarifa: data.tarifa !== undefined ? data.tarifa : old.tarifa,
        descompte: data.descompte !== undefined ? data.descompte : old.descompte,
        deliveryAddress: data.deliveryAddress !== undefined ? data.deliveryAddress : old.deliveryAddress,
        billingAddress: data.billingAddress !== undefined ? data.billingAddress : old.billingAddress,
        shippingAddress: data.shippingAddress !== undefined ? data.shippingAddress : old.shippingAddress
      });
      clients[i] = merged;
      if(orderClientId === id) orderClientName = merged.nom;
      saveClients();
      return merged;
    }
  }
  return null;
}

function deleteClient(id){
  for(var i=0;i<clients.length;i++){
    if(clients[i].id === id){
      clients.splice(i,1);
      _persistClients();
      syncClientsToFirebase();
      if(orderClientId === id){
        orderClientId = null;
        orderClientName = '';
        saveOrder();
      }
      return true;
    }
  }
  return false;
}

function _fmtAddress(addr, sep){
  if(!addr) return '';
  var parts = [addr.street, addr.cp, addr.poblacio, addr.provincia].filter(function(s){ return s && s.trim(); });
  return parts.join(sep || ', ');
}

function getClientShippingAddress(client){
  if(!client) return '';
  if(client.shippingAddress && typeof client.shippingAddress === 'object')
    return _fmtAddress(client.shippingAddress, '\n');
  return client.deliveryAddress || client.adreca || '';
}

function getClientBillingAddress(client){
  if(!client) return '';
  if(client.billingAddress && typeof client.billingAddress === 'object')
    return _fmtAddress(client.billingAddress, '\n');
  return client.adreca || '';
}

function getClient(id){
  for(var i=0;i<clients.length;i++) if(clients[i].id === id) return clients[i];
  return null;
}

function searchClients(q){
  if(!q) return clients;
  q = q.toLowerCase();
  var r = [];
  for(var i=0;i<clients.length;i++){
    var c = clients[i];
    var pc = _clientPrimaryContact(c);
    if((c.nom||'').toLowerCase().indexOf(q) > -1 ||
       (pc.nom||'').toLowerCase().indexOf(q) > -1 ||
       (c.tel||'').indexOf(q) > -1 ||
       (c.email||'').toLowerCase().indexOf(q) > -1) r.push(c);
  }
  return r;
}

function selectClientForOrder(id){
  if(!id){ orderClientId = null; orderClientName = ''; }
  else{
    var c = getClient(id);
    if(c){ orderClientId = c.id; orderClientName = c.nom; }
  }
  saveOrder();
}

/* ── FIREBASE SYNC (ERP single source: nexe/clients) ── */
var _fbDb = null;
var _fbClientsPath = 'nexe/clients';
var _migrationDone = false;
var _fbReady = false;

function initFirebase(callback){
  if(_fbReady){ if(callback) callback(_fbReady); return; }
  if(location.protocol === 'file:'){ if(callback) callback(false); return; }
  if(typeof firebase === 'undefined'){
    var scriptsToLoad = 0;
    function onScriptLoaded(){
      scriptsToLoad++;
      if(scriptsToLoad < 3) return;
      try{
        firebase.initializeApp({
          apiKey: "{{firebase:apiKey}}",
          authDomain: "{{firebase:authDomain}}",
          databaseURL: "{{firebase:databaseURL}}",
          projectId: "{{firebase:projectId}}",
          storageBucket: "{{firebase:storageBucket}}",
          messagingSenderId: "{{firebase:messagingSenderId}}",
          appId: "{{firebase:appId}}"
        });
        _fbDb = firebase.database();
        // Authenticate as admin to access nexe/ tree
        firebase.auth().signInWithEmailAndPassword('{{firebase:email}}', '{{firebase:password}}').then(function(){
          _fbReady = true;
          if(callback) callback(true);
        }).catch(function(e){
          console.warn('[FB] Auth failed:', e.message);
          if(callback) callback(false);
        });
      }catch(e){ if(callback) callback(false); }
    }
    ['firebase-app-compat','firebase-database-compat','firebase-auth-compat'].forEach(function(m){
      var sc = document.createElement('script');
      sc.src = 'https://www.gstatic.com/firebasejs/9.23.0/'+m+'.js';
      sc.onload = onScriptLoaded;
      sc.onerror = function(){ console.warn('[FB] Failed to load', m); if(callback) callback(false); };
      document.head.appendChild(sc);
    });
  }else{
    try{
      _fbDb = firebase.database();
      firebase.auth().signInWithEmailAndPassword('{{firebase:email}}', '{{firebase:password}}').then(function(){
        _fbReady = true;
        if(callback) callback(true);
      }).catch(function(e){
        console.warn('[FB] Auth failed:', e.message);
        if(callback) callback(false);
      });
    }catch(e){ if(callback) callback(false); }
  }
}

function _migrateOldClients(callback){
  if(_migrationDone){ if(callback) callback(); return; }
  _migrationDone = true;
  _fbDb.ref('nexe_cataleg/clients').once('value').then(function(snap){
    var oldData = snap.val();
    if(!oldData || typeof oldData !== 'object'){ if(callback) callback(); return; }
    var oldIds = Object.keys(oldData);
    if(oldIds.length === 0){ if(callback) callback(); return; }
    // Map old format to new ERP format
    var mapped = [];
    for(var k in oldData){
      var o = oldData[k];
      mapped.push(_normalizeClient({
        id: o.id,
        nom: o.name || o.nom,
        contact: o.contact,
        tel: o.phone || o.tel,
        email: o.email,
        billingAddress: o.billingAddress || o.adreca,
        deliveryAddress: o.deliveryAddress,
        notes: o.notes,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt
      }));
    }
    // Merge with existing nexe/clients
    _fbDb.ref(_fbClientsPath).once('value').then(function(snap2){
      var existing = snap2.val();
      var existingArr = Array.isArray(existing) ? existing : (existing ? Object.values(existing) : []);
      var existingMap = {};
      for(var i=0;i<existingArr.length;i++) if(existingArr[i] && existingArr[i].id) existingMap[existingArr[i].id] = existingArr[i];
      // Merge mapped (old from nexe_cataleg) into existingMap (old wins if same id)
      for(var j=0;j<mapped.length;j++){
        if(!existingMap[mapped[j].id]) existingMap[mapped[j].id] = mapped[j];
      }
      var merged = [];
      for(var id in existingMap) merged.push(existingMap[id]);
      _fbDb.ref(_fbClientsPath).set(merged).then(function(){
        // Clean up old path
        _fbDb.ref('nexe_cataleg/clients').remove().catch(function(){});
        // Also update local clients if empty
        if(clients.length === 0){ clients = merged; _persistClients(); }
        if(callback) callback();
      }).catch(function(){ if(callback) callback(); });
    }).catch(function(){ if(callback) callback(); });
  }).catch(function(){ if(callback) callback(); });
}

function syncClientsToFirebase(){
  if(!_fbReady || clients.length === 0) return;
  _fbDb.ref(_fbClientsPath).set(clients).then(function(){
    console.log('[FB] Clients saved to', _fbClientsPath, clients.length, 'clients');
  }).catch(function(e){
    console.warn('[FB] Save error:', e.message);
  });
}

function syncClientsFromFirebase(callback){
  if(!_fbReady){ console.log('[FB] Not ready, using localStorage'); if(callback) callback(); return; }
  // One-time migration from old path
  _migrateOldClients(function(){
    _fbDb.ref(_fbClientsPath).once('value').then(function(snap){
      var fbData = snap.val();
      if(!fbData || !Array.isArray(fbData)){
        console.log('[FB] No clients data or wrong format (got '+(fbData ? typeof fbData : 'null')+')');
        if(fbData && typeof fbData === 'object' && !Array.isArray(fbData)){
          // Try to handle object-format data by converting to array
          var arr = [];
          for(var k in fbData){ if(fbData[k] && fbData[k].id) arr.push(fbData[k]); }
          if(arr.length){ fbData = arr; console.log('[FB] Converted object to array,', arr.length, 'clients'); }
          else{ if(callback) callback(); return; }
        }else{ if(callback) callback(); return; }
      }
      console.log('[FB] Loaded', fbData.length, 'clients from', _fbClientsPath);
      // Merge: local wins over Firebase for same id (local has unsaved edits)
      var existingMap = {};
      for(var i=0;i<clients.length;i++) if(clients[i] && clients[i].id) existingMap[clients[i].id] = clients[i];
      for(var j=0;j<fbData.length;j++){
        var fbc = fbData[j];
        if(!fbc || !fbc.id) continue;
        if(!existingMap[fbc.id]) existingMap[fbc.id] = fbc;
        else if(fbc.updatedAt && existingMap[fbc.id].updatedAt && fbc.updatedAt > existingMap[fbc.id].updatedAt){
          existingMap[fbc.id] = fbc;
        }
      }
      clients = [];
      for(var id in existingMap) clients.push(existingMap[id]);
      clients.sort(function(a,b){ return (a.nom||'').localeCompare(b.nom||''); });
      _persistClients();
      console.log('[FB] Merged: total', clients.length, 'clients');
      if(callback) callback();
    }).catch(function(e){
      console.warn('[FB] Read error:', e.message);
      if(callback) callback();
    });
  });
}

/* ── FIREBASE LIST SYNC ── */
var _fbListsPath = 'nexe/catalogue/lists';
var _fbListsQueue = [];
var _fbListsSyncing = false;
var _fbListsLoaded = false;

function initFirebaseSync(){
  if(location.protocol === 'file:'){
    console.log('[FB] file:// detected, skipping Firebase');
    return;
  }
  initFirebase(function(ok){
    if(ok){
      console.log('[FB] Firebase ready, syncing lists...');
      syncListsFromFirebase();
      // Fallback: load clients from Firebase if local list is empty
      if(clients.length === 0){
        console.log('[FB] No local clients, fetching from Firebase...');
        syncClientsFromFirebase(function(){
          if(clients.length > 0){
            console.log('[FB] Loaded', clients.length, 'clients from Firebase fallback');
            if(typeof renderClientList === 'function'){
              var container = document.getElementById('page-clients');
              if(container) renderClientList(container, '');
            }
          }
        });
      }
    }else{
      console.warn('[FB] Firebase not available, using localStorage only');
    }
  });
  // Sync pending queue when coming back online
  window.addEventListener('online', function(){
    console.log('[FB] Back online, flushing queue...');
    flushListsQueue();
  });
}

function syncListsToFirebase(){
  if(!_fbReady || !_fbDb){
    _fbListsQueue.push({type:'save', data:customLists.map(function(l){
      return { id:l.id, name:l.name, icon:l.icon, items:l.items, builtin:l.builtin };
    })});
    return;
  }
  // Strip non-serializable fields before saving
  var toSave = customLists.map(function(l){
    return { id:l.id, name:l.name, icon:l.icon, items:l.items, builtin:l.builtin };
  });
  _fbDb.ref(_fbListsPath).set(toSave).then(function(){
    console.log('[FB] Lists saved to', _fbListsPath, toSave.length, 'lists');
  }).catch(function(e){
    console.warn('[FB] Lists save error:', e.message);
    // Queue all failures, not only explicit offline states.
    _fbListsQueue.push({type:'save', data:toSave});
  });
}

function syncListsFromFirebase(){
  if(!_fbReady || !_fbDb) return;
  _fbDb.ref(_fbListsPath).once('value').then(function(snap){
    var fbData = snap.val();
    if(!fbData || !Array.isArray(fbData) || fbData.length === 0){
      // No Firebase data — push local data up
      _fbListsLoaded = true;
      syncListsToFirebase();
      return;
    }
    // Firebase is authoritative for shared lists. Keep only local lists that
    // do not exist online yet, so another device's Recomanats is not hidden
    // by stale localStorage data.
    var localMap = {};
    for(var i=0;i<customLists.length;i++) localMap[customLists[i].id] = customLists[i];
    var merged = [];
    var seenIds = {};
    for(var j=0;j<fbData.length;j++){
      var fbl = fbData[j];
      if(!fbl || !fbl.id) continue;
      seenIds[fbl.id] = true;
      merged.push(fbl);
    }
    for(var k=0;k<customLists.length;k++){
      if(!seenIds[customLists[k].id]) merged.push(customLists[k]);
    }
    customLists = merged;
    _fbListsLoaded = true;
    saveListsLocal();
    refreshRecomanats();
    if(typeof showLists === 'function' && _pages && _pages.lists && _pages.lists.classList.contains('active')) showLists(_pages);
    // Push local-only lists, if any, without replacing remote lists.
    if(merged.length !== fbData.length) syncListsToFirebase();
    flushListsQueue();
  }).catch(function(e){
    console.warn('[FB] Lists read error:', e.message);
  });

  // Keep Recomanats and other shared lists synchronized across open devices.
  _fbDb.ref(_fbListsPath).on('value', function(snap){
    if(!_fbListsLoaded) return;
    var fbData = snap.val();
    if(!Array.isArray(fbData)) return;
    var localOnly = {};
    for(var i=0;i<customLists.length;i++){
      if(!fbData.some(function(remote){ return remote && remote.id === customLists[i].id; })) localOnly[customLists[i].id] = customLists[i];
    }
    customLists = fbData.filter(function(l){ return l && l.id; }).concat(Object.keys(localOnly).map(function(id){ return localOnly[id]; }));
    saveListsLocal();
    refreshRecomanats();
    if(typeof showLists === 'function' && _pages && _pages.lists && _pages.lists.classList.contains('active')) showLists(_pages);
  });
}

function flushListsQueue(){
  if(_fbListsQueue.length === 0 || !_fbReady || !_fbDb) return;
  console.log('[FB] Flushing', _fbListsQueue.length, 'queued operations');
  var pending = _fbListsQueue.slice();
  _fbListsQueue = [];
  for(var i=0;i<pending.length;i++){
    if(pending[i].type === 'save'){
      _fbDb.ref(_fbListsPath).set(pending[i].data).catch(function(e){
        console.warn('[FB] Queue flush error:', e.message);
        _fbListsQueue.push(pending[i]); // Re-queue on failure
      });
    }
  }
}

/* ── CLIENTS UI ── */

function showClients(pages){
  pages.clients.classList.add('active');
  renderClientList(pages.clients, '');
}

function renderClientList(container, q){
  // Render header only if not already present
  var header = container.querySelector('.clients-header');
  if(!header){
    container.innerHTML =
      '<div class="clients-header"><div class="clients-search-wrap"><input class="clients-search" id="clientsSrch" type="search" placeholder="Cerca clients..." value="'+escHtml(q||'')+'" autocomplete="off"></div><button class="clients-add-btn" id="clientsAddBtn">+ Nou client</button></div>' +
      '<div class="clients-list-wrap"></div>';
    // Wire up events once
    var srch = container.querySelector('#clientsSrch');
    if(srch) srch.addEventListener('input', function(){ renderClientList(container, this.value); });
    var addBtn = container.querySelector('#clientsAddBtn');
    if(addBtn) addBtn.addEventListener('click', function(){ showClientForm(null, container); });
    container.addEventListener('click', function(e){
      var btn = e.target.closest('[data-action]');
      if(!btn) return;
      var cid = btn.getAttribute('data-id');
      var action = btn.getAttribute('data-action');
      if(action === 'select'){
        selectClientForOrder(cid);
        renderClientList(container, container.querySelector('#clientsSrch') ? container.querySelector('#clientsSrch').value : '');
        updateCartBar();
      }
      if(action === 'edit'){
        var client = getClient(cid);
        if(client) showClientForm(client, container);
      }
    });
  }else{
    // Update search input value if different (preserves focus)
    var srch = container.querySelector('#clientsSrch');
    if(srch && srch.value !== (q||'')) srch.value = q;
  }
  // Always render/update the results list
  var wrap = container.querySelector('.clients-list-wrap');
  if(wrap) renderClientResults(wrap, searchClients(q), q);
}

function renderClientResults(wrap, results, q){
  if(!wrap) return;
  if(results.length === 0){
    wrap.innerHTML = '<div class="empty-state" style="padding:60px 0"><div class="icon" style="font-size:48px">👥</div><div class="title">'+(q?'Sense resultats':'Cap client')+'</div><div style="font-size:13px;color:rgba(29,29,31,.45)">'+(q?'Prova un altre cercador':'Afegeix el teu primer client')+'</div></div>';
  }else{
    var html = '<div class="clients-list">';
    for(var i=0;i<results.length;i++){
      var c = results[i];
      var pc = _clientPrimaryContact(c);
      var sel = c.id === orderClientId;
      html += '<div class="client-card"><div class="client-card-left"><div class="client-card-name">'+escHtml(c.nom||'Sense nom')+'</div>';
      if(pc.nom) html += '<div class="client-card-contact">'+escHtml(pc.nom)+'</div>';
      if(c.tel) html += '<div class="client-card-phone">📞 '+escHtml(c.tel)+'</div>';
      html += '</div>';
      html += '<div class="client-card-right">';
      if(sel) html += '<span class="client-card-selected">Seleccionat</span>';
      html += '<button class="client-card-action" data-id="'+c.id+'" data-action="select">'+(sel?'Canviar':'Seleccionar')+'</button>';
      html += '<button class="client-card-edit" data-id="'+c.id+'" data-action="edit" aria-label="Editar">✎</button></div></div>';
    }
    html += '</div>';
    wrap.innerHTML = html;
  }
}

function showClientForm(client, listContainer){
  var modal = document.getElementById('clientFormModal');
  var body = document.getElementById('clientFormBody');
  var title = document.getElementById('clientFormTitle');
  var saveBtn = document.getElementById('clientFormSave');
  var cancelBtn = document.getElementById('clientFormCancel');
  var closeBtn = document.getElementById('clientFormClose');
  if(!modal) return;

  var isEdit = !!client;
  var pc = client ? _clientPrimaryContact(client) : { nom: '', tel: '', email: '' };
  title.textContent = isEdit ? 'Editar client' : 'Nou client';
  var bill = client ? (client.billingAddress || {}) : {};
  var ship = client ? (client.shippingAddress || {}) : {};
  body.innerHTML =
    '<div class="client-form-field"><label class="client-form-label">Nom empresa *</label><input class="client-form-input" id="fName" value="'+escHtml(client?client.nom:'')+'" placeholder="Ex: Marbres XXL" required></div>'+
    '<div class="client-form-row"><div class="client-form-field"><label class="client-form-label">CIF/NIF</label><input class="client-form-input" id="fCif" value="'+escHtml(client?client.cif:'')+'" placeholder="B-12345678"></div>'+
    '<div class="client-form-field"><label class="client-form-label">Telèfon</label><input class="client-form-input" id="fPhone" value="'+escHtml(client?client.tel:'')+'" placeholder="+34 600 000 000" type="tel"></div></div>'+
    '<div class="client-form-field"><label class="client-form-label">Persona de contacte</label><input class="client-form-input" id="fContact" value="'+escHtml(pc.nom)+'" placeholder="Nom del contacte"></div>'+
    '<div class="client-form-field"><label class="client-form-label">Email</label><input class="client-form-input" id="fEmail" value="'+escHtml(client?client.email:'')+'" placeholder="info@empresa.com" type="email"></div>'+
    '<div class="client-form-section-title">📍 Direcció fiscal</div>'+
    '<div class="client-form-field"><label class="client-form-label">Carrer i número</label><input class="client-form-input" id="fBillStreet" value="'+escHtml(bill.street||'')+'" placeholder="C/ Taller 25"></div>'+
    '<div class="client-form-row"><div class="client-form-field"><label class="client-form-label">Codi postal</label><input class="client-form-input" id="fBillCp" value="'+escHtml(bill.cp||'')+'" placeholder="08000"></div>'+
    '<div class="client-form-field"><label class="client-form-label">Població</label><input class="client-form-input" id="fBillPoblacio" value="'+escHtml(bill.poblacio||'')+'" placeholder="Barcelona"></div></div>'+
    '<div class="client-form-field"><label class="client-form-label">Província</label><input class="client-form-input" id="fBillProvincia" value="'+escHtml(bill.provincia||'')+'" placeholder="Barcelona"></div>'+
    '<div class="client-form-section-title" style="margin-top:16px">📍 Direcció d\'enviament</div>'+
    '<button class="client-form-copy-btn" id="fCopyBtn" type="button">📋 Copiar direcció fiscal a enviament</button>'+
    '<div class="client-form-field"><label class="client-form-label">Carrer i número</label><input class="client-form-input" id="fShipStreet" value="'+escHtml(ship.street||'')+'" placeholder="C/ Taller 25"></div>'+
    '<div class="client-form-row"><div class="client-form-field"><label class="client-form-label">Codi postal</label><input class="client-form-input" id="fShipCp" value="'+escHtml(ship.cp||'')+'" placeholder="08000"></div>'+
    '<div class="client-form-field"><label class="client-form-label">Població</label><input class="client-form-input" id="fShipPoblacio" value="'+escHtml(ship.poblacio||'')+'" placeholder="Barcelona"></div></div>'+
    '<div class="client-form-field"><label class="client-form-label">Província</label><input class="client-form-input" id="fShipProvincia" value="'+escHtml(ship.provincia||'')+'" placeholder="Barcelona"></div>'+
    '<div class="client-form-field"><label class="client-form-label">Observacions</label><textarea class="client-form-textarea" id="fNotes" placeholder="Horaris, accés, notes internes..." rows="1">'+escHtml(client?client.notes:'')+'</textarea></div>';

  modal.hidden = false;

  // Copy billing to shipping
  var copyBtn = document.getElementById('fCopyBtn');
  if(copyBtn){
    copyBtn.addEventListener('click', function(){
      var street = document.getElementById('fBillStreet').value;
      var cp = document.getElementById('fBillCp').value;
      var poblacio = document.getElementById('fBillPoblacio').value;
      var provincia = document.getElementById('fBillProvincia').value;
      document.getElementById('fShipStreet').value = street;
      document.getElementById('fShipCp').value = cp;
      document.getElementById('fShipPoblacio').value = poblacio;
      document.getElementById('fShipProvincia').value = provincia;
    });
  }

  function doSave(){
    var nom = document.getElementById('fName').value.trim();
    if(!nom){ document.getElementById('fName').focus(); return; }
    var data = {
      nom: nom,
      cif: document.getElementById('fCif').value,
      contact: document.getElementById('fContact').value,
      phone: document.getElementById('fPhone').value,
      email: document.getElementById('fEmail').value,
      adreca: document.getElementById('fBillStreet').value,
      cp: document.getElementById('fBillCp').value,
      poblacio: document.getElementById('fBillPoblacio').value,
      provincia: document.getElementById('fBillProvincia').value,
      billingAddress: {
        street: document.getElementById('fBillStreet').value,
        cp: document.getElementById('fBillCp').value,
        poblacio: document.getElementById('fBillPoblacio').value,
        provincia: document.getElementById('fBillProvincia').value
      },
      shippingAddress: {
        street: document.getElementById('fShipStreet').value,
        cp: document.getElementById('fShipCp').value,
        poblacio: document.getElementById('fShipPoblacio').value,
        provincia: document.getElementById('fShipProvincia').value
      },
      notes: document.getElementById('fNotes').value
    };
    if(isEdit) updateClient(client.id, data);
    else{
      var nc = addClient(data);
      selectClientForOrder(nc.id);
      updateCartBar();
    }
    modal.hidden = true;
    renderClientList(listContainer || document.getElementById('page-clients'), '');
  }

  var newSave = saveBtn.cloneNode(true);
  saveBtn.parentNode.replaceChild(newSave, saveBtn);
  newSave.addEventListener('click', doSave);
  var newCancel = cancelBtn.cloneNode(true);
  cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
  newCancel.addEventListener('click', function(){ modal.hidden = true; });
  var newClose = closeBtn.cloneNode(true);
  closeBtn.parentNode.replaceChild(newClose, closeBtn);
  newClose.addEventListener('click', function(){ modal.hidden = true; });
  modal.addEventListener('click', function(ev){ if(ev.target === modal) modal.hidden = true; });
}

function showClientPicker(callback){
  var picker = document.getElementById('clientPicker');
  var list = document.getElementById('clientPickerList');
  var search = document.getElementById('clientPickerSearch');
  var close = document.getElementById('clientPickerClose');
  if(!picker) return;

  function renderPickerList(q){
    var results = searchClients(q);
    var html = '';
    if(results.length === 0){
      html = '<div class="empty-state" style="padding:30px 0"><div class="icon" style="font-size:36px">👥</div><div class="title">'+(q?'Sense resultats':'Cap client')+'</div></div>';
    }else{
      for(var i=0;i<results.length;i++){
        var c = results[i];
        var pc = _clientPrimaryContact(c);
        var sel = c.id === orderClientId;
        html += '<div class="client-picker-item" data-id="'+c.id+'"><div class="info"><div class="name">'+escHtml(c.nom||'Sense nom')+'</div><div class="sub">'+((pc.nom?escHtml(pc.nom):'')+(c.tel?' · '+escHtml(c.tel):''))+'</div></div><div class="check'+(sel?' on':'')+'">'+(sel?'✓':'')+'</div></div>';
      }
    }
    list.innerHTML = html;
  }

  picker.hidden = false;
  renderPickerList('');

  var newSearch = search.cloneNode(true);
  search.parentNode.replaceChild(newSearch, search);
  newSearch.addEventListener('input', function(){ renderPickerList(this.value); });

  var newClose = close.cloneNode(true);
  close.parentNode.replaceChild(newClose, close);
  newClose.addEventListener('click', function(){ picker.hidden = true; });

  list.addEventListener('click', function(e){
    var item = e.target.closest('.client-picker-item');
    if(!item) return;
    var cid = item.getAttribute('data-id');
    selectClientForOrder(cid);
    picker.hidden = true;
    updateCartBar();
    if(callback) callback(cid);
  });

  picker.addEventListener('click', function(ev){ if(ev.target === picker) picker.hidden = true; });
}

// SW - enable for HTTPS only
if('serviceWorker' in navigator && location.protocol !== 'file:'){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').then(function(reg){
      console.log('[SW] Registered');
      if(reg.active){
        reg.active.postMessage({ type: 'CACHE_ALL_IMAGES' });
      }
      reg.addEventListener('updatefound', function(){
        var newWorker = reg.installing;
        newWorker.addEventListener('statechange', function(){
          if(newWorker.state === 'activated'){
            newWorker.postMessage({ type: 'CACHE_ALL_IMAGES' });
          }
        });
      });
    }).catch(function(err){ console.log('[SW] Error:', err); });
  });
}

// Boot
if(location.protocol === 'file:'){
  window._sqliteReady = 'skip';
  console.log('[Boot] file:// detected, skipping SQLite/SW');
}
loadOrder();
loadClients();
init();
if(document.readyState === 'complete' || document.readyState === 'interactive'){
  initOrderSystem();
  initFirebaseSync();
}else{
  document.addEventListener('DOMContentLoaded', function(){
    initOrderSystem();
    initFirebaseSync();
  });
}

function initOfflineInstall(){} // no-op, removed

function preCacheImages(callback){
  var urls = []; var seen = {};
  for(var i=0;i<PRODS.length;i++){
    var p = PRODS[i];
    if(p.i && (p.i.indexOf('imgs/') === 0 || p.i.indexOf('vezzani_imgs/') === 0) && !seen[p.i]){
      urls.push(p.i); seen[p.i] = 1;
    }
    if(p.imgs){
      for(var j=0;j<p.imgs.length;j++){
        var img = p.imgs[j];
        if(img && (img.indexOf('imgs/') === 0 || img.indexOf('vezzani_imgs/') === 0) && !seen[img]){
          urls.push(img); seen[img] = 1;
        }
      }
    }
  }
  var catImgs = ['imatges/tall.JPG','imatges/polit i acabat.JPG','imatges/adhesius i segellat.JPG','imatges/quimics i reparacio.JPG','imatges/manipulacio i instalacio.PNG','imatges/maquinaria.PNG','imatges/seguretat.PNG','imatges/IMG_1868.PNG'];
  for(var c=0;c<catImgs.length;c++){
    if(!seen[catImgs[c]]){ urls.push(catImgs[c]); seen[catImgs[c]] = 1; }
  }
  var total = urls.length;
  var loaded = 0;
  var batch = 5; var idx = 0;
  var clProgress = document.getElementById('clProgress');
  function loadNext(){
    if(idx >= urls.length){
      if(callback) callback();
      return;
    }
    var end = Math.min(idx + batch, urls.length);
    for(var k=idx;k<end;k++){
      var img = new Image();
      img.onload = img.onerror = function(){
        loaded++;
        if(clProgress) clProgress.textContent = Math.round(loaded/total*100)+'%';
      };
      img.src = _resolveImgPath(urls[idx]);
    }
    idx = end;
    setTimeout(loadNext, 100);
  }
  loadNext();
}

// Cache all product images in SW for offline use
function cacheAllImages(){
  if(!navigator.serviceWorker || location.protocol === 'file:') return;
  var imgs = [];
  for(var i=0;i<PRODS.length;i++){
    var p = PRODS[i];
    if(p.imgs && p.imgs.length){
      for(var j=0;j<p.imgs.length;j++) if(imgs.indexOf(p.imgs[j])===-1) imgs.push(p.imgs[j]);
    }
    if(p.i && imgs.indexOf(p.i)===-1) imgs.push(p.i);
  }
  if(imgs.length === 0) return;
  var BATCH = 50;
  navigator.serviceWorker.ready.then(function(reg){
    if(!reg.active) return;
    for(var b=0;b<imgs.length;b+=BATCH){
      var batch = imgs.slice(b, b+BATCH);
      (function(urls){
        setTimeout(function(){
          if(reg.active) reg.active.postMessage({type:'CACHE_IMAGES', urls:urls});
        }, 100);
      })(batch);
    }
  });
}

// Expose API for inline HTML handlers (the app is wrapped in an IIFE, so these are not global by default)
window._app = {
  toggleEditMode: toggleEditMode,
  saveNewProduct: _saveNewProduct,
  saveToFile: _saveToFile,
  clearOverrides: _clearOverrides,
  importOverrides: _importOverrides,
  closeAddProduct: function(){ var o = document.getElementById('editAddOverlay'); if(o) o.classList.remove('active'); _clearVariantRows(); },
  openAddProduct: _openAddProduct,
  addVariantRow: function(){ _addVariantRow(document.getElementById('editAddVariants'), '', ''); }
};

// Run image caching after app loads
if(document.readyState === 'complete'){
  setTimeout(cacheAllImages, 2000);
} else {
  window.addEventListener('load', function(){ setTimeout(cacheAllImages, 2000); });
}
})();

