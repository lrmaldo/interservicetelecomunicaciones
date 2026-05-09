// ============================================================
// componentes.js — Funciones de dibujo de componentes eléctricos
// Cada función recibe el contexto 2D del canvas y parámetros
// de posición. Copilot puede completar/extender cada función.
// ============================================================

// ─────────────────────────────────────────────
// UTILIDADES DE DIBUJO
// ─────────────────────────────────────────────

// Dibuja una caja redondeada con relleno, borde y sombra opcional
// @param ctx - contexto 2D
// @param x, y - esquina superior izquierda
// @param w, h - ancho y alto
// @param radio - radio de esquinas
// @param colorFondo, colorBorde - colores de la caja
// @param sombra - bool para activar sombra
function dibujarCaja(ctx, x, y, w, h, radio, colorFondo, colorBorde, sombra = false) {
  ctx.save();
  if (sombra) {
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
  }
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radio);
  ctx.fillStyle = colorFondo;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = colorBorde;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

// Dibuja texto centrado en una posición con fuente personalizable
// @param ctx - contexto 2D
// @param texto - string a mostrar
// @param x, y - posición central
// @param fuente - string CSS de fuente
// @param color - color del texto
// @param alineacion - 'center' | 'left' | 'right'
function dibujarTexto(ctx, texto, x, y, fuente, color, alineacion = 'center') {
  ctx.save();
  ctx.font = fuente;
  ctx.fillStyle = color;
  ctx.textAlign = alineacion;
  ctx.textBaseline = 'middle';
  ctx.fillText(texto, x, y);
  ctx.restore();
}

// Dibuja una flecha al final de una línea
// @param ctx - contexto 2D
// @param x, y - punta de la flecha
// @param angulo - ángulo en radianes (0 = derecha)
// @param tamaño - longitud de los brazos
// @param color - color de la flecha
function dibujarFlecha(ctx, x, y, angulo, tamaño = 8, color = '#fff') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - tamaño * Math.cos(angulo - Math.PI / 6), y - tamaño * Math.sin(angulo - Math.PI / 6));
  ctx.lineTo(x, y);
  ctx.lineTo(x - tamaño * Math.cos(angulo + Math.PI / 6), y - tamaño * Math.sin(angulo + Math.PI / 6));
  ctx.stroke();
  ctx.restore();
}

// ─────────────────────────────────────────────
// COMPONENTES ELÉCTRICOS
// ─────────────────────────────────────────────

