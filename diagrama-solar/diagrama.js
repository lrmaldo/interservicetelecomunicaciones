// ============================================================
// diagrama.js — Lógica principal de layout y renderizado
// Este archivo orquesta el dibujo completo del diagrama
// unifilar del sistema fotovoltaico interconectado a CFE
// ============================================================

// Variables globales del canvas
let canvas, ctx, escalaActual = 1;

// Inicializar el canvas al cargar
window.addEventListener('load', () => {
  canvas = document.getElementById('canvasDiagrama');
  ctx = canvas.getContext('2d');
  redibujar();
});

// Actualiza la escala desde el slider sin redibujar todo
// @param valor - valor del slider (50-150)
function actualizarEscala(valor) {
  escalaActual = parseFloat(valor) / 100;
  document.getElementById('lblEscala').textContent = valor + '%';
  redibujar();
}

// Función principal: lee parámetros y dibuja el diagrama completo
function redibujar() {
  if (!canvas || !ctx) return;
  const params = leerParametros();
  const tema = TEMAS[params.tema] || TEMAS.dark;

  // Ajustar tamaño del canvas según escala
  canvas.width = Math.round(1200 * params.escala);
  canvas.height = Math.round(650 * params.escala);

  ctx.save();
  ctx.scale(params.escala, params.escala);

  // Limpiar y dibujar fondo
  dibujarFondo(ctx, tema);

  // Calcular layout dinámico según número de paneles
  const layout = calcularLayout(params);

  // Dibujar componentes en orden (fondo → cables → encima)
  dibujarTitulo(ctx, params, tema);
  dibujarPaneles(ctx, params, layout, tema);
  dibujarProteccionDCComp(ctx, params, layout, tema);
  dibujarInversorComp(ctx, params, layout, tema);
  dibujarTableroComp(ctx, params, layout, tema);
  dibujarMedidorComp(ctx, params, layout, tema);
  dibujarRedCFEComp(ctx, params, layout, tema);

  // Cables (se dibujan después para que pasen por encima del fondo pero debajo de textos)
  dibujarTodosCables(ctx, params, layout, tema);

  // Tierra y DPS (opcionales)
  if (params.mostrarTierra) dibujarTierras(ctx, params, layout, tema);
  if (params.mostrarDPS) dibujarDPSComp(ctx, params, layout, tema);

  // Leyenda y pie de página
  dibujarLeyenda(ctx, tema);
  dibujarPie(ctx, params, tema);

  ctx.restore();

  // Actualizar info en la toolbar
  const kwp = ((params.numPaneles * params.wattsPanel) / 1000).toFixed(2);
  document.getElementById('lblInfo').textContent =
    `Sistema: ${params.numPaneles} paneles × ${params.wattsPanel}W = ${kwp} kWp · Inversor: ${params.kwInversor}kW`;
  document.getElementById('badgeEstado').textContent = 'Listo';
}

// ─────────────────────────────────────────────
// FONDO DEL CANVAS
// ─────────────────────────────────────────────

// Dibuja el fondo del canvas con grilla sutil y borde
// @param ctx, tema
function dibujarFondo(ctx, tema) {
  // Fondo sólido
  ctx.fillStyle = tema.fondoCanvas;
  ctx.fillRect(0, 0, 1200, 650);

  // Copilot hint: dibuja una grilla de puntos sutiles cada 20px
  // usando tema.grid como color, en todo el canvas 1200x650
  ctx.fillStyle = tema.grid;
  for (let gx = 20; gx < 1200; gx += 20) {
    for (let gy = 20; gy < 650; gy += 20) {
      ctx.fillRect(gx - 0.5, gy - 0.5, 1, 1);
    }
  }

  // Borde del canvas
  ctx.strokeStyle = tema.borde;
  ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, 1198, 648);
}

// ─────────────────────────────────────────────
// LAYOUT DINÁMICO
// ─────────────────────────────────────────────

