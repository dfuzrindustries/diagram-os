// render-svg.mjs v5 — IA brand palette (tokens.json brand.* namespace)
// Changes from v4:
//   T.dark   → brand.charcoal #252930  (was warm #3A3832)
//   T.accent → brand.blazeOrange #E84E1B  (was teal #7EC8A4)
//   Everything else: original structural palette values
import { writeFileSync } from 'fs';

// ─── Tokens ────────────────────────────────────────────────────────────────
const T = {
  bg:          '#F8F8F6',   // background        — warm off-white canvas
  line:        '#C8C4BC',   // sketchLine        — structural lines
  dark:        '#252930',   // brand.charcoal    — primary text (was #3A3832)
  accent:      '#E84E1B',   // brand.blazeOrange — active accent (was teal)
  accentL:     '#C2E8D4',   // accentSubtle      — secondary highlight
  panel:       '#FFFFFF',   // surfacePanel      — panel backgrounds
  conn:        '#B0ABA3',   // connectorDefault  — connector lines
  surf:        '#F7F6F3',   // surfaceAlt        — platform surfaces (light so grid reads)
  pill:        '#F0F0EE',   // pillBackground    — entity label pills
  gridStroke:  '#D0CCC4',   // isometric.gridStroke
};

const FONT = "'Inter', system-ui, sans-serif";
const W = 1400;
const H = 960;

// ─── One-point perspective engine (Section 12A) ───────────────────────────
// Single vanishing point at (W/2, VP_Y), shared by all platforms.
const VP_X = W / 2;          // 700 — always horizontal center
const VP_Y = -H * 0.52;      // ≈ −499 — above canvas

/**
 * perspT(y) — perspective scale at screen y.
 * t=1 at y_ref (front/near), shrinks toward 0 as y→VP_Y (infinity).
 */
function perspT(y, yFront) {
  return (y - VP_Y) / (yFront - VP_Y);
}

/**
 * platform(yFront, hwFront, yBack) → SVG string
 *
 * Generates a perspective-correct trapezoid platform with surface grid.
 * Returns: { svg, xFL, xFR, xBL, xBR }
 *   xFL/xFR = front-left/right x  (bottom edge, wider)
 *   xBL/xBR = back-left/right x   (top edge, narrower)
 */
function platform(yFront, hwFront, yBack, opts = {}) {
  const { fill = T.surf, gridOpacity = 0.45, nRadial = 8, nHoriz = 4 } = opts;

  const tBack  = perspT(yBack, yFront);             // < 1 — back is narrower

  const xFL = VP_X - hwFront;   const xFR = VP_X + hwFront;   // front corners
  const hwBack = hwFront * tBack;
  const xBL = VP_X - hwBack;    const xBR = VP_X + hwBack;    // back corners

  // Trapezoid surface
  let svg = `<polygon points="${f(xBL)},${yBack} ${f(xBR)},${yBack} ${f(xFR)},${yFront} ${f(xFL)},${yFront}"
     fill="${fill}" stroke="${T.line}" stroke-width="1.5"/>
`;

  // Perspective-correct radial grid lines (converge toward VP_X)
  for (let i = 0; i <= nRadial; i++) {
    const t = i / nRadial;
    const xf = xFL + t * (xFR - xFL);               // evenly spaced on front edge
    const xb = VP_X + (xf - VP_X) * tBack;          // projected to back
    svg += `<line x1="${f(xf)}" y1="${yFront}" x2="${f(xb)}" y2="${yBack}"
     stroke="${T.gridStroke}" stroke-width="0.4" opacity="${gridOpacity}"/>
`;
  }

  // Perspective-correct horizontal grid lines (closer together near back)
  for (let i = 1; i < nHoriz; i++) {
    const ti  = tBack + (i / nHoriz) * (1 - tBack);
    const y   = VP_Y + (yFront - VP_Y) * ti;
    const hwY = hwFront * ti;
    svg += `<line x1="${f(VP_X - hwY)}" y1="${f(y)}" x2="${f(VP_X + hwY)}" y2="${f(y)}"
     stroke="${T.gridStroke}" stroke-width="0.4" opacity="${gridOpacity}"/>
`;
  }

  // Edge strip (platform thickness at front)
  svg += `<rect x="${f(xFL)}" y="${yFront}" width="${f(xFR - xFL)}" height="13"
     fill="${T.surf}" stroke="${T.line}" stroke-width="1"/>
`;

  return { svg, xFL, xFR, xBL, xBR, tBack };
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function f(n) { return parseFloat(n.toFixed(1)); }

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function tx(x, y, s, size = 9, weight = 400, fill = T.dark, anchor = 'middle', spacing = 0) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FONT}"
     font-size="${size}" font-weight="${weight}" fill="${fill}"
     letter-spacing="${spacing}">${esc(s)}</text>`;
}

// ─── Cascade connectors ───────────────────────────────────────────────────
// Fans N cubic-bezier curves from source band to target band.
function cascade(y1, y2, x1s, x1e, x2s, x2e, n = 20) {
  return Array.from({ length: n }, (_, i) => {
    const tt = i / (n - 1);
    const ax = f(x1s + tt * (x1e - x1s));
    const bx = f(x2s + tt * (x2e - x2s));
    return `<path d="M${ax},${y1} C${ax},${y1 + 30} ${bx},${y2 - 30} ${bx},${y2}"
     fill="none" stroke="${T.conn}" stroke-width="0.7" stroke-dasharray="3,3" opacity="0.55"/>`;
  }).join('\n');
}

// ─── Layer label — dark pill with light text ──────────────────────────────
function layerLabel(x, y, text, w) {
  return `<rect x="${x - w / 2}" y="${y - 13}" width="${w}" height="26" rx="13" fill="${T.dark}"/>