// Dibuja un panel solar fotovoltaico con celdas internas
// @param ctx - contexto 2D del canvas
// @param x, y - esquina superior izquierda del panel
// @param w, h - ancho y alto del panel
// @param numero - número del panel (ej: "Panel 1")
// @param watts - potencia en watts
// @param tema - objeto de colores del tema actual
function dibujarPanel(ctx, x, y, w, h, numero, watts, tema) {
  const c = tema.panel;
  dibujarCaja(ctx, x, y, w, h, 4, c.fondo, c.borde, true);

  // Líneas internas simulando celdas solares
  // Copilot hint: dibuja una grilla de líneas dentro del panel
  // con 3 columnas y 4 filas usando c.celda como color
  const colsCelda = 3;
  const filasCelda = 4;
  ctx.save();
  ctx.strokeStyle = c.celda;
  ctx.lineWidth = 0.7;
  ctx.globalAlpha = 0.6;
  for (let i = 1; i < colsCelda; i++) {
    const px = x + (w / colsCelda) * i;
    ctx.beginPath(); ctx.moveTo(px, y + 4); ctx.lineTo(px, y + h - 4); ctx.stroke();
  }
  for (let j = 1; j < filasCelda; j++) {
    const py = y + (h / filasCelda) * j;
    ctx.beginPath(); ctx.moveTo(x + 4, py); ctx.lineTo(x + w - 4, py); ctx.stroke();
  }
  ctx.restore();

  // Etiquetas del panel
  dibujarTexto(ctx, numero, x + w / 2, y + h / 2 - 8, '500 10px IBM Plex Mono', c.texto);
  dibujarTexto(ctx, `${watts}W`, x + w / 2, y + h / 2 + 8, '400 9px IBM Plex Sans', c.texto);

  // Terminales + y - del panel (puntos de conexión)
  // Copilot hint: dibuja un círculo rojo (+) en la esquina inferior derecha
  // y un círculo gris (-) en la esquina inferior izquierda del panel
  ctx.save();
  ctx.fillStyle = tema.cableDCpos;
  ctx.beginPath(); ctx.arc(x + w - 6, y + h - 6, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = tema.cableDCneg;
  ctx.beginPath(); ctx.arc(x + 6, y + h - 6, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Dibuja el componente inversor de cadena con símbolo de alterna (~)
// @param ctx - contexto 2D
// @param x, y - esquina superior izquierda
// @param w, h - dimensiones
// @param kw - potencia en kW
// @param modelo - string del modelo
// @param tema - objeto de colores
function dibujarInversor(ctx, x, y, w, h, kw, modelo, tema) {
  const c = tema.inversor;
  dibujarCaja(ctx, x, y, w, h, 6, c.fondo, c.borde, true);

  // Copilot hint: dibuja el símbolo DC→AC dentro de la caja:
  // lado izquierdo "DC" con línea continua y línea punteada debajo
  // lado derecho "AC" con símbolo de onda senoidal (~)
  // separados por una línea vertical punteada en el centro

  // Símbolo DC (izquierda)
  ctx.save();
  ctx.strokeStyle = c.texto;
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x + 14, y + h / 2 - 6);
  ctx.lineTo(x + w / 2 - 6, y + h / 2 - 6);
  ctx.stroke();
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(x + 14, y + h / 2 - 1);
  ctx.lineTo(x + w / 2 - 6, y + h / 2 - 1);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Separador central
  ctx.save();
  ctx.strokeStyle = c.borde;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 2]);
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 8);
  ctx.lineTo(x + w / 2, y + h - 8);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Símbolo AC - onda senoidal (derecha)
  // Copilot hint: dibuja una onda senoidal suave entre x+w/2+8 y x+w-14
  // a la altura de y+h/2-4, con amplitud de 5px y color c.texto
  ctx.save();
  ctx.strokeStyle = c.texto;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const xStart = x + w / 2 + 8;
  const xEnd = x + w - 14;
  const yMid = y + h / 2 - 4;
  const amp = 5;
  for (let px = xStart; px <= xEnd; px++) {
    const t = (px - xStart) / (xEnd - xStart) * Math.PI * 2;
    const py = yMid - Math.sin(t) * amp;
    if (px === xStart) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();

  // Etiquetas
  dibujarTexto(ctx, 'INVERSOR', x + w / 2, y + h / 2 + 10, '600 9px IBM Plex Mono', c.texto);
  dibujarTexto(ctx, `${kw}kW · ${modelo}`, x + w / 2, y + h / 2 + 22, '400 8px IBM Plex Sans', c.texto);
  dibujarTexto(ctx, '220VAC · 60Hz', x + w / 2, y + h / 2 + 33, '400 8px IBM Plex Sans', c.texto);
}

// Dibuja la protección térmica DC (interruptor termomagnético)
// @param ctx - contexto 2D
// @param x, y - posición
// @param w, h - dimensiones
// @param amperaje - valor en amperios
// @param voltaje - valor en voltios DC
// @param tema - colores
function dibujarProteccionDC(ctx, x, y, w, h, amperaje, voltaje, tema) {
  const c = tema.protDC;
  dibujarCaja(ctx, x, y, w, h, 4, c.fondo, c.borde, true);

  // Copilot hint: dibuja el símbolo eléctrico de un interruptor termomagnético:
  // dos líneas verticales paralelas con un arco en el centro representando el mecanismo
  ctx.save();
  ctx.strokeStyle = c.texto;
  ctx.lineWidth = 1.5;
  // Línea de entrada
  ctx.beginPath(); ctx.moveTo(x + w / 2, y + 4); ctx.lineTo(x + w / 2, y + h / 3); ctx.stroke();
  // Arco del interruptor
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, h / 5, Math.PI * 0.8, Math.PI * 0.2, false);
  ctx.stroke();
  // Línea de salida
  ctx.beginPath(); ctx.moveTo(x + w / 2, y + h * 2 / 3); ctx.lineTo(x + w / 2, y + h - 4); ctx.stroke();
  ctx.restore();

  dibujarTexto(ctx, `${amperaje}A`, x + w / 2, y + h / 2 + 2, '600 9px IBM Plex Mono', c.texto);
  dibujarTexto(ctx, `${voltaje}VDC`, x + w / 2, y + h - 10, '400 8px IBM Plex Sans', c.texto);
}