// Calcula las posiciones X,Y de cada componente según el número de paneles
// @param params - parámetros leídos del formulario
// @returns objeto con coordenadas de cada componente
function calcularLayout(params) {
  const n = params.numPaneles;
  // Copilot hint: calcula cuántas columnas y filas de paneles se necesitan
  // para que quepan en la zona izquierda del canvas (hasta x=250)
  // cada panel mide 70x55px con separación de 10px
  const cols = n <= 4 ? 1 : n <= 8 ? 2 : 3;
  const filas = Math.ceil(n / cols);
  const panelW = 70, panelH = 55, sep = 10;
  const grupoW = cols * panelW + (cols - 1) * sep;
  const grupoH = filas * panelH + (filas - 1) * sep;
  const panelX = 30;
  const panelY = 120 + (320 - grupoH) / 2; // centrar verticalmente

  // Posiciones fijas de los componentes del circuito (eje horizontal Y=280)
  const midY = 280;
  const compH = 80;
  const protDCX = 200, protDCW = 60;
  const inversorX = 340, inversorW = 130;
  const tableroX = 540, tableroW = 80;
  const medidorX = 690, medidorW = 90;
  const redX = 860;

  return {
    n, cols, filas, panelW, panelH, sep, grupoW, grupoH, panelX, panelY,
    midY, compH,
    protDC: { x: protDCX, y: midY - compH / 2, w: protDCW, h: compH },
    inversor: { x: inversorX, y: midY - compH / 2 - 10, w: inversorW, h: compH + 20 },
    tablero: { x: tableroX, y: midY - compH / 2, w: tableroW, h: compH },
    medidor: { x: medidorX, y: midY - compH / 2, w: medidorW, h: compH },
    redCFE: { x: redX, y: midY - 40 },
    tierra: { inversorX: inversorX + inversorW / 2, tableroX: tableroX + tableroW / 2, y: midY + compH / 2 + 30 },
    dps: { x: protDCX + protDCW / 2 - 20, y: midY - compH / 2 - 70, w: 40, h: 40 },
  };
}

// ─────────────────────────────────────────────
// TÍTULO Y DATOS
// ─────────────────────────────────────────────

// Dibuja el título, datos del titular y especificaciones en la parte superior
// @param ctx, params, tema
function dibujarTitulo(ctx, params, tema) {
  const kwp = ((params.numPaneles * params.wattsPanel) / 1000).toFixed(2);
  const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long' });

  // Copilot hint: dibuja un rectángulo de encabezado de 1160x50px en y=10
  // con borde tema.borde, fondo semitransparente, y dentro el título a la izquierda
  // y los datos del titular a la derecha, en fuente monoespaciada
  dibujarCaja(ctx, 10, 10, 1180, 55, 4, tema.fondoCanvas, tema.borde, false);

  dibujarTexto(ctx, 'DIAGRAMA UNIFILAR — SISTEMA FOTOVOLTAICO INTERCONECTADO CFE',
    20, 28, '600 11px IBM Plex Mono', tema.texto, 'left');
  dibujarTexto(ctx, `${kwp} kWp · ${params.numPaneles} paneles ${params.wattsPanel}W · Inversor ${params.kwInversor}kW`,
    20, 46, '400 9px IBM Plex Mono', tema.textoSub, 'left');

  dibujarTexto(ctx, `Titular: ${params.nombre}`, 1185, 22, '400 9px IBM Plex Mono', tema.textoSub, 'right');
  dibujarTexto(ctx, `No. Servicio: ${params.noServicio} · Tarifa ${params.tarifa} · ${fecha}`,
    1185, 38, '400 9px IBM Plex Mono', tema.textoSub, 'right');
  dibujarTexto(ctx, params.direccion, 1185, 54, '400 8px IBM Plex Mono', tema.textoSub, 'right');
}

// ─────────────────────────────────────────────
// COMPONENTES (wrappers que usan calcularLayout)
// ─────────────────────────────────────────────

