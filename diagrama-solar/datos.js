// ============================================================
// datos.js — Configuración y constantes del sistema solar
// Copilot: este archivo contiene los datos de configuración
// del sistema fotovoltaico interconectado a CFE
// ============================================================

// Paletas de colores para cada tema del diagrama
// Copilot hint: cada tema tiene fondo, texto, colores de cable y componentes
const TEMAS = {
  dark: {
    fondo: '#0a0d14',
    fondoCanvas: '#111827',
    texto: '#e2e8f0',
    textoSub: '#94a3b8',
    borde: '#374151',
    panel: { fondo: '#1e3a5f', borde: '#3b82f6', texto: '#93c5fd', celda: '#2563eb' },
    inversor: { fondo: '#14532d', borde: '#4ade80', texto: '#86efac' },
    protDC: { fondo: '#78350f', borde: '#f59e0b', texto: '#fcd34d' },
    tablero: { fondo: '#4a1d96', borde: '#a78bfa', texto: '#c4b5fd' },
    medidor: { fondo: '#7c2d12', borde: '#fb923c', texto: '#fdba74' },
    redCFE: { fondo: '#7f1d1d', borde: '#f87171', texto: '#fca5a5' },
    tierra: { fondo: '#14532d', borde: '#4ade80', texto: '#86efac' },
    dps: { fondo: '#1e1b4b', borde: '#818cf8', texto: '#a5b4fc' },
    cableDCpos: '#ef4444',
    cableDCneg: '#9ca3af',
    cableAC: '#60a5fa',
    cableTierra: '#4ade80',
    sombra: 'rgba(0,0,0,0.5)',
    grid: 'rgba(255,255,255,0.03)',
  },
  light: {
    fondo: '#ffffff',
    fondoCanvas: '#f8fafc',
    texto: '#111827',
    textoSub: '#6b7280',
    borde: '#d1d5db',
    panel: { fondo: '#dbeafe', borde: '#3b82f6', texto: '#1e40af', celda: '#93c5fd' },
    inversor: { fondo: '#dcfce7', borde: '#16a34a', texto: '#166534' },
    protDC: { fondo: '#fef3c7', borde: '#d97706', texto: '#92400e' },
    tablero: { fondo: '#ede9fe', borde: '#7c3aed', texto: '#4c1d95' },
    medidor: { fondo: '#fff7ed', borde: '#ea580c', texto: '#7c2d12' },
    redCFE: { fondo: '#fee2e2', borde: '#dc2626', texto: '#7f1d1d' },
    tierra: { fondo: '#dcfce7', borde: '#16a34a', texto: '#166534' },
    dps: { fondo: '#eef2ff', borde: '#4f46e5', texto: '#312e81' },
    cableDCpos: '#dc2626',
    cableDCneg: '#374151',
    cableAC: '#2563eb',
    cableTierra: '#16a34a',
    sombra: 'rgba(0,0,0,0.08)',
    grid: 'rgba(0,0,0,0.04)',
  },
  blueprint: {
    fondo: '#0d1b2a',
    fondoCanvas: '#112240',
    texto: '#cfe2f3',
    textoSub: '#7ab4d6',
    borde: '#1e6091',
    panel: { fondo: '#0a3d62', borde: '#74b9ff', texto: '#cfe2f3', celda: '#1e6091' },
    inversor: { fondo: '#0a3d62', borde: '#74b9ff', texto: '#cfe2f3' },
    protDC: { fondo: '#0a3d62', borde: '#74b9ff', texto: '#cfe2f3' },
    tablero: { fondo: '#0a3d62', borde: '#74b9ff', texto: '#cfe2f3' },
    medidor: { fondo: '#0a3d62', borde: '#74b9ff', texto: '#cfe2f3' },
    redCFE: { fondo: '#0a3d62', borde: '#74b9ff', texto: '#cfe2f3' },
    tierra: { fondo: '#0a3d62', borde: '#55efc4', texto: '#55efc4' },
    dps: { fondo: '#0a3d62', borde: '#74b9ff', texto: '#cfe2f3' },
    cableDCpos: '#ff7675',
    cableDCneg: '#b2bec3',
    cableAC: '#74b9ff',
    cableTierra: '#55efc4',
    sombra: 'rgba(0,0,0,0.4)',
    grid: 'rgba(116,185,255,0.05)',
  }
};

// Especificaciones técnicas de componentes de la cotización Syscom
// Copilot hint: estos datos se usan para las etiquetas de los componentes en el diagrama
const ESPECIFICACIONES = {
  panel: {
    modelo: 'Leapton LP182*210M66NB',
    voc: 50.9,      // Voltaje de circuito abierto (V)
    vmpp: 42.6,     // Voltaje en punto máximo (V)
    isc: 15.26,     // Corriente de cortocircuito (A)
    impp: 14.56,    // Corriente en punto máximo (A)
    eficiencia: 21.3,
    tipo: 'Monocristalino PERC',
  },
  inversor: {
    modelo: 'Growatt MIC3300TLX2',
    vdcMin: 80,
    vdcMax: 550,
    vmppMin: 80,
    vmppMax: 500,
    vac: 220,
    frecuencia: 60,
    eficiencia: 97.5,
    thd: 3,
    factorPotencia: 0.99,
    mppt: 1,
  },
  protDC: {
    modelo: 'FPV632PC40',
    polos: 2,
    amperaje: 40,
    voltaje: 800,
  },
  gabinete: {
    modelo: 'F56CB4N',
    tipo: 'Intemperie',
    montaje: 'Riel DIN',
  },
};

// Función para leer todos los valores del formulario
// Copilot hint: retorna un objeto con todos los parámetros del sistema
function leerParametros() {
  return {
    nombre: document.getElementById('inpNombre').value,
    noServicio: document.getElementById('inpServicio').value,
    direccion: document.getElementById('inpDireccion').value,
    tarifa: document.getElementById('inpTarifa').value,
    numPaneles: parseInt(document.getElementById('inpPaneles').value) || 2,
    wattsPanel: parseFloat(document.getElementById('inpWatts').value) || 620,
    kwInversor: parseFloat(document.getElementById('inpInversor').value) || 3.3,
    voltajeAC: document.getElementById('inpVoltaje').value,
    configPaneles: document.getElementById('inpConfig').value,
    protDC: parseInt(document.getElementById('inpProtDC').value) || 40,
    protAC: parseInt(document.getElementById('inpProtAC').value) || 20,
    mostrarTierra: document.getElementById('chkTierra').checked,
    mostrarDPS: document.getElementById('chkDPS').checked,
    tema: document.getElementById('inpTema').value,
    escala: parseFloat(document.getElementById('inpEscala').value) / 100 || 1,
  };
}