// Dibuja el gabinete/tablero eléctrico con símbolo de interruptor AC
// @param ctx - contexto 2D
// @param x, y, w, h - posición y dimensiones
// @param amperajeAC - amperaje del interruptor
// @param tema - colores
function dibujarTablero(ctx, x, y, w, h, amperajeAC, tema) {
  const c = tema.tablero;
  dibujarCaja(ctx, x, y, w, h, 4, c.fondo, c.borde, true);

  // Copilot hint: dibuja el símbolo de un gabinete eléctrico:
  // una caja exterior con una caja interior más pequeña centrada,
  // y un pequeño interruptor (rectángulo con punto) en el centro
  ctx.save();
  ctx.strokeStyle = c.borde;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 8, y + 6, w - 16, h - 12);
  ctx.fillStyle = c.fondo;
  ctx.fillRect(x + 9, y + 7, w - 18, h - 14);
  // Interruptor interior
  ctx.fillStyle = c.texto;
  ctx.fillRect(x + w / 2 - 5, y + h / 2 - 7, 10, 10);
  ctx.restore();

  dibujarTexto(ctx, 'TABLERO', x + w / 2, y + h - 12, '600 8px IBM Plex Mono', c.texto);
  dibujarTexto(ctx, `${amperajeAC}A AC`, x + w / 2, y + h - 3, '400 7px IBM Plex Sans', c.texto);
}

// Dibuja el medidor bidireccional CFE con símbolo de medición
// @param ctx, x, y, w, h, tema
function dibujarMedidor(ctx, x, y, w, h, tema) {
  const c = tema.medidor;
  dibujarCaja(ctx, x, y, w, h, 6, c.fondo, c.borde, true);

  // Copilot hint: dibuja el símbolo de un medidor eléctrico:
  // un círculo con flechas bidireccionales (↑↓) representando
  // el flujo de energía en ambas direcciones (exportar/importar)
  ctx.save();
  ctx.strokeStyle = c.texto;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2 - 5, 10, 0, Math.PI * 2);
  ctx.stroke();
  // Flecha hacia arriba (exportar)
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h / 2 - 12);
  ctx.lineTo(x + w / 2, y + h / 2 - 18);
  ctx.stroke();
  dibujarFlecha(ctx, x + w / 2, y + h / 2 - 18, -Math.PI / 2, 5, c.texto);
  // Flecha hacia abajo (importar)
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h / 2 + 2);
  ctx.lineTo(x + w / 2, y + h / 2 + 8);
  ctx.stroke();
  dibujarFlecha(ctx, x + w / 2, y + h / 2 + 8, Math.PI / 2, 5, c.texto);
  ctx.restore();

  dibujarTexto(ctx, 'MEDIDOR', x + w / 2, y + h - 14, '600 8px IBM Plex Mono', c.texto);
  dibujarTexto(ctx, 'Bidireccional CFE', x + w / 2, y + h - 5, '400 7px IBM Plex Sans', c.texto);
}

// Dibuja el poste/símbolo de la red eléctrica CFE
// @param ctx, x, y, tema
function dibujarRedCFE(ctx, x, y, tema) {
  const c = tema.redCFE;

  // Copilot hint: dibuja un poste de luz estilizado:
  // - línea vertical de 80px (el poste)
  // - línea horizontal en la parte superior (el travesaño)
  // - dos líneas cortas colgando del travesaño (los cables)
  // - texto "RED CFE" y "220V/60Hz" debajo
  ctx.save();
  ctx.strokeStyle = c.borde;
  ctx.lineWidth = 3;
  // Poste
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 80); ctx.stroke();
  // Travesaño
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - 18, y + 10); ctx.lineTo(x + 18, y + 10); ctx.stroke();
  // Aisladores
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x - 14, y + 10); ctx.lineTo(x - 14, y + 22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 14, y + 10); ctx.lineTo(x + 14, y + 22); ctx.stroke();
  // Bolas de aislador
  ctx.fillStyle = c.borde;
  ctx.beginPath(); ctx.arc(x - 14, y + 24, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 14, y + 24, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  dibujarTexto(ctx, 'RED CFE', x, y + 92, '600 9px IBM Plex Mono', c.texto);
  dibujarTexto(ctx, '220V / 60Hz', x, y + 103, '400 8px IBM Plex Sans', c.texto);
}

