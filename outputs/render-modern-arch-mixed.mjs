// render-modern-arch-mixed.mjs — Modern Application Architecture (Mixed Mode)
// Demonstrates per-layer renderMode: flat service bands + perspective Data Mesh
//
//   Band 1  (flat)        — Intelligent Applications
//   Band 2  (flat)        — API & Data Services
//   ↓ cascade (flat → perspective seam)
//   Data Mesh (perspective) — One-point perspective trapezoid with zone overlays
//   ↓ arrow (perspective → flat seam)
//   Band 3  (flat)        — Core Systems / System of Records
//
// Design system: system.md v0.3 + tokens.json v0.3.0
// Canvas: W=1400, H=920
import { writeFileSync } from 'fs';

// ─── Tokens ───────────────────────────────────────────────────────────────
const T = {
  bg:        '#FFFFFF',
  line:      '#C8C4BC',
  dark:      '#252930',   // brand.charcoal
  accent:    '#E84E1B',   // brand.blazeOrange — hero accent ≤10%
  bandFill:  '#1E4A57',   // brand.deepTeal — service bands
  bandText:  '#F1F3F1',   // brand.offWhite
  chipFill:  '#6BA4C8',   // brand.skyBlue — standard chips
  chipText:  '#FFFFFF',
  chipSpec:  '#9EB3C4',   // brand.mistBlue — knowledge/graph chips
  surf:      '#F7F6F3',   // perspective platform surface
  gridS:     '#D0CCC4',   // grid stroke
  zoneFill:  '#FFFFFF',
  zoneTitle: '#1E4A57',   // brand.deepTeal
  conn:      '#B0ABA3',
  muted:     '#9A9590',
};

const FONT = "'Inter', system-ui, sans-serif";
const W = 1400, H = 920;
const VP_X = W / 2;           // 700
const VP_Y = -(H * 0.52);     // -478.4  — exact, never round this constant