// Dibuja todos los paneles del arreglo fotovoltaico
// Copilot hint: itera de 0 a params.numPaneles-1 y calcula x,y de cada panel
// usando cols, filas, panelW, panelH, sep de layout
function dibujarPaneles(ctx, params, layout, tema) {
  for (let i = 0; i < layout.n; i++) {
    const col = i % layout.cols;
    const fila = Math.floor(i / layout.cols);
    const px = layout.panelX + col * (layout.panelW + layout.sep);
    const py = layout.panelY + fila * (layout.panelH + layout.sep);
    dibujarPanel(ctx, px, py, layout.panelW, layout.panelH,
      `P${i + 1}`, params.wattsPanel, tema);
  }

  // Etiqueta del grupo de paneles
  dibujarTexto(ctx,
    `Arreglo FV · ${layout.n} paneles en ${params.configPaneles}`,
    layout.panelX + layout.grupoW / 2, layout.panelY - 14,
    '500 9px IBM Plex Mono', tema.textoSub);

  // Bracket lateral izquierdo indicando el grupo
  // Copilot hint: dibuja dos líneas cortas horizontales y una línea vertical
  // en x=panelX-12, desde panelY hasta panelY+grupoH, indicando el grupo
  ctx.save();
  ctx.strokeStyle = tema.borde;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 2]);
  ctx.beginPath();
  ctx.moveTo(layout.panelX - 12, layout.panelY);
  ctx.lineTo(layout.panelX - 4, layout.panelY);
  ctx.moveTo(layout.panelX - 12, layout.panelY);
  ctx.lineTo(layout.panelX - 12, layout.panelY + layout.grupoH);
  ctx.lineTo(layout.panelX - 4, layout.panelY + layout.grupoH);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

// Dibuja la protección DC en su posición del layout
function dibujarProteccionDCComp(ctx, params, layout, tema) {
  const { x, y, w, h } = layout.protDC;
  dibujarProteccionDC(ctx, x, y, w, h, params.protDC, 800, tema);
  dibujarTexto(ctx, 'PROT. DC', x + w / 2, y - 12, '500 8px IBM Plex Mono', tema.textoSub);
  dibujarTexto(ctx, ESPECIFICACIONES.protDC.modelo, x + w / 2, y + h + 10, '400 7px IBM Plex Sans', tema.textoSub);
}

// Dibuja el inversor en su posición del layout
function dibujarInversorComp(ctx, params, layout, tema) {
  const { x, y, w, h } = layout.inversor;
  dibujarInversor(ctx, x, y, w, h, params.kwInversor, 'Growatt', tema);
  dibujarTexto(ctx, ESPECIFICACIONES.inversor.modelo, x + w / 2, y + h + 12, '400 7px IBM Plex Sans', tema.textoSub);
}

// Dibuja el tablero en su posición del layout
function dibujarTableroComp(ctx, params, layout, tema) {
  const { x, y, w, h } = layout.tablero;
  dibujarTablero(ctx, x, y, w, h, params.protAC, tema);
  dibujarTexto(ctx, 'TABLERO', x + w / 2, y - 12, '500 8px IBM Plex Mono', tema.textoSub);
  dibujarTexto(ctx, ESPECIFICACIONES.gabinete.modelo, x + w / 2, y + h + 10, '400 7px IBM Plex Sans', tema.textoSub);
}

// Dibuja el medidor bidireccional en su posición
function dibujarMedidorComp(ctx, params, layout, tema) {
  const { x, y, w, h } = layout.medidor;
  dibujarMedidor(ctx, x, y, w, h, tema);
  dibujarTexto(ctx, 'MEDIDOR BIDIR.', x + w / 2, y - 12, '500 8px IBM Plex Mono', tema.textoSub);
  dibujarTexto(ctx, 'CFE Neta medición', x + w / 2, y + h + 10, '400 7px IBM Plex Sans', tema.textoSub);
}

// Dibuja el poste de red CFE
function dibujarRedCFEComp(ctx, params, layout, tema) {
  dibujarRedCFE(ctx, layout.redCFE.x, layout.redCFE.y, tema);
}

// Dibuja el DPS si está habilitado
function dibujarDPSComp(ctx, params, layout, tema) {
  const { x, y, w, h } = layout.dps;
  dibujarDPS(ctx, x, y, w, h, tema);
}

