
/* Nexe Base de Coneixement Tècnic — Atributs + Motor de Raonament */
(function(){
'use strict';

/* ── ESQUEMA D'ATRIBUTS ── */
var ATTR_META = {
  uso:              { label:'Ús', type:'multiselect', options:['corte','pegado','pulido','reparacion','instalacion'] },
  materiales:       { label:'Materials compatibles', type:'tags' },
  noMateriales:     { label:'Materials NO compatibles', type:'tags' },
  interior:         { label:'Ús interior', type:'boolean' },
  exterior:         { label:'Ús exterior', type:'boolean' },
  temperatura:      { label:'Temperatura de treball', type:'string' },
  tiempoAbierto:    { label:'Temps obert', type:'string' },
  resistenciaUV:    { label:'Resistència UV', type:'boolean' },
  resistenciaQuimica:{ label:'Resistència química', type:'boolean' },
  alimentario:      { label:'Contacte amb aliments', type:'boolean' },
  color:            { label:'Color', type:'string' },
  viscosidad:       { label:'Viscositat', type:'string' },
  dificultad:       { label:'Nivell de dificultat', type:'select', options:['basico','tecnico','profesional'] },
  herramientas:     { label:'Eines necessàries', type:'tags' },
  complementarios:  { label:'Productes complementaris', type:'product-refs' }
};

/* ── INFERÈNCIA PER SECCIÓ (anàlisi de text) ── */
function _inferUso(s){
  var sL = s.toLowerCase();
  if(/corte|disco|fresa|broca|taladro/.test(sL)) return ['corte'];
  if(/adhesivo|pegamento|silicona|cinta/.test(sL)) return ['pegado'];
  if(/pulido|pulidora|lija|abrillantador|abrasivo|cepillo|corona|banda|laminilla|plato|rodillo|envejecido/.test(sL)) return ['pulido'];
  if(/masilla|reparación|acabado|decapa|limpieza|quitamanchas|mantenimiento|protección/.test(sL)) return ['reparacion'];
  if(/manipulación|ventosa|pinza|grabo|nivel|refuerzo|caballete|carro|banco|flejado/.test(sL)) return ['instalacion'];
  return ['instalacion'];
}
function _inferMateriales(s){
  var sL = s.toLowerCase(), r=[];
  if(/granito/.test(sL)) r.push('Granito');
  if(/mármol|marmol/.test(sL)) r.push('Mármol');
  if(/porcelánico|porcelanico/.test(sL)) r.push('Porcelánico');
  if(/cuarzo/.test(sL)) r.push('Cuarzo');
  if(/cerámi|cerami/.test(sL)) r.push('Cerámica');
  if(!r.length) r=null;
  return r;
}
function _infDif(s,fam){
  var sL=s.toLowerCase();
  if(fam==='cnc'||/cnc|talladora|puente/.test(sL)) return 'profesional';
  if(/amoladora|pulidora|neumática|compresor|taladro/.test(sL)) return 'tecnico';
  return 'basico';
}
function _infHerramientas(s){
  var sL=s.toLowerCase(), t=[];
  if(/disco|corte/.test(sL)) t.push('amoladora','talladora');
  if(/amoladora/.test(sL)) t.push('amoladora');
  if(/pulidora|lija|corona|cepillo|rodillo/.test(sL)) t.push('pulidora');
  if(/ventosa|pinza|manipulación|grabo|caballete|banco/.test(sL)) t.push('manual');
  if(/adhesivo|pegamento|silicona|cinta/.test(sL)) t.push('manual');
  if(/fresa|cnc/.test(sL)) t.push('cnc');
  if(/broca|taladro/.test(sL)) t.push('taladro');
  if(/compresor|neumática/.test(sL)) t.push('compresor');
  if(!t.length) t.push('manual');
  return t;
}
function _infInterior(s, fam){
  if(fam==='quimics'||fam==='fixacio') return true;
  var sL=s.toLowerCase();
  if(/silicona|polimero|adhesivo|pegamento|cinta|masilla|protección|limpieza|acabado/.test(sL)) return true;
  return true;
}
function _infExterior(s, fam){
  var sL=s.toLowerCase();
  if(/silicona|polimero ms|adhesivo.*junta|masilla.*exterior|protección.*exterior/.test(sL)) return true;
  if(fam==='diamante'||fam==='cnc') return false;
  if(/disco|amoladora|pulidora|ventosa|pinza|manipulación|caballete|carro|banco|flejado|calzado|mascarilla|delantal/.test(sL)) return false;
  return false;
}

/* ── PERFILS DE SECCIÓ (valors exactes per a seccions clau) ── */
var SECTION_KNOWLEDGE = {
  'ADHESIVO PARA JUNTAS INVISIBLES': {
    uso: ['pegado'],
    temperatura: '5°C a 35°C',
    tiempoAbierto: '15-20 min',
    resistenciaUV: true,
    resistenciaQuimica: true,
    alimentario: true,
    interior: true, exterior: true,
    dificultad: 'tecnico',
    herramientas: ['manual']
  },
  'ADHESIVOS': {
    uso: ['pegado'],
    temperatura: '5°C a 40°C',
    tiempoAbierto: '10-30 min',
    resistenciaUV: true,
    resistenciaQuimica: true,
    interior: true, exterior: true,
    dificultad: 'basico',
    herramientas: ['manual']
  },
  'SILICONAS Y POLIMEROS MS': {
    uso: ['pegado','instalacion'],
    temperatura: '-40°C a 120°C',
    resistenciaUV: true,
    resistenciaQuimica: true,
    interior: true, exterior: true,
    dificultad: 'tecnico',
    herramientas: ['manual']
  },
  'PEGAMENTOS': {
    uso: ['pegado'],
    temperatura: '5°C a 35°C',
    tiempoAbierto: '5-15 min',
    interior: true, exterior: false,
    herramientas: ['manual']
  },
  'MASILLAS': {
    uso: ['reparacion'],
    temperatura: '10°C a 30°C',
    tiempoAbierto: '20-30 min',
    interior: true, exterior: true,
    resistenciaUV: true,
    color: 'beige',
    dificultad: 'tecnico',
    herramientas: ['manual','pulidora']
  },
  'ABRILLANTADORES Y CERAS': {
    uso: ['pulido'],
    interior: true, exterior: false,
    dificultad: 'tecnico',
    herramientas: ['pulidora']
  },
  'LIMPIEZA Y MANTENIMIENTO DE LA PIEDRA': {
    uso: ['reparacion'],
    resistenciaQuimica: true,
    interior: true, exterior: true,
    dificultad: 'basico',
    herramientas: ['manual']
  },
  'PROTECCIÓN DE LA PIEDRA': {
    uso: ['reparacion'],
    resistenciaUV: true,
    resistenciaQuimica: true,
    interior: true, exterior: true,
    dificultad: 'tecnico',
    herramientas: ['manual']
  },
  'LIMPIEZA Y DECAPADO': {
    uso: ['reparacion'],
    resistenciaQuimica: true,
    interior: true, exterior: false,
    herramientas: ['manual']
  },
  'CINTA ADHESIVA': {
    uso: ['pegado','instalacion'],
    interior: true, exterior: false,
    herramientas: ['manual']
  },
  'KIT DE PULIDO': {
    uso: ['pulido'],
    interior: true, exterior: false,
    dificultad: 'tecnico',
    herramientas: ['pulidora']
  },
  'ACABADOS & CERAS': {
    uso: ['pulido','reparacion'],
    interior: true, exterior: true,
    dificultad: 'tecnico',
    herramientas: ['pulidora','manual']
  },
  'QUITAMANCHAS': {
    uso: ['reparacion'],
    resistenciaQuimica: true,
    interior: true, exterior: true,
    herramientas: ['manual']
  },
  'ANTIDESLIZANTE QUÍMICO': {
    uso: ['reparacion'],
    resistenciaUV: true,
    resistenciaQuimica: true,
    interior: true, exterior: true,
    herramientas: ['manual']
  },
  'MANIPULACIÓN': {
    uso: ['instalacion'],
    dificultad: 'basico',
    herramientas: ['manual']
  },
  'MANIPULACIÓN MANUAL DE PIEZAS': {
    uso: ['instalacion'],
    dificultad: 'basico',
    herramientas: ['manual']
  },
  'VENTOSAS PARA CNC': {
    uso: ['instalacion'],
    dificultad: 'profesional',
    herramientas: ['cnc']
  },
  'GRABO': {
    uso: ['instalacion'],
    dificultad: 'tecnico',
    herramientas: ['manual']
  },
  'PINZAS CAIMÁN': {
    uso: ['instalacion'],
    dificultad: 'basico',
    herramientas: ['manual']
  },
  'PINZAS PARA LA PIEDRA': {
    uso: ['instalacion'],
    dificultad: 'basico',
    herramientas: ['manual']
  },
  'REFUERZO ENCIMERAS': {
    uso: ['instalacion'],
    dificultad: 'tecnico',
    herramientas: ['manual']
  },
  'NIVELES Y MEDIDORES DE ANGULOS': {
    uso: ['instalacion'],
    dificultad: 'basico',
    herramientas: ['manual']
  },
  'CABALLETES Y SISTEMAS DE ALMACENAJE': {
    uso: ['instalacion'],
    dificultad: 'basico',
    herramientas: ['manual']
  },
  'CARROS DE TRANSPORTE': {
    uso: ['instalacion'],
    dificultad: 'basico',
    herramientas: ['manual']
  },
  'SISTEMAS DE FLEJADO': {
    uso: ['instalacion'],
    dificultad: 'basico',
    herramientas: ['manual']
  },
  'HERRAMIENTAS PARA INGLETES Y JUNTAS': {
    uso: ['instalacion'],
    dificultad: 'tecnico',
    herramientas: ['manual']
  },
  'HERRAMIENTAS CORTE PORCELÁNICO': {
    uso: ['corte'],
    materiales: ['Porcelánico'],
    dificultad: 'tecnico',
    herramientas: ['manual','amoladora']
  },
  'AMOLADORAS ELÉCTRICAS': {
    uso: ['corte','pulido'],
    dificultad: 'tecnico',
    herramientas: ['amoladora']
  },
  'LIJADORAS Y PULIDORAS': {
    uso: ['pulido'],
    dificultad: 'tecnico',
    herramientas: ['pulidora']
  },
  'HERRAMIENTAS NEUMÁTICAS': {
    uso: ['corte','pulido'],
    dificultad: 'tecnico',
    herramientas: ['compresor']
  },
  'TALADROS': {
    uso: ['corte'],
    dificultad: 'tecnico',
    herramientas: ['taladro']
  }
};

/* ── ATRIBUTS PER PRODUCTE (per ref, override) ── */
var PRODUCT_KNOWLEDGE = {};

/* ── FUNCIÓ PRINCIPAL: obté coneixement complet d'un producte ── */
function getProductKnowledge(p, idx){
  if(!p) return null;
  var sec = (p.s||'').trim();
  var fam = p.fam||'';
  var nL = (p.n||'').toLowerCase();
  
  var k = {
    uso: null,
    materiales: null,
    noMateriales: [],
    interior: true,
    exterior: false,
    temperatura: null,
    tiempoAbierto: null,
    resistenciaUV: null,
    resistenciaQuimica: null,
    alimentario: null,
    color: null,
    viscosidad: null,
    dificultad: null,
    herramientas: null,
    complementarios: []
  };
  
  if(PRODUCT_KNOWLEDGE[p.r]){
    var ov = PRODUCT_KNOWLEDGE[p.r];
    for(var key in ov) if(ov.hasOwnProperty(key)) k[key] = ov[key];
  } else if(SECTION_KNOWLEDGE[sec]){
    var sk = SECTION_KNOWLEDGE[sec];
    for(var key2 in sk) if(sk.hasOwnProperty(key2)) k[key2] = sk[key2];
  }
  
  if(!k.uso) k.uso = _inferUso(sec);
  if(k.materiales === null) k.materiales = _inferMateriales(sec);
  if(p.aplic && p.aplic.length){
    if(!k.materiales) k.materiales = [];
    p.aplic.forEach(function(a){ if(k.materiales.indexOf(a)===-1) k.materiales.push(a); });
  }
  if(!k.dificultad) k.dificultad = _infDif(sec, fam);
  if(!k.herramientas) k.herramientas = _infHerramientas(sec);
  if(k.interior === undefined) k.interior = _infInterior(sec, fam);
  if(k.exterior === undefined) k.exterior = _infExterior(sec, fam);
  
  return k;
}

/* ── OBTÉ EINES COM A TEXT LLEGIBLE ── */
function getToolLabel(t){
  return {amoladora:'Amoladora',talladora:'Talladora de pont',pulidora:'Pulidora',cnc:'CNC',manual:'Eina manual',taladro:'Taladre',compresor:'Compressor'}[t]||t;
}

/* ── OBTÉ DIFICULTAT COM A TEXT LLEGIBLE ── */
function getDifficultyLabel(d){
  return {basico:'Bàsic',tecnico:'Tècnic',profesional:'Professional'}[d]||d;
}

/* ── OBTÉ ÚS COM A TEXT LLEGIBLE ── */
function getUsoLabel(u){
  return {corte:'Tall',pegado:'Enganxat',pulido:'Polit',reparacion:'Reparació',instalacion:'Instal·lació'}[u]||u;
}

/* ── RAONAMENT: puntua productes per compatibilitat amb respostes de l'assessor ── */
function scoreProductByKnowledge(p, idx, answers){
  var k = getProductKnowledge(p, idx);
  if(!k) return 0;
  var score = 0;
  
  // 1. Compatibilitat d'ús (work) — alt pes
  if(answers.work && k.uso){
    var workMap = {cut:'corte',glue:'pegado',polish:'pulido',repair:'reparacion',install:'instalacion'};
    var targetUso = workMap[answers.work];
    if(targetUso && k.uso.indexOf(targetUso) > -1) score += 30;
  }
  
  // 2. Compatibilitat de material — alt pes
  if(answers.material && k.materiales){
    if(k.materiales.indexOf(answers.material) > -1) score += 25;
    if(k.noMateriales.indexOf(answers.material) > -1) score -= 99;
  }
  
  // 3. Entorn (interior/exterior)
  if(answers.environment === 'exterior' && k.exterior) score += 15;
  if(answers.environment === 'interior' && k.interior) score += 10;
  
  // 4. Màquina compatible
  if(answers.machine && k.herramientas){
    var machineMap = {grinder:'amoladora',bridge:'talladora',cnc:'cnc',polisher:'pulidora',manual:'manual'};
    var targetTool = machineMap[answers.machine];
    if(targetTool && k.herramientas.indexOf(targetTool) > -1) score += 12;
  }
  
  // 5. Dificultat
  if(answers.finish && k.dificultad){
    if(answers.finish === 'invisible' && k.dificultad === 'profesional') score += 8;
    if(answers.finish === 'premium' && (k.dificultad === 'tecnico' || k.dificultad === 'profesional')) score += 5;
    if(answers.finish === 'functional' && k.dificultad === 'basico') score += 3;
  }
  
  // 6. Gruix (per discos i eines de tall)
  if(answers.thickness && k.uso && k.uso.indexOf('corte') > -1){
    if(answers.thickness === 'thin') score += 3;
    if(answers.thickness === 'standard') score += 5;
    if(answers.thickness === 'thick') score += 8;
  }
  
  return score;
}

/* ── CERCA PRODUCTES COMPLEMENTARIS (mateixa família, diferent ús) ── */
function getComplementaryFor(p, idx, allProds){
  if(!p) return [];
  var k = getProductKnowledge(p, idx);
  var result = [];
  for(var i=0;i<allProds.length;i++){
    if(i===idx) continue;
    var op = allProds[i];
    if(op.fam !== p.fam) continue;
    var ok = getProductKnowledge(op, i);
    if(!ok || !ok.uso) continue;
    var usesMatch = false;
    if(k.uso && ok.uso){
      for(var u=0;u<ok.uso.length;u++){
        if(k.uso.indexOf(ok.uso[u]) === -1){ usesMatch=true; break; }
      }
    }
    if(usesMatch) result.push(i);
    if(result.length >= 6) break;
  }
  return result;
}

/* ── EXPOSAR AL GLOBAL ── */
window.NEXE_KNOWLEDGE = {
  meta: ATTR_META,
  getProductKnowledge: getProductKnowledge,
  scoreProductByKnowledge: scoreProductByKnowledge,
  getComplementaryFor: getComplementaryFor,
  getToolLabel: getToolLabel,
  getDifficultyLabel: getDifficultyLabel,
  getUsoLabel: getUsoLabel,
  SECTION_KNOWLEDGE: SECTION_KNOWLEDGE,
  PRODUCT_KNOWLEDGE: PRODUCT_KNOWLEDGE
};

})();