${tx(x, y + 4, text, 9, 700, T.bg, 'middle', 2.5)}`;
}

// ─── Floating pill (audience / metadata labels) ───────────────────────────
function pill(x, y, text) {
  const w = text.length * 5 + 20;
  return `<rect x="${x - w / 2}" y="${y - 8}" width="${w}" height="16" rx="8"
     fill="${T.pill}" stroke="${T.line}" stroke-width="0.75"/>
${tx(x, y + 4, text, 7.5, 400, '#7A7570')}`;
}

// ─── Top-layer panel ──────────────────────────────────────────────────────
function panel(x, y, w, h, title, icons, hl = false) {
  const sc = hl ? T.accent : T.line, sw = hl ? 1.5 : 1.25;
  const iCount = icons.length;
  let html = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3"
     fill="${T.panel}" stroke="${sc}" stroke-width="${sw}" opacity="0.7"/>
${tx(x + w / 2, y + 13, title, 8, 700, T.dark)}`;
  icons.forEach(({ sym, lbl }, i) => {
    const ix = x + (i + 1) * w / (iCount + 1);
    const iy = y + h / 2 + 4;
    html += `
<circle cx="${ix}" cy="${iy}" r="11" fill="none" stroke="${sc}" stroke-width="1"/>
${tx(ix, iy + 4, sym, 10, 400, T.dark)}
${tx(ix, y + h - 7, lbl, 7, 400, T.dark)}`;
  });
  return html;
}

// ─── Relationship connector label ─────────────────────────────────────────
function rel(x, y, text, active = false) {
  const w = text.length * 4.8 + 14;
  return `<rect x="${f(x - w / 2)}" y="${f(y - 7)}" width="${f(w)}" height="13" rx="6.5"
     fill="${active ? T.accentL : T.panel}" stroke="${active ? T.accent : T.line}" stroke-width="0.75"/>
${tx(x, y + 3, text, 7, 400, T.dark)}`;
}

// ─── Entity icons (icon sits ABOVE baseline y, ground ring AT baseline) ───
function docIcon(x, y, accent = false) {
  const sc = accent ? T.accent : T.line, fc = accent ? T.accentL : T.panel;
  return `<rect x="${x-11}" y="${y-26}" width="22" height="26" rx="2" fill="${fc}" stroke="${sc}" stroke-width="1.5"/>
<line x1="${x-6}" y1="${y-18}" x2="${x+6}" y2="${y-18}" stroke="${sc}" stroke-width="0.75"/>
<line x1="${x-6}" y1="${y-12}" x2="${x+6}" y2="${y-12}" stroke="${sc}" stroke-width="0.75"/>
<line x1="${x-6}" y1="${y-6}"  x2="${x+2}" y2="${y-6}"  stroke="${sc}" stroke-width="0.75"/>`;
}

function buildingIcon(x, y) {
  return `<polygon points="${x-12},${y-18} ${x},${y-32} ${x+12},${y-18}" fill="${T.panel}" stroke="${T.line}" stroke-width="1.5"/>
<rect x="${x-12}" y="${y-18}" width="24" height="18" rx="1" fill="${T.panel}" stroke="${T.line}" stroke-width="1.5"/>
<rect x="${x-5}"  y="${y-12}" width="10" height="10" rx="1" fill="${T.panel}" stroke="${T.line}" stroke-width="1"/>`;
}