// Dibuja las tierras físicas bajo inversor y tablero
function dibujarTierras(ctx, params, layout, tema) {
  const ty = layout.tierra.y;
  dibujarTierra(ctx, layout.tierra.inversorX, ty, tema);
  dibujarTierra(ctx, layout.tierra.tableroX, ty, tema);
  // Cable de tierra desde los componentes
  dibujarCable(ctx, layout.tierra.inversorX, layout.inversor.y + layout.inversor.h,
    layout.tierra.inversorX, ty, 'tierra', tema, 1.5);
  dibujarCable(ctx, layout.tierra.tableroX, layout.tablero.y + layout.tablero.h,
    layout.tierra.tableroX, ty, 'tierra', tema, 1.5);
}

// ─────────────────────────────────────────────
// CABLES PRINCIPALES
// ─────────────────────────────────────────────

// Dibuja todos los cables del sistema (DC y AC)
// Copilot hint: conecta en orden: paneles→protDC, protDC→inversor,
// inversor→tablero, tablero→medidor, medidor→redCFE
// usando dibujarCable() con los tipos correctos
function dibujarTodosCables(ctx, params, layout, tema) {
  const midY = layout.midY;

  // ── Punto de unión de todos los paneles (nodo de paralelo) ──
  const nodoX = layout.panelX + layout.grupoW + 20;
  const nodoY = midY;

  // Cable desde cada panel al nodo de unión
  // Copilot hint: para cada panel, traza un cable dc-pos desde el terminal +
  // y un cable dc-neg desde el terminal - hasta el nodoX
  for (let i = 0; i < layout.n; i++) {
    const col = i % layout.cols;
    const fila = Math.floor(i / layout.cols);
    const px = layout.panelX + col * (layout.panelW + layout.sep);
    const py = layout.panelY + fila * (layout.panelH + layout.sep);
    const termPosX = px + layout.panelW - 6;
    const termPosY = py + layout.panelH - 6;
    const termNegX = px + 6;
    const termNegY = py + layout.panelH - 6;

    dibujarCable(ctx, termPosX, termPosY, nodoX, nodoY - 4, 'dc-pos', tema, 1.5, nodoX - 5);
    dibujarCable(ctx, termNegX, termNegY, nodoX, nodoY + 4, 'dc-neg', tema, 1.5, nodoX - 5);
  }

  // Nodo de unión (punto de cruce)
  dibujarNodo(ctx, nodoX, nodoY - 4, tema.cableDCpos);
  dibujarNodo(ctx, nodoX, nodoY + 4, tema.cableDCneg);

  // ── Nodo → Protección DC ──
  const pdc = layout.protDC;
  dibujarCable(ctx, nodoX, nodoY - 4, pdc.x, pdc.y + pdc.h / 2 - 4, 'dc-pos', tema, 2);
  dibujarCable(ctx, nodoX, nodoY + 4, pdc.x, pdc.y + pdc.h / 2 + 4, 'dc-neg', tema, 2);
  dibujarEtiquetaCable(ctx, (nodoX + pdc.x) / 2, nodoY - 14, `DC ${(ESPECIFICACIONES.panel.vmpp * 2).toFixed(0)}V`, tema.cableDCpos, tema);

  // ── Protección DC → Inversor ──
  const inv = layout.inversor;
  dibujarCable(ctx, pdc.x + pdc.w, pdc.y + pdc.h / 2 - 4, inv.x, inv.y + inv.h / 2 - 4, 'dc-pos', tema, 2);
  dibujarCable(ctx, pdc.x + pdc.w, pdc.y + pdc.h / 2 + 4, inv.x, inv.y + inv.h / 2 + 4, 'dc-neg', tema, 2);

  // ── Inversor → Tablero (AC) ──
  const tab = layout.tablero;
  dibujarCable(ctx, inv.x + inv.w, inv.y + inv.h / 2, tab.x, tab.y + tab.h / 2, 'ac', tema, 2.5);
  dibujarEtiquetaCable(ctx, (inv.x + inv.w + tab.x) / 2, inv.y + inv.h / 2 - 12,
    `AC ${params.voltajeAC}V`, tema.cableAC, tema);

  // ── Tablero → Medidor ──
  const med = layout.medidor;
  dibujarCable(ctx, tab.x + tab.w, tab.y + tab.h / 2, med.x, med.y + med.h / 2, 'ac', tema, 2.5);

  // ── Medidor → Red CFE ──
  const rCFE = layout.redCFE;
  dibujarCable(ctx, med.x + med.w, med.y + med.h / 2, rCFE.x - 18, rCFE.y + 24, 'ac', tema, 2.5);
  dibujarEtiquetaCable(ctx, (med.x + med.w + rCFE.x) / 2, med.y + med.h / 2 - 12,
    'Cal. 10 AWG', tema.cableAC, tema);
}

