// render-modern-arch.mjs — Modern Application Architecture
// Config D: Service Band Stack
// Primitives: serviceBand, zone, dataChip, sideAnnotation
// Source: inputs/diagrams/ModernArchitecture.png
// Design system: system.md v0.3 + tokens.json v0.3.0
import { writeFileSync } from 'fs';

// ─── Tokens ───────────────────────────────────────────────────────────────
const T = {
  bg:        '#FFFFFF',
  line:      '#C8C4BC',         // sketchLine — warm grey
  dark:      '#252930',         // brand.charcoal — all text
  accent:    '#E84E1B',         // brand.blazeOrange — hero emphasis, ≤10%
  bandFill:  '#1E4A57',         // brand.deepTeal — service band fills
  bandText:  '#F1F3F1',         // brand.offWhite — text on dark bands
  chipFill:  '#6BA4C8',         // brand.skyBlue — standard chips
  chipText:  '#FFFFFF',
  chipSpec:  '#9EB3C4',         // brand.mistBlue — special/knowledge chips
  meshBg:    '#F5F4F1',         // dataMesh.containerFill
  meshBord:  '#1E4A57',         // dataMesh.containerBorder
  zoneFill:  '#FFFFFF',         // zone.fill
  zoneTitle: '#1E4A57',         // zone.titleText
  conn:      '#B0ABA3',         // connectorDefault
  muted:     '#9A9590',         // labelMuted
};

const FONT = "'Inter', system-ui, sans-serif";
const W = 1400, H = 1000;
const CX = W / 2;  // 700

function f(n) { return parseFloat(n.toFixed(1)); }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function tx(x, y, s, size = 9, weight = 400, fill = T.dark, anchor = 'middle', spacing = 0) {
  const ls = spacing ? ` letter-spacing="${spacing}"` : '';
  return `<text x="${f(x)}" y="${f(y)}" text-anchor="${anchor}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}"${ls}>${esc(s)}</text>`;
}