function personIcon(x, y, hat = false) {
  return `<circle cx="${x}" cy="${y-22}" r="8" fill="${T.panel}" stroke="${T.line}" stroke-width="1.5"/>
${hat ? `<path d="M${x-10},${y-22} Q${x},${y-36} ${x+10},${y-22}" fill="${T.panel}" stroke="${T.line}" stroke-width="1.5"/>` : ''}
<rect x="${x-10}" y="${y-13}" width="20" height="13" rx="4" fill="${T.panel}" stroke="${T.line}" stroke-width="1.5"/>`;
}

function boxIcon(x, y) {
  return `<polygon points="${x},${y-22} ${x+14},${y-14} ${x+14},${y} ${x},${y-8}" fill="${T.panel}" stroke="${T.line}" stroke-width="1.5"/>
<polygon points="${x-14},${y-14} ${x},${y-22} ${x},${y-8} ${x-14},${y}" fill="#F0EDE8" stroke="${T.line}" stroke-width="1.5"/>
<polygon points="${x-14},${y-14} ${x},${y-22} ${x+14},${y-14} ${x},${y-6}" fill="#F8F5F0" stroke="${T.line}" stroke-width="1.5"/>`;
}

function lensIcon(x, y) {
  return `<circle cx="${x-2}" cy="${y-16}" r="12" fill="${T.panel}" stroke="${T.line}" stroke-width="1.5"/>
<circle cx="${x-2}" cy="${y-16}" r="6"  fill="none" stroke="${T.line}" stroke-width="1"/>
<line x1="${x+7}" y1="${y-7}" x2="${x+14}" y2="${y}" stroke="${T.line}" stroke-width="2" stroke-linecap="round"/>`;
}

function stackIcon(x, y) {
  return `<ellipse cx="${x}" cy="${y}"    rx="13" ry="4.5" fill="${T.panel}"   stroke="${T.line}" stroke-width="1.5"/>
<rect    x="${x-13}" y="${y-14}" width="26" height="14" fill="${T.panel}"  stroke="${T.line}" stroke-width="1.5"/>
<ellipse cx="${x}" cy="${y-14}" rx="13" ry="4.5" fill="#F8F5F0" stroke="${T.line}" stroke-width="1.5"/>`;
}

function entityIcon(e, x, y) {
  if (e.id === 'prop')     return buildingIcon(x, y);
  if (e.id === 'loan')     return stackIcon(x, y);
  if (e.id === 'inspect')  return lensIcon(x, y);
  if (e.id === 'parcel')   return boxIcon(x, y);
  if (e.cls === 'Actor')   return personIcon(x, y, e.hat ?? false);
  return docIcon(x, y, e.accent ?? false);
}

// ─── Entity node — ground ring + icon above + label pill below ────────────
function ent(x, y, e) {
  const ac  = e.accent ?? false;
  const lw  = Math.max(e.label.length * 5.2 + 18, 36);
  return `<!-- ${esc(e.label)} -->
<ellipse cx="${x}" cy="${y}" rx="20" ry="6"
         fill="${ac ? T.accentL : '#E0DCD6'}" opacity="0.7"/>
${entityIcon(e, x, y)}
<rect x="${f(x - lw/2)}" y="${y+6}" width="${f(lw)}" height="14" rx="7"
     fill="${ac ? T.accent : T.pill}" stroke="${ac ? T.accent : T.line}" stroke-width="0.75"/>
${tx(x, y + 16, e.label, 7.5, 500, ac ? '#fff' : T.dark)}`;
}

// ─── Data ─────────────────────────────────────────────────────────────────
const ENTITIES = [
  { id: 'file',     label: 'File',             cls: 'DataObject' },
  { id: 'contract', label: 'Contract',         cls: 'DataObject' },
  { id: 'parcel',   label: 'Parcel',           cls: 'DataObject' },
  { id: 'permit',   label: 'Permit',           cls: 'DataObject' },
  { id: 'inspect',  label: 'Inspection',       cls: 'Process' },
  { id: 'prop',     label: 'Property',         cls: 'System' },
  { id: 'builder',  label: 'Builder',          cls: 'Actor',  hat: true },
  { id: 'draw',     label: 'Draw Request',     cls: 'DataObject' },
  { id: 'agent',    label: 'Agent',            cls: 'Actor' },
  { id: 'feedback', label: 'Feedback',         cls: 'Process' },
  { id: 'loan',     label: 'Loan',             cls: 'System' },
  { id: 'sale',     label: 'Sale',             cls: 'DataObject', accent: true },
  { id: 'perf',     label: 'Performance Review', cls: 'DataObject' },
];

