# Diagrama Solar CFE
**HTML + Tailwind CSS + Canvas JS Vanilla**

## Estructura
```
diagrama-solar/
├── index.html      ← UI completa con Tailwind CDN
├── datos.js        ← Temas, especificaciones, leer parámetros
├── componentes.js  ← Funciones de dibujo (panel, inversor, cables...)
└── diagrama.js     ← Layout, orquestación, exportar/imprimir
```

## Cómo usarlo
Abre `index.html` directamente en el navegador (no requiere servidor).

## Cómo usar con GitHub Copilot

Los archivos están llenos de comentarios estratégicos para Copilot:

### Patrón 1 — Completar funciones existentes
Los comentarios `// Copilot hint:` describen exactamente qué debe dibujar
la siguiente sección de código. Posiciona el cursor al final del comentario
y presiona `Tab` para que Copilot complete.

### Patrón 2 — Extender componentes
Para agregar un nuevo componente (ej: batería de almacenamiento):

```javascript
// Dibuja un banco de baterías de almacenamiento de energía
// @param ctx - contexto 2D del canvas
// @param x, y - esquina superior izquierda
// @param w, h - dimensiones
// @param kwh - capacidad en kWh
// @param tema - objeto de colores del tema actual
// El símbolo eléctrico consiste en pares de líneas paralelas
// (larga=positivo, corta=negativo) representando celdas
function dibujarBateria(ctx, x, y, w, h, kwh, tema) {
  // Copilot completará aquí
}
```

### Patrón 3 — Nuevas funciones desde cero
Describe el objetivo en comentario antes de la función:

```javascript
// Calcula automáticamente el número de paneles necesarios
// dado un consumo bimestral en kWh y horas sol pico (HSP)
// retorna { paneles, kwp, genBimestral, coberturaPercent }
function calcularPanelesNecesarios(consumoBimKwh, hsp, wattsPanel) {
  // Copilot completará aquí
}
```

## Temas disponibles
- `dark` — Oscuro técnico (por defecto)
- `light` — Claro para imprimir
- `blueprint` — Estilo plano técnico azul

## Funcionalidades
- Número de paneles dinámico (1-20)
- Configuración serie/paralelo/mixto
- DPS opcional (pararrayos DC)
- Tierra física opcional
- Exportar PNG
- Imprimir en tamaño carta landscape
- 3 temas visuales

## Extender con Copilot
Ideas para que Copilot te ayude a agregar:
- `dibujarBateria()` — banco de baterías
- `dibujarStringBox()` — caja de strings para >4 paneles
- `calcularCalibresCable()` — calibre AWG por corriente
- `exportarPDF()` — exportar directo a PDF con jsPDF
- `animarFlujoEnergia()` — animar el flujo de energía en los cables