// ─── Service band (flat horizontal tier with title + chips) ───────────────
function serviceBand(x, y, w, h, title, chips) {
  const cx = x + w / 2;
  const n = chips.length;
  const chipH = 32;
  // Auto-size chips to fill band width evenly
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

// ─── Zone container (labeled sub-region within a platform) ────────────────
function zone(x, y, w, h, title) {
  return (
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${T.zoneFill}" stroke="${T.line}" stroke-width="0.75"/>` +
    tx(x + 10, y + 15, title, 8, 700, T.zoneTitle, 'start')
  );
}

// ─── Data chip (named item inside a zone or band) ─────────────────────────
// chipFill defaults to T.chipFill; pass T.accent or T.chipSpec for variants
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

// ─── Side annotation (vertical bracket + rotated label) ───────────────────
// Identifies logical groupings spanning one or more layers
function sideAnnotation(x, y1, y2, text) {
  const cy = (y1 + y2) / 2;
  const bx = x + 22;
  return [
    `<line x1="${bx}" y1="${y1 + 4}" x2="${bx}" y2="${y2 - 4}" stroke="${T.line}" stroke-width="0.75"/>`,
    `<line x1="${bx - 4}" y1="${y1 + 4}" x2="${bx + 4}" y2="${y1 + 4}" stroke="${T.line}" stroke-width="0.75"/>`,
    `<line x1="${bx - 4}" y1="${y2 - 4}" x2="${bx + 4}" y2="${y2 - 4}" stroke="${T.line}" stroke-width="0.75"/>`,
    `<text transform="rotate(-90,${x},${cy})" x="${x}" y="${cy + 4}" text-anchor="middle" font-family="${FONT}" font-size="7.5" font-weight="500" fill="${T.muted}" letter-spacing="1.5">${esc(text.toUpperCase())}</text>`,
  ].join('\n');
}

// ─── Vertical connector arrow (between layers) ────────────────────────────
function downArrow(cx, y1, y2) {
  return [
    `<line x1="${cx}" y1="${y1}" x2="${cx}" y2="${y2 - 9}" stroke="${T.conn}" stroke-width="1.5" stroke-dasharray="4,3"/>`,
    `<path d="M${cx - 6},${y2 - 9} L${cx},${y2} L${cx + 6},${y2 - 9}" fill="${T.conn}" stroke="none"/>`,
  ].join('\n');
}

// ─── Layout constants ─────────────────────────────────────────────────────
const BX = 105, BW = 1185;  // content x-start and width

// Band y-positions (flat bands touch; 4px gap separates band 1 and band 2,
// larger gaps with arrows mark the major transitions)
const B1_Y = 78,  B1_H = 86;   // Intelligent Applications  → y2 = 164
const B2_Y = 168, B2_H = 86;   // API & Data Services        → y2 = 254
const MESH_Y = 278;             // Data Mesh container start  (gap + arrow = 24px)
const MESH_H = 576;             // Data Mesh height
const MESH_Y2 = MESH_Y + MESH_H; // 854
const B3_Y = MESH_Y2 + 24;     // Core Systems               → y2 = 964
const B3_H = 86;

// Zone geometry (within Data Mesh, 13px inset on each side)
const ZX      = BX + 13;             // 118 — zone left edge
const ZW      = BW - 26;             // 1159 — full-width zone width
const ZX_L    = ZX;                  // 118 — left column x
const ZW_L    = 490;                 // left column width
const ZX_R    = ZX_L + ZW_L + 12;   // 620 — right column x
const ZW_R    = ZW - ZW_L - 12;     // 657 — right column width

const DP_Y  = MESH_Y + 30;          // 308 — Data Products zone top
const DP_H  = 130;
const DP_Y2 = DP_Y + DP_H;          // 438

const COL_Y = DP_Y2 + 12;           // 450 — columns start

const KG_Y  = COL_Y, KG_H = 163, KG_Y2 = KG_Y + KG_H;   // 450 → 613
const LH_Y  = KG_Y2 + 12, LH_H = 219, LH_Y2 = LH_Y + LH_H; // 625 → 844
const AI_Y  = COL_Y, AI_H = LH_Y2 - COL_Y;               // 450 → 844

// ─── Build SVG ────────────────────────────────────────────────────────────
const out = [];

out.push(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
<rect width="${W}" height="${H}" fill="${T.bg}"/>
`);

// Title
out.push(tx(CX, 46, 'Modern Application Architecture', 20, 700, T.dark));
out.push(tx(CX, 64, 'INTELLIGENT AGENCY  ·  ENTERPRISE PLATFORM OVERVIEW', 8, 400, T.muted, 'middle', 2));

// ── Band 1: Intelligent Applications ─────────────────────────────────────
out.push(`<!-- ── Band 1: Intelligent Applications ─────────────────── -->`);
out.push(serviceBand(BX, B1_Y, BW, B1_H, 'Intelligent Applications', [
  'Power BI / Tableau', 'Consumer Application', "AI Chat UI's (MakeIt)",
]));

// 4px visual gap (background shows through) separates the two service bands

// ── Band 2: API & Data Services ───────────────────────────────────────────
out.push(`<!-- ── Band 2: API & Data Services ──────────────────────── -->`);
out.push(serviceBand(BX, B2_Y, BW, B2_H, 'API & Data Services', [
  'APIs', 'ML / Cognitive Services', 'AI Services',
]));

// Arrow: API layer → Data Mesh
out.push(downArrow(CX, B2_Y + B2_H, MESH_Y));

// ── Data Mesh container ───────────────────────────────────────────────────
out.push(`<!-- ── Data Mesh ─────────────────────────────────────────── -->`);
out.push(`<rect x="${BX}" y="${MESH_Y}" width="${BW}" height="${MESH_H}" fill="${T.meshBg}" stroke="${T.meshBord}" stroke-width="2"/>`);
out.push(tx(CX, MESH_Y + 22, 'Data Mesh', 14, 700, T.dark));

// ── Zone: Data Products ───────────────────────────────────────────────────
out.push(`<!-- Zone: Data Products -->`);
out.push(zone(ZX, DP_Y, ZW, DP_H, 'Data Products'));

{
  const chipW = 195, chipH = 44, chipGap = 24;
  const labels = ['Customer 360', 'Vendor', 'Branch', 'Product / Service', 'Employee / Agent'];
  const totalW = labels.length * chipW + (labels.length - 1) * chipGap;
  const startX = ZX + (ZW - totalW) / 2;
  const chipCY = DP_Y + DP_H - chipH / 2 - 14;
  labels.forEach((label, i) => {
    const cx = f(startX + i * (chipW + chipGap) + chipW / 2);
    out.push(dataChip(cx, chipCY, chipW, chipH, label));
  });
}

// ── Zone: Knowledge Graph ─────────────────────────────────────────────────
out.push(`<!-- Zone: Knowledge Graph -->`);
out.push(zone(ZX_L, KG_Y, ZW_L, KG_H, 'Knowledge Graph'));

{
  const cx = ZX_L + ZW_L / 2;  // 363
  const cy = KG_Y + 22 + (KG_H - 22) / 2;  // centered in available space
  // brand.mistBlue — signals a knowledge/graph platform, distinct from data chips
  out.push(dataChip(cx, cy, 360, 52, 'Knowledge Graph', '(Neo4j)', T.chipSpec));
}

// ── Zone: Data Lakehouse ──────────────────────────────────────────────────
out.push(`<!-- Zone: Data Lakehouse -->`);
out.push(zone(ZX_L, LH_Y, ZW_L, LH_H, 'Data Lakehouse'));

{
  const chipW = 370, chipH = 44, chipGap = 14;
  const cx = ZX_L + ZW_L / 2;  // 363
  const total3H = 3 * chipH + 2 * chipGap;
  const startY = LH_Y + 22 + (LH_H - 22 - total3H) / 2;
  const tiers = [
    ['Consumption Data', '(Gold)'],
    ['Curated Data',     '(Silver)'],
    ['Raw Data',         '(Bronze)'],
  ];
  tiers.forEach(([label, sub], i) => {
    const cy = f(startY + i * (chipH + chipGap) + chipH / 2);
    out.push(dataChip(cx, cy, chipW, chipH, label, sub));
  });
}

// ── Zone: Analytics / AI Models ───────────────────────────────────────────
out.push(`<!-- Zone: Analytics / AI Models -->`);
out.push(zone(ZX_R, AI_Y, ZW_R, AI_H, 'Analytics / AI Models'));

{
  const chipW = 530, chipH = 52, chipGap = 16;
  const cx = ZX_R + ZW_R / 2;  // ~938
  const total4H = 4 * chipH + 3 * chipGap;
  const startY = AI_Y + 22 + (AI_H - 22 - total4H) / 2;
  const items = [
    { label: 'Graph Data Science',         fill: null },
    { label: 'AI Models',                  fill: T.accent },  // hero accent ≤10%
    { label: 'Bloom Graph DB Exploration', fill: null },
    { label: 'Analytics / Semantic Models',fill: null },
  ];
  items.forEach(({ label, fill }, i) => {
    const cy = f(startY + i * (chipH + chipGap) + chipH / 2);
    out.push(dataChip(cx, cy, chipW, chipH, label, null, fill));
  });
}

// Arrow: Data Mesh → Core Systems
out.push(downArrow(CX, MESH_Y2, B3_Y));

// ── Band 3: Core Systems / System of Records ──────────────────────────────
out.push(`<!-- ── Band 3: Core Systems ─────────────────────────────── -->`);
out.push(serviceBand(BX, B3_Y, BW, B3_H, 'Core Systems / System of Records', [
  'CRM / Dynamics', 'Oracle', 'FIS', 'Markets', 'Other Systems',
]));

// ── Side annotations — drawn last so they read over everything ────────────
out.push(`<!-- ── Side annotations ─────────────────────────────────── -->`);
// "Systems of Engagement" spans both top service bands (including 4px gap)
out.push(sideAnnotation(30, B1_Y, B2_Y + B2_H, 'Systems of Engagement'));
out.push(sideAnnotation(30, MESH_Y, MESH_Y2, 'Unified Data, Analytics Core'));
out.push(sideAnnotation(30, B3_Y, B3_Y + B3_H, 'Systems of Record'));

// Footer
out.push(tx(W - 32, H - 14, 'Modern Application Architecture · IA Brand · March 2026', 8, 400, T.muted, 'end'));

out.push('</svg>');

// ─── Write ────────────────────────────────────────────────────────────────
writeFileSync(new URL('./ModernArchitecture.svg', import.meta.url), out.join('\n'), 'utf8');
console.log('✓ Written outputs/ModernArchitecture.svg');
console.log(`  Layout: Config D — ${[
  'Intelligent Applications',
  'API & Data Services',
  'Data Mesh [Data Products · KG · Lakehouse · Analytics/AI]',
  'Core Systems',
].join(' → ')}`);