const POS = {
  file:     [195, 460], contract: [325, 415], parcel:   [415, 328],
  permit:   [465, 475], inspect:  [568, 430], prop:     [700, 352],
  builder:  [765, 445], draw:     [848, 495], agent:    [905, 408],
  feedback: [958, 335], loan:     [1062, 365], sale:    [1075, 440],
  perf:     [1172, 460],
};

const RELS = [
  { from: 'file',     to: 'contract', label: 'Becomes' },
  { from: 'contract', to: 'inspect',  label: 'Triggers' },
  { from: 'inspect',  to: 'permit',   label: 'Enables',   active: true },
  { from: 'permit',   to: 'builder',  label: 'Assigns' },
  { from: 'builder',  to: 'draw',     label: 'Submits' },
  { from: 'draw',     to: 'loan',     label: 'Funds' },
  { from: 'loan',     to: 'sale',     label: 'Closes',    active: true },
  { from: 'agent',    to: 'feedback', label: 'Produces' },
  { from: 'sale',     to: 'perf',     label: 'Generates' },
];

// ─── Build SVG ────────────────────────────────────────────────────────────
const out = [];

out.push(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
<defs>
  <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
    <path d="M0,0 L0,6 L7,3 Z" fill="${T.conn}"/>
  </marker>
  <marker id="arr-a" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
    <path d="M0,0 L0,6 L7,3 Z" fill="${T.accent}"/>
  </marker>
</defs>
<rect width="${W}" height="${H}" fill="${T.bg}"/>
`);

// Title
out.push(`${tx(700, 46, 'IntelligentOS', 20, 700, T.dark)}
${tx(700, 64, 'THREE LENSES, ONE ARCHITECTURE', 9, 400, '#9A9590', 'middle', 2)}
`);

// ══ TOP PLATFORM — y_front=176, hw=490 ════════════════════════════════════
const top = platform(176, 490, 82, { gridOpacity: 0.35, nHoriz: 3 });
out.push(`<!-- TOP PLATFORM -->\n${top.svg}`);

out.push(panel(283,  90, 255, 78, 'Vision, Mission &amp; Purpose',
  [{ sym: '⊕', lbl: 'Identity' }, { sym: '⊞', lbl: 'Direction' }, { sym: '♡', lbl: 'Compassion' }], true));
out.push(panel(568,  90, 265, 78, 'Strategic Priorities &amp; OKRs',
  [{ sym: '◎', lbl: 'Goals' }, { sym: '⬡', lbl: 'Milestones' }, { sym: '↑', lbl: 'Growth' }]));
out.push(panel(863,  90, 255, 78, 'Business Model',
  [{ sym: '$', lbl: 'Value' }, { sym: '⟐', lbl: 'Revenue' }, { sym: '◈', lbl: 'Capital' }]));

out.push(pill(411, 188, '⊙ C-suite / Leadership'));
out.push(pill(991, 188, '⊙ Stakeholders'));

// Cascade top → mid (source: top front edge, target: mid back edge)
const midTBack = perspT(308, 572);
const midHW = 640;
const midXBL = f(VP_X - midHW * midTBack);
const midXBR = f(VP_X + midHW * midTBack);

out.push(`<!-- Cascade top→mid -->`);
out.push(cascade(189, 308, top.xFL, top.xFR, midXBL, midXBR, 20));

// ══ MID PLATFORM — y_front=572, hw=640 ════════════════════════════════════
const mid = platform(572, 640, 308, { gridOpacity: 0.5, nRadial: 10, nHoriz: 5 });
out.push(`<!-- MID PLATFORM -->\n${mid.svg}`);

// Relationship connectors (drawn before entities)
out.push('<!-- Relationships -->');
RELS.forEach(r => {
  const [x1, y1] = POS[r.from];
  const [x2, y2] = POS[r.to];
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const stroke = r.active ? T.accent : T.conn;
  const marker = r.active ? 'url(#arr-a)' : 'url(#arr)';
  out.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
     stroke="${stroke}" stroke-width="${r.active ? 1.2 : 1}" stroke-dasharray="4,3" marker-end="${marker}"/>`);
  out.push(rel(mx, my, r.label, r.active ?? false));
});

// Entity nodes
out.push('<!-- Entities -->');
ENTITIES.forEach(e => {
  const [x, y] = POS[e.id];
  out.push(ent(x, y, e));
});