// ─────────────────────────────────────────────
// LEYENDA Y PIE
// ─────────────────────────────────────────────

// Dibuja la leyenda de tipos de cables en la esquina inferior izquierda
function dibujarLeyenda(ctx, tema) {
  const x = 10, y = 580, h = 50;
  dibujarCaja(ctx, x, y, 560, h, 4, tema.fondoCanvas, tema.borde, false);

  const items = [
    { color: tema.cableDCpos, dash: false, label: 'DC positivo (+)' },
    { color: tema.cableDCneg, dash: false, label: 'DC negativo (−)' },
    { color: tema.cableAC,    dash: false, label: 'AC 220V (fase/neutro)' },
    { color: tema.cableTierra, dash: true, label: 'Tierra física' },
  ];

  dibujarTexto(ctx, 'LEYENDA:', x + 10, y + 14, '500 8px IBM Plex Mono', tema.textoSub, 'left');

  items.forEach((item, i) => {
    const ix = x + 80 + i * 120;
    const iy = y + 14;
    ctx.save();
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 2;
    if (item.dash) ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(ix, iy); ctx.lineTo(ix + 24, iy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    dibujarTexto(ctx, item.label, ix + 28, iy, '400 8px IBM Plex Sans', tema.textoSub, 'left');
  });

  dibujarTexto(ctx, 'MC4', x + 10, y + 36, '400 8px IBM Plex Mono', tema.textoSub, 'left');
  ctx.save();
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = tema.borde;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(x + 36, y + 36, 5, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.restore();
  dibujarTexto(ctx, 'Conector MC4 solar', x + 46, y + 36, '400 8px IBM Plex Sans', tema.textoSub, 'left');
}

// Dibuja el pie de página con normas y datos del sistema
function dibujarPie(ctx, params, tema) {
  const kwp = ((params.numPaneles * params.wattsPanel) / 1000).toFixed(2);
  dibujarCaja(ctx, 580, 580, 610, 50, 4, tema.fondoCanvas, tema.borde, false);
  dibujarTexto(ctx,
    `Sistema ${kwp}kWp · Interconexión CFE pequeña escala · ${params.direccion}`,
    1185, 594, '400 8px IBM Plex Mono', tema.textoSub, 'right');
  dibujarTexto(ctx,
    'NOM-001-SEDE-2012 · NOM-002-SEDE-2014 · Acuerdo CFE interconexión pequeña escala',
    1185, 614, '400 8px IBM Plex Mono', tema.textoSub, 'right');
}

// ─────────────────────────────────────────────
// EXPORTAR / IMPRIMIR
// ─────────────────────────────────────────────

// Descarga el canvas actual como imagen PNG
// Copilot hint: usa canvas.toDataURL('image/png') y crea un <a> temporal para descargar
function exportarPNG() {
  const params = leerParametros();
  const link = document.createElement('a');
  link.download = `diagrama-solar-${params.noServicio || 'cfe'}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Abre ventana de impresión con el canvas escalado a tamaño carta horizontal
// Copilot hint: crea una nueva ventana con el canvas como imagen,
// define @media print para que llene la hoja carta landscape sin márgenes
function imprimirDiagrama() {
  const imgData = canvas.toDataURL('image/png');
  const ventana = window.open('', '_blank');
  ventana.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Diagrama Solar CFE</title>
  <style>
    @page { size: letter landscape; margin: 0.5cm; }
    body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; }
    img { max-width: 100%; max-height: 100%; object-fit: contain; }
  </style>
</head>
<body>
  <img src="${imgData}" />
  <script>window.onload = () => { window.print(); window.close(); }<\/script>
</body>
</html>`);
  ventana.document.close();
}