// Dibuja el símbolo de tierra física (ground)
// @param ctx, x, y - punto donde conecta el cable de tierra
// @param tema
function dibujarTierra(ctx, x, y, tema) {
  const c = tema.tierra;

  // Copilot hint: dibuja el símbolo estándar de tierra eléctrica:
  // tres líneas horizontales descendentes, cada una más corta que la anterior,
  // con el cable vertical que conecta hacia arriba
  ctx.save();
  ctx.strokeStyle = c.borde;
  ctx.lineWidth = 2;
  // Cable vertical hacia abajo
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 16); ctx.stroke();
  // Líneas de tierra (la primera más larga)
  const anchos = [20, 14, 8];
  anchos.forEach((a, i) => {
    ctx.lineWidth = 2 - i * 0.4;
    ctx.beginPath();
    ctx.moveTo(x - a / 2, y + 16 + i * 5);
    ctx.lineTo(x + a / 2, y + 16 + i * 5);
    ctx.stroke();
  });
  ctx.restore();
}

// Dibuja un DPS (Dispositivo de Protección contra Sobretensiones / pararrayos DC)
// @param ctx, x, y, w, h, tema
function dibujarDPS(ctx, x, y, w, h, tema) {
  const c = tema.dps;
  dibujarCaja(ctx, x, y, w, h, 4, c.fondo, c.borde, false);

  // Copilot hint: dibuja el símbolo eléctrico de un varistor/DPS:
  // un rectángulo inclinado (rombo) con una línea diagonal que lo atraviesa,
  // representando la protección contra sobretensiones
  ctx.save();
  ctx.strokeStyle = c.texto;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 6);
  ctx.lineTo(x + w - 6, y + h / 2);
  ctx.lineTo(x + w / 2, y + h - 6);
  ctx.lineTo(x + 6, y + h / 2);
  ctx.closePath();
  ctx.stroke();
  // Línea diagonal de supresión
  ctx.beginPath();
  ctx.moveTo(x + 8, y + h - 8);
  ctx.lineTo(x + w - 8, y + 8);
  ctx.stroke();
  ctx.restore();

  dibujarTexto(ctx, 'DPS', x + w / 2, y + h + 10, '600 8px IBM Plex Mono', c.texto);
}

// ─────────────────────────────────────────────
// CABLES Y CONEXIONES
// ─────────────────────────────────────────────

// Dibuja un cable eléctrico entre dos puntos con esquinas ortogonales
// @param ctx - contexto 2D
// @param x1, y1 - punto origen
// @param x2, y2 - punto destino
// @param tipo - 'dc-pos' | 'dc-neg' | 'ac' | 'tierra'
// @param tema - objeto de colores del tema
// @param grosor - grosor de línea (default 2)
// @param puntoMedio - x opcional para hacer el doblez del cable
function dibujarCable(ctx, x1, y1, x2, y2, tipo, tema, grosor = 2, puntoMedio = null) {
  const colores = {
    'dc-pos': tema.cableDCpos,
    'dc-neg': tema.cableDCneg,
    'ac': tema.cableAC,
    'tierra': tema.cableTierra,
  };
  const color = colores[tipo] || '#fff';

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = grosor;
  if (tipo === 'tierra') ctx.setLineDash([6, 3]);

  ctx.beginPath();
  if (puntoMedio !== null) {
    // Cable con dos segmentos en L (horizontal luego vertical)
    ctx.moveTo(x1, y1);
    ctx.lineTo(puntoMedio, y1);
    ctx.lineTo(puntoMedio, y2);
    ctx.lineTo(x2, y2);
  } else {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Flecha al final del cable (excepto tierra)
  if (tipo !== 'tierra') {
    const angulo = Math.atan2(y2 - (puntoMedio ? y2 : y1), x2 - (puntoMedio ? puntoMedio : x1));
    dibujarFlecha(ctx, x2, y2, angulo, 7, color);
  }
  ctx.restore();
}

// Dibuja etiqueta de cable con tipo y calibre
// @param ctx, x, y - posición central de la etiqueta
// @param texto - ej: "Cal. 10 AWG"
// @param color - color del texto
// @param tema - objeto de colores
function dibujarEtiquetaCable(ctx, x, y, texto, color, tema) {
  ctx.save();
  ctx.fillStyle = tema.fondoCanvas;
  ctx.fillRect(x - 25, y - 8, 50, 14);
  dibujarTexto(ctx, texto, x, y, '400 8px IBM Plex Mono', color);
  ctx.restore();
}

// Dibuja un nodo de unión (punto donde se juntan cables)
// @param ctx, x, y - centro del nodo
// @param color - color del punto
function dibujarNodo(ctx, x, y, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