// Cascade mid → bot (source: mid front edge, target: bot back edge)
const bot = platform(792, 570, 648, { gridOpacity: 0.3, nHoriz: 3 });
const botTBack = perspT(648, 792);
const botHW = 570;
const botXBL = f(VP_X - botHW * botTBack);
const botXBR = f(VP_X + botHW * botTBack);

out.push(`<!-- Cascade mid→bot -->`);
out.push(cascade(585, 648, mid.xFL, mid.xFR, botXBL, botXBR, 20));

// ══ BOT PLATFORM — already computed above ═════════════════════════════════
out.push(`<!-- BOT PLATFORM -->\n${bot.svg}`);

// Data Layer panel
out.push(`<rect x="168" y="660" width="292" height="118" rx="3"
     fill="${T.panel}" stroke="${T.line}" stroke-width="1.25"/>
<ellipse cx="265" cy="700" rx="17" ry="5.5" fill="${T.panel}" stroke="${T.line}" stroke-width="1.5"/>
<rect x="248" y="700" width="34" height="18"  fill="${T.panel}" stroke="${T.line}" stroke-width="1.5"/>
<ellipse cx="265" cy="718" rx="17" ry="5.5" fill="${T.panel}" stroke="${T.line}" stroke-width="1.5"/>
${tx(314, 744, 'DATA LAYER',              9, 700, T.dark, 'middle', 1.5)}
${tx(314, 758, '&amp; Single Source of Truth', 7.5, 400, '#9A9590')}
`);

// Semantic Layer panel
const sNodes = [[680,700],[655,718],[672,732],[700,726],[712,708]];
const sEdges = [[0,1],[0,2],[1,3],[2,3],[3,4],[4,0]];
out.push(`<rect x="504" y="660" width="392" height="118" rx="3"
     fill="${T.panel}" stroke="${T.accent}" stroke-width="1.5"/>
${sNodes.map(([cx,cy]) => `<circle cx="${cx}" cy="${cy}" r="5" fill="none" stroke="${T.line}" stroke-width="1.5"/>`).join('\n')}
${sEdges.map(([a,b]) => `<line x1="${sNodes[a][0]}" y1="${sNodes[a][1]}" x2="${sNodes[b][0]}" y2="${sNodes[b][1]}" stroke="${T.line}" stroke-width="1" stroke-dasharray="2,2"/>`).join('\n')}
${tx(700, 750, 'SEMANTIC LAYER',      9,   700, T.dark, 'middle', 1.5)}
${tx(700, 764, '&amp; Knowledge Graph',   7.5, 400, '#9A9590')}
`);

// Agent Specialization panel
out.push(`<rect x="940" y="660" width="300" height="118" rx="3"
     fill="${T.panel}" stroke="${T.line}" stroke-width="1.25"/>
<circle cx="1064" cy="700" r="16" fill="none" stroke="${T.line}" stroke-width="2"/>
<circle cx="1064" cy="700" r="8"  fill="none" stroke="${T.line}" stroke-width="1.5"/>
<circle cx="1090" cy="716" r="11" fill="none" stroke="${T.line}" stroke-width="2"/>
<circle cx="1090" cy="716" r="5.5" fill="none" stroke="${T.line}" stroke-width="1.5"/>
${tx(1090, 750, 'AGENT SPECIALIZATION', 9,   700, T.dark, 'middle', 1.5)}
${tx(1090, 764, '&amp; Orchestration',      7.5, 400, '#9A9590')}
`);

// ── Layer labels drawn last — always in front of cascade connector lines ──
out.push(layerLabel(700, 218, 'ADAPTIVE BUSINESS MODEL', 370));
out.push(layerLabel(700, 605, 'INTELLIGENT OPERATING MODEL — THE ONTOLOGY', 640));
out.push(layerLabel(700, 828, 'AGENTIC PLATFORM MODEL', 350));

// Footer
out.push(`${tx(W - 32, H - 12, 'Version 1.2 · IA Brand · March 2026', 8, 400, '#B0ABA3', 'end')}
</svg>`);

// ─── Write ────────────────────────────────────────────────────────────────
writeFileSync(new URL('./IntelligentOS.svg', import.meta.url), out.join('\n'), 'utf8');
console.log('✓ Written outputs/IntelligentOS.svg');
console.log(`  VP = (${VP_X}, ${VP_Y.toFixed(0)})`);
console.log(`  Top  taper: ${f(perspT(82, 176) * 100)}% at back`);
console.log(`  Mid  taper: ${f(perspT(308, 572) * 100)}% at back`);
console.log(`  Bot  taper: ${f(perspT(648, 792) * 100)}% at back`);