function f(n)  { return parseFloat(n.toFixed(1)); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function tx(x, y, s, size=9, weight=400, fill=T.dark, anchor='middle', spacing=0) {
  const ls = spacing ? ` letter-spacing="${spacing}"` : '';
  return `<text x="${f(x)}" y="${f(y)}" text-anchor="${anchor}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}"${ls}>${esc(s)}</text>`;
}

// ─── Perspective engine ───────────────────────────────────────────────────
// perspT: scale factor at y, where yFront is the near/bottom edge of the platform
function perspT(y, yFront) { return (y - VP_Y) / (yFront - VP_Y); }

// Renders a one-point perspective trapezoid platform with surface grid
function platform(yFront, hwFront, yBack, opts = {}) {
  const { fill = T.surf, gridOpacity = 0.45, nRadial = 8, nHoriz = 4 } = opts;
  const tBack = perspT(yBack, yFront);
  const xFL = VP_X - hwFront, xFR = VP_X + hwFront;
  const hwBack = hwFront * tBack;
  const xBL = VP_X - hwBack, xBR = VP_X + hwBack;

  let svg = `<polygon points="${f(xBL)},${yBack} ${f(xBR)},${yBack} ${f(xFR)},${yFront} ${f(xFL)},${yFront}"
   fill="${fill}" stroke="${T.line}" stroke-width="1.5"/>
`;
  // Radial grid lines (converge toward VP_X)
  for (let i = 0; i <= nRadial; i++) {
    const t = i / nRadial;
    const xf = xFL + t * (xFR - xFL);
    const xb = VP_X + (xf - VP_X) * tBack;
    svg += `<line x1="${f(xf)}" y1="${yFront}" x2="${f(xb)}" y2="${yBack}"
   stroke="${T.gridS}" stroke-width="0.4" opacity="${gridOpacity}"/>
`;
  }
  // Horizontal grid lines (perspective-spaced)
  for (let i = 1; i < nHoriz; i++) {
    const ti = tBack + (i / nHoriz) * (1 - tBack);
    const y  = VP_Y + (yFront - VP_Y) * ti;
    const hwY = hwFront * ti;
    svg += `<line x1="${f(VP_X - hwY)}" y1="${f(y)}" x2="${f(VP_X + hwY)}" y2="${f(y)}"
   stroke="${T.gridS}" stroke-width="0.4" opacity="${gridOpacity}"/>
`;
  }
  // Front edge thickness strip
  svg += `<rect x="${f(xFL)}" y="${yFront}" width="${f(xFR - xFL)}" height="12"
   fill="${fill}" stroke="${T.line}" stroke-width="1"/>
`;
  return { svg, xFL, xFR, xBL: f(xBL), xBR: f(xBR), tBack };
}

// Cascade fan: bezier lines from one horizontal edge band to another
// Used for both flat→flat and flat→perspective transitions
function cascade(y1, y2, x1s, x1e, x2s, x2e, n = 20) {
  return Array.from({ length: n }, (_, i) => {
    const t  = i / (n - 1);
    const ax = f(x1s + t * (x1e - x1s));
    const bx = f(x2s + t * (x2e - x2s));
    const my = (y1 + y2) / 2;
    return `<path d="M${ax},${y1} C${ax},${my} ${bx},${my} ${bx},${y2}"
   fill="none" stroke="${T.conn}" stroke-width="0.7" stroke-dasharray="3,3" opacity="0.55"/>`;
  }).join('\n');
}

// ─── Flat primitives ──────────────────────────────────────────────────────
function serviceBand(x, y, w, h, title, chips) {
  const cx = x + w / 2;
  const n  = chips.length;
  const chipH = 32;
  const chipW = Math.min(230, Math.floor((w - (n + 1) * 22) / n));
  const totalW = n * chipW + (n - 1) * 22;
  const startX = cx - totalW / 2;
  const chipCY = y + h - chipH / 2 - 12;

  let svg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${T.bandFill}"/>`;
  svg += tx(cx, y + 20, title, 11, 700, T.bandText, 'middle', 0.5);
  chips.forEach((label, i) => {
    const chipX = f(startX + i * (chipW + 22));
    svg += `\n<rect x="${chipX}" y="${f(chipCY - chipH / 2)}" width="${chipW}" height="${chipH}" rx="5" fill="${T.chipFill}"/>`;
    svg += tx(chipX + chipW / 2, chipCY + 4.5, label, 8, 500, T.chipText);
  });
  return svg;
}

// Zone: flat labeled sub-region (rendered as overlay ON the perspective surface)
function zone(x, y, w, h, title) {
  return (
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${T.zoneFill}" stroke="${T.line}" stroke-width="0.75" opacity="0.94"/>` +
    tx(x + 10, y + 14, title, 8, 700, T.zoneTitle, 'start')
  );
}

// Data chip (inside zones or bands)
function dataChip(cx, cy, w, h, label, sublabel = null, chipFill = null) {
  const fill = chipFill ?? T.chipFill;
  const x = f(cx - w / 2), yy = f(cy - h / 2);
  let svg = `<rect x="${x}" y="${yy}" width="${w}" height="${h}" rx="5" fill="${fill}"/>`;
  if (sublabel) {
    svg += tx(cx, cy - 1.5, label, 7.5, 600, T.chipText);
    svg += tx(cx, cy + 12,  sublabel, 6.5, 400, T.chipText);
  } else {
    svg += tx(cx, cy + 4.5, label, 7.5, 600, T.chipText);
  }
  return svg;
}

// Layer label pill (dark pill, used on perspective platforms)
function layerLabel(x, y, text, w) {
  return `<rect x="${x - w / 2}" y="${y - 13}" width="${w}" height="26" rx="13" fill="${T.dark}"/>
${tx(x, y + 4, text, 9, 700, T.bg, 'middle', 2.5)}`;
}

// Side annotation: bracket + rotated text
function sideAnnotation(x, y1, y2, text) {
  const cy = (y1 + y2) / 2;
  const bx = x + 22;
  return [
    `<line x1="${bx}" y1="${y1 + 4}" x2="${bx}" y2="${y2 - 4}" stroke="${T.line}" stroke-width="0.75"/>`,
    `<line x1="${bx-4}" y1="${y1+4}" x2="${bx+4}" y2="${y1+4}" stroke="${T.line}" stroke-width="0.75"/>`,
    `<line x1="${bx-4}" y1="${y2-4}" x2="${bx+4}" y2="${y2-4}" stroke="${T.line}" stroke-width="0.75"/>`,
    `<text transform="rotate(-90,${x},${cy})" x="${x}" y="${cy+4}" text-anchor="middle" font-family="${FONT}" font-size="7.5" font-weight="500" fill="${T.muted}" letter-spacing="1.5">${esc(text.toUpperCase())}</text>`,
  ].join('\n');
}

// Small centered arrow for the platform → flat band seam
function downArrow(cx, y1, y2) {
  return [
    `<line x1="${cx}" y1="${y1}" x2="${cx}" y2="${y2 - 9}" stroke="${T.conn}" stroke-width="1.5" stroke-dasharray="4,3"/>`,
    `<path d="M${cx-6},${y2-9} L${cx},${y2} L${cx+6},${y2-9}" fill="${T.conn}" stroke="none"/>`,
  ].join('\n');
}

// ─── Layout constants ─────────────────────────────────────────────────────
const BX = 105, BW = 1185;   // band x-start and width

// Flat service bands
const B1_Y = 78,  B1_H = 80;  // Intelligent Applications  y2=158
const B2_Y = 162, B2_H = 80;  // API & Data Services        y2=242
const B3_Y = 762, B3_H = 80;  // Core Systems               y2=842

// Perspective Data Mesh platform
const PLAT_YFRONT  = 736;
const PLAT_YBACK   = 267;
const PLAT_HWFRONT = 590;

// ─── Build SVG ────────────────────────────────────────────────────────────
const out = [];

out.push(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
<rect width="${W}" height="${H}" fill="${T.bg}"/>
`);

// Title
out.push(tx(VP_X, 46, 'Modern Application Architecture', 20, 700, T.dark));
out.push(tx(VP_X, 64, 'MIXED MODE  ·  FLAT BANDS + PERSPECTIVE DATA MESH', 8, 400, T.muted, 'middle', 2));

// ── Band 1: Intelligent Applications (flat) ───────────────────────────────
out.push(`<!-- renderMode: flat -->`);
out.push(serviceBand(BX, B1_Y, BW, B1_H, 'Intelligent Applications', [
  'Power BI / Tableau', 'Consumer Application', "AI Chat UI's (MakeIt)",
]));

// ── Band 2: API & Data Services (flat) ────────────────────────────────────
out.push(serviceBand(BX, B2_Y, BW, B2_H, 'API & Data Services', [
  'APIs', 'ML / Cognitive Services', 'AI Services',
]));

// ── Cascade seam: flat band → perspective platform ────────────────────────
// Source: full band bottom edge (BX to BX+BW) at y=242
// Target: platform back edge (xBL to xBR) at y=267
// The fan contracts inward as bands are wider than the platform at its back
const plat = platform(PLAT_YFRONT, PLAT_HWFRONT, PLAT_YBACK, {
  gridOpacity: 0.4, nRadial: 10, nHoriz: 5,
});
out.push(`<!-- ── Cascade seam: flat → perspective ──────────────────── -->`);
out.push(cascade(B2_Y + B2_H, PLAT_YBACK, BX, BX + BW, plat.xBL, plat.xBR, 20));

// ── Data Mesh: perspective platform ───────────────────────────────────────
out.push(`<!-- renderMode: perspective -->`);
out.push(plat.svg);

// Zone overlay positions (flat rectangles laid over the perspective surface)
// Verified safe from platform edge at every zone y — see design notes
const ZX   = 345;  // safe left edge (12px from platform edge at y=277)
const ZW   = 710;  // full-width zone spans ZX to ZX+ZW=1055
const ZXL  = 345;  // left column x
const ZWL  = 320;  // left column width → right edge 665
const ZXR  = 678;  // right column x
const ZWR  = 377;  // right column width → right edge 1055
const ZCX_L = ZXL + ZWL / 2;  // 505 — left col chip center x
const ZCX_R = ZXR + ZWR / 2;  // 866.5 — right col chip center x

// Zone: Data Products (full width, near platform back)
out.push(`<!-- Zone: Data Products -->`);
out.push(zone(ZX, 277, ZW, 110, 'Data Products'));
{
  const chipW = 110, chipH = 38, chipGap = 15;
  const labels = ['Customer 360', 'Vendor', 'Branch', 'Product / Service', 'Employee / Agent'];
  const total = labels.length * chipW + (labels.length - 1) * chipGap;
  const startX = ZX + (ZW - total) / 2;
  const chipCY = 277 + 110 - chipH / 2 - 12;
  labels.forEach((label, i) => {
    const cx = f(startX + i * (chipW + chipGap) + chipW / 2);
    out.push(dataChip(cx, chipCY, chipW, chipH, label));
  });
}

// Zone: Knowledge Graph (left column)
out.push(`<!-- Zone: Knowledge Graph -->`);
out.push(zone(ZXL, 400, ZWL, 140, 'Knowledge Graph'));
out.push(dataChip(ZCX_L, 470, 240, 46, 'Knowledge Graph', '(Neo4j)', T.chipSpec));

// Zone: Data Lakehouse (left column)
out.push(`<!-- Zone: Data Lakehouse -->`);
out.push(zone(ZXL, 553, ZWL, 168, 'Data Lakehouse'));
{
  const chipW = 250, chipH = 36, chipGap = 10;
  const total3 = 3 * chipH + 2 * chipGap;
  const startY = 553 + 22 + (168 - 22 - total3) / 2;
  [['Consumption Data','(Gold)'], ['Curated Data','(Silver)'], ['Raw Data','(Bronze)']].forEach(([l,s], i) => {
    out.push(dataChip(ZCX_L, f(startY + i * (chipH + chipGap) + chipH / 2), chipW, chipH, l, s));
  });
}

// Zone: Analytics / AI Models (right column, full height)
out.push(`<!-- Zone: Analytics / AI Models -->`);
out.push(zone(ZXR, 400, ZWR, 321, 'Analytics / AI Models'));
{
  const chipW = 310, chipH = 50, chipGap = 14;
  const total4 = 4 * chipH + 3 * chipGap;
  const startY = 400 + 22 + (321 - 22 - total4) / 2;
  const items = [
    ['Graph Data Science',          null],
    ['AI Models',                   T.accent],  // brand.blazeOrange — hero
    ['Bloom Graph DB Exploration',  null],
    ['Analytics / Semantic Models', null],
  ];
  items.forEach(([label, fill], i) => {
    out.push(dataChip(ZCX_R, f(startY + i * (chipH + chipGap) + chipH / 2), chipW, chipH, label, null, fill));
  });
}

// Layer label — drawn after zones so it sits on top
out.push(layerLabel(VP_X, 731, 'DATA MESH', 200));

// ── Seam: perspective platform → flat band ────────────────────────────────
// A centered arrow signals single structured output (not a fan — intentional asymmetry)
out.push(`<!-- ── Seam: perspective → flat ─────────────────────────── -->`);
out.push(downArrow(VP_X, PLAT_YFRONT + 12, B3_Y));

// ── Band 3: Core Systems (flat) ────────────────────────────────────────────
out.push(`<!-- renderMode: flat -->`);
out.push(serviceBand(BX, B3_Y, BW, B3_H, 'Core Systems / System of Records', [
  'CRM / Dynamics', 'Oracle', 'FIS', 'Markets', 'Other Systems',
]));

// ── Side annotations — drawn last ─────────────────────────────────────────
out.push(`<!-- Side annotations -->`);
out.push(sideAnnotation(30, B1_Y, B2_Y + B2_H, 'Systems of Engagement'));
out.push(sideAnnotation(30, PLAT_YBACK, PLAT_YFRONT + 12, 'Unified Data, Analytics Core'));
out.push(sideAnnotation(30, B3_Y, B3_Y + B3_H, 'Systems of Record'));

// Footer
out.push(tx(W - 32, H - 14, 'Modern Application Architecture · Mixed Mode · IA Brand · March 2026', 8, 400, T.muted, 'end'));
out.push('</svg>');

// ─── Write ────────────────────────────────────────────────────────────────
writeFileSync(new URL('./ModernArchitecture-Mixed.svg', import.meta.url), out.join('\n'), 'utf8');
console.log('✓ Written outputs/ModernArchitecture-Mixed.svg');
console.log(`  VP = (${VP_X}, ${VP_Y.toFixed(1)})`);
console.log(`  Platform: yBack=${PLAT_YBACK}, yFront=${PLAT_YFRONT}, hwFront=${PLAT_HWFRONT}`);
console.log(`  tBack = ${(perspT(PLAT_YBACK, PLAT_YFRONT)).toFixed(4)}`);
