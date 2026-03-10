// render-ios-v4.mjs — IntelligentOS v4.1 — Sub-layer Containers + Deliverable Chips
// Source: inputs/diagrams/IntelligentOS_v3.jsx
// Config A (multi-plane) — perspective trapezoids with flat container overlays
// Each sub-layer heading = labeled container; each deliverable = chip inside

import { writeFileSync } from 'fs';

// ─── Tokens (design-system/tokens.json) ───────────────────────────────────
const T = {
  bg:       '#FFFFFF',
  line:     '#C8C4BC',
  dark:     '#252930',
  deepTeal: '#1E4A57',
  skyBlue:  '#6BA4C8',
  mistBlue: '#9EB3C4',
  accent:   '#E84E1B',
  slate:    '#656578',
  offWhite: '#F1F3F1',
  surf:     '#F7F6F3',
  surfAlt:  '#EDEBE7',
  meshFill: '#F5F4F1',
  grid:     '#D0CCC4',
  conn:     '#B0ABA3',
  pill:     '#F0F0EE',
  muted:    '#9A9590',
  white:    '#FFFFFF',
};

const FONT = "'Inter', system-ui, sans-serif";
const W    = 1400;
const H    = 1460;
const VP_X = W / 2;          // 700
const VP_Y = -(H * 0.52);    // -759.2

function f(n)  { return parseFloat(n.toFixed(1)); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function tx(x, y, s, size=9, weight=400, fill=T.dark, anchor='middle', spacing=0) {
  const ls = spacing ? ` letter-spacing="${spacing}"` : '';
  return `<text x="${f(x)}" y="${f(y)}" text-anchor="${anchor}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}"${ls}>${esc(s)}</text>`;
}

// ─── Perspective engine ───────────────────────────────────────────────────
function perspT(y, yFront) {
  return (y - VP_Y) / (yFront - VP_Y);
}

function platform(yFront, hwFront, yBack, opts = {}) {
  const { fill = T.surf, gridOpacity = 0.35, nRadial = 9, nHoriz = 5 } = opts;
  const tBack = perspT(yBack, yFront);
  const xFL   = VP_X - hwFront, xFR = VP_X + hwFront;
  const hwBack = hwFront * tBack;
  const xBL   = f(VP_X - hwBack), xBR = f(VP_X + hwBack);

  let svg = `<polygon points="${xBL},${yBack} ${xBR},${yBack} ${f(xFR)},${yFront} ${f(xFL)},${yFront}" fill="${fill}" stroke="${T.line}" stroke-width="1.5"/>\n`;

  for (let i = 0; i <= nRadial; i++) {
    const t  = i / nRadial;
    const xf = f(xFL + t * (xFR - xFL));
    const xb = f(VP_X + (xFL + t * (xFR - xFL) - VP_X) * tBack);
    svg += `<line x1="${xf}" y1="${yFront}" x2="${xb}" y2="${yBack}" stroke="${T.grid}" stroke-width="0.4" opacity="${gridOpacity}"/>\n`;
  }
  for (let i = 1; i < nHoriz; i++) {
    const ti  = tBack + (i / nHoriz) * (1 - tBack);
    const y   = f(VP_Y + (yFront - VP_Y) * ti);
    const hwY = f(hwFront * ti);
    svg += `<line x1="${f(VP_X - hwY)}" y1="${y}" x2="${f(VP_X + hwY)}" y2="${y}" stroke="${T.grid}" stroke-width="0.4" opacity="${gridOpacity}"/>\n`;
  }
  // Front ledge strip
  svg += `<rect x="${f(xFL)}" y="${yFront}" width="${f(xFR - xFL)}" height="12" fill="${fill}" stroke="${T.line}" stroke-width="1"/>\n`;

  return { svg, xFL: f(xFL), xFR: f(xFR), xBL, xBR };
}

function cascade(y1, y2, x1s, x1e, x2s, x2e, n = 20) {
  return Array.from({ length: n }, (_, i) => {
    const t  = i / (n - 1);
    const ax = f(+x1s + t * (+x1e - +x1s));
    const bx = f(+x2s + t * (+x2e - +x2s));
    const my = (y1 + y2) / 2;
    return `<path d="M${ax},${y1} C${ax},${my} ${bx},${my} ${bx},${y2}" fill="none" stroke="${T.conn}" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.45"/>`;
  }).join('\n');
}

function layerLabel(x, y, title, sub, w) {
  let s = `<rect x="${f(x - w / 2)}" y="${f(y - 19)}" width="${w}" height="${sub ? 38 : 26}" rx="13" fill="${T.dark}"/>`;
  s += tx(x, sub ? y - 5 : y + 4, title, 9, 700, T.white, 'middle', 2.5);
  if (sub) s += tx(x, y + 11, sub, 7, 400, T.muted, 'middle', 1);
  return s;
}

// ─── Chip layout ─────────────────────────────────────────────────────────
const CHIP_H      = 14;
const CHIP_GAP    = 5;
const CHIP_PAD_X  = 10;
const CHIP_FONT   = 6.5;
const PER_CHAR    = CHIP_FONT * 0.60;   // approx px per char at 6.5pt Inter

function layoutChips(deliverables, availW) {
  const maxW  = availW - CHIP_PAD_X * 2;
  let cx = CHIP_PAD_X, cy = 0;
  const chips = [];

  for (const d of deliverables) {
    const w = Math.min(Math.ceil(d.length * PER_CHAR) + CHIP_PAD_X * 2, maxW);
    if (chips.length > 0 && cx > CHIP_PAD_X && cx + w > availW - CHIP_PAD_X) {
      cx  = CHIP_PAD_X;
      cy += CHIP_H + CHIP_GAP;
    }
    chips.push({ d, x: cx, y: cy, w });
    cx += w + CHIP_GAP;
  }
  return { chips, totalChipH: cy + CHIP_H };
}

// ─── Sub-layer container panel ─────────────────────────────────────────────
const PANEL_TITLE_H = 20;
const CHIP_V_START  = 28;
const PANEL_BOT_PAD = 10;

function subLayerPanel(px, py, pw, title, deliverables, opts = {}) {
  const { titleFill = T.deepTeal } = opts;
  const { chips, totalChipH } = layoutChips(deliverables, pw);
  const ph = CHIP_V_START + totalChipH + PANEL_BOT_PAD;

  let svg = '';
  // Panel background + border
  svg += `<rect x="${f(px)}" y="${f(py)}" width="${f(pw)}" height="${f(ph)}" rx="4" fill="${T.white}" stroke="${T.line}" stroke-width="0.75"/>`;
  // Title header tint
  svg += `<rect x="${f(px)}" y="${f(py)}" width="${f(pw)}" height="${PANEL_TITLE_H}" rx="4" fill="${titleFill}" opacity="0.1"/>`;
  // Patch rounded-corner bleed at header bottom
  svg += `<rect x="${f(px)}" y="${f(py + PANEL_TITLE_H - 4)}" width="${f(pw)}" height="4" fill="${T.white}"/>`;
  // Title text
  svg += tx(px + 10, py + 13.5, title, 7.5, 700, titleFill, 'start');

  // Deliverable chips
  for (const { d, x, y, w } of chips) {
    const cx = f(px + x), cy = f(py + CHIP_V_START + y);
    svg += `<rect x="${cx}" y="${cy}" width="${f(w)}" height="${CHIP_H}" rx="3" fill="${T.pill}" stroke="${T.line}" stroke-width="0.5"/>`;
    svg += `<text x="${f(px + x + w / 2)}" y="${f(py + CHIP_V_START + y + 10)}" text-anchor="middle" font-family="${FONT}" font-size="${CHIP_FONT}" font-weight="400" fill="${T.dark}">${esc(d)}</text>`;
  }
  return { svg, height: ph };
}

// ─── Platform grid (2-column container layout) ─────────────────────────────
const COL_GAP = 14;
const ROW_GAP = 12;

function platformGrid(layers, startX, startY, availW, opts = {}) {
  const { cols = 2, titleFill = T.deepTeal } = opts;
  const colW = f((availW - COL_GAP * (cols - 1)) / cols);

  // Pre-compute per-panel heights
  const heights = layers.map(l => {
    const { totalChipH } = layoutChips(l.deliverables, colW);
    return CHIP_V_START + totalChipH + PANEL_BOT_PAD;
  });

  // Per-row max height
  const nRows   = Math.ceil(layers.length / cols);
  const rowMaxH = Array.from({ length: nRows }, (_, r) => {
    let max = 0;
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (i < layers.length) max = Math.max(max, heights[i]);
    }
    return max;
  });

  // Cumulative row y offsets
  const rowY = rowMaxH.reduce((acc, _, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + rowMaxH[i - 1] + ROW_GAP);
    return acc;
  }, []);

  const totalH = rowMaxH.reduce((s, h) => s + h, 0) + ROW_GAP * (nRows - 1);

  let svg = '';
  layers.forEach((layer, i) => {
    const row   = Math.floor(i / cols);
    const col   = i % cols;
    const px    = startX + col * (colW + COL_GAP);
    const py    = startY + rowY[row];
    const title = layer.num !== undefined ? `${layer.num}  ·  ${layer.name}` : layer.name;
    const { svg: ps } = subLayerPanel(px, py, colW, title, layer.deliverables, { titleFill });
    svg += ps;
  });

  return { svg, totalH };
}

// ─── Container area: compute usable rect inside a perspective trapezoid ────
const CONT_MARGIN_TOP  = 40;   // px below yBack before first container row
const CONT_SIDE_INSET  = 28;   // inset from trapezoid edge at the top level
const CONT_MARGIN_BOT  = 20;   // px reserved above yFront (label zone)

function containerArea(yFront, hwFront, yBack) {
  const yTop  = yBack + CONT_MARGIN_TOP;
  const tTop  = perspT(yTop, yFront);
  const hwTop = hwFront * tTop;
  const xLeft  = f(VP_X - hwTop + CONT_SIDE_INSET);
  const xRight = f(VP_X + hwTop - CONT_SIDE_INSET);
  return { xLeft, availW: f(xRight - xLeft), contentY: yTop };
}

// ─── Source data (from IntelligentOS_v3.jsx) ──────────────────────────────

const P1_LAYERS = [
  {
    name: 'Vision, Mission & Purpose',
    deliverables: ['Strategic Narrative', 'Positioning Statement', 'Market Research & Insights Report', 'Growth Narrative & Investor Deck'],
  },
  {
    name: 'Strategic Priorities & OKRs',
    deliverables: ['OKR Framework', 'Strategic Initiative Roadmap', 'Growth Strategy', 'Commercialization Roadmap'],
  },
  {
    name: 'Business Model',
    deliverables: ['Business Model Canvas', 'Value Architecture Doc (Finance)', 'Financial Framework'],
  },
  {
    name: 'Brand, Culture & Readiness',
    deliverables: ['Change Readiness Assessment', 'Culture Alignment Map'],
  },
];

const P2_LAYERS = [
  { num: '00', name: 'Current State Assessment',             deliverables: ['Current State Report', 'Gap Analysis', 'BOS Framework'] },
  { num: '01', name: 'Success Model & KPIs',                 deliverables: ['Success Model', 'KPI Hierarchy', 'Dashboard Spec', 'Metric Framework'] },
  { num: '02', name: 'Value Streams',                        deliverables: ['Value Stream Maps', 'Process Flow Diagrams'] },
  { num: '03', name: 'Roles & Org Design',                   deliverables: ['Role Design Specs', 'RACI Matrix', 'Org Model Diagram'] },
  { num: '04', name: 'JTBD & Workflow Blueprint',            deliverables: ['JTBD Inventory', 'Workflow Specifications', 'Swimlane Diagrams', 'Journey Maps'] },
  { num: '05', name: 'Decision & Intelligence Architecture', deliverables: ['Decision Architecture Map', 'Market Intelligence Spec', 'AI Opportunity Assessment'] },
  { num: '06', name: 'Data Model & Platform Translation',    deliverables: ['Canonical Data Model', 'Feature Requirements Spec', 'Permissions Matrix'] },
  { num: '07', name: 'Change Enablement & Adoption',         deliverables: ['Change Enablement Plan', 'Adoption KPI Dashboard', 'Change Communication Plan'] },
];

const P3_LAYERS = [
  { name: 'AI Agents & Orchestration', deliverables: ['Agent Design Specs', 'Orchestration Blueprint', 'AI Use-Case Backlog', 'AI Opportunity Matrix'] },
  { name: 'Semantic Layer',            deliverables: ['Knowledge Graph Spec', 'Business Logic Encoding'] },
  { name: 'Data Layer',               deliverables: ['Data Architecture Doc', 'Integration Map', 'Data Dictionary', 'Entity Relationship Diagrams'] },
  { name: 'Infrastructure',           deliverables: ['Infrastructure Blueprint', 'Security & Compliance Spec', 'System Architecture Document', 'Feature Roadmap'] },
];

const CANVAS_INPUTS = [
  { d: 'Workflow Specifications',   src: 'ops'  },
  { d: 'Canonical Data Model',      src: 'ops'  },
  { d: 'Decision Architecture Map', src: 'ops'  },
  { d: 'Feature Requirements Spec', src: 'ops'  },
  { d: 'Agent Design Specs',        src: 'plat' },
  { d: 'JTBD Inventory',            src: 'ops'  },
  { d: 'Role Design Specs',         src: 'ops'  },
  { d: 'Permissions Matrix',        src: 'ops'  },
  { d: 'Success Model',             src: 'ops'  },
];

const CANVAS_OUTPUTS = ['Platform Code', 'Data Schema', 'AI Agents', 'Live Workflows', 'Dashboards'];

// ─── Platform geometry constants ──────────────────────────────────────────
const P1_YF = 330, P1_HW = 540, P1_YB = 95;
const P2_YF = 745, P2_HW = 575, P2_YB = 390;
const P3_YF = 1050, P3_HW = 600, P3_YB = 800;

const CV_Y = 1130, CV_H = 275;
const BX   = 105,  BW   = 1185;

// ─── Build SVG ───────────────────────────────────────────────────────────
const out = [];

out.push(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
<rect width="${W}" height="${H}" fill="${T.bg}"/>
`);

// Header
out.push(tx(VP_X, 46, 'IntelligentOS Platform Architecture', 20, 700, T.dark));
out.push(tx(VP_X, 64, 'THREE LENSES  ·  ONE ARCHITECTURE  ·  APPLICATION CANVAS', 8, 400, T.muted, 'middle', 2));

// ── Platform 1: Adaptive Business Model ──────────────────────────────────
const p1 = platform(P1_YF, P1_HW, P1_YB, { fill: T.surf });
out.push('<!-- ── P1: Adaptive Business Model ──────────────────────────── -->');
out.push(p1.svg);

const ca1 = containerArea(P1_YF, P1_HW, P1_YB);
const gr1 = platformGrid(P1_LAYERS, ca1.xLeft, ca1.contentY, ca1.availW, {
  cols: 2, titleFill: T.deepTeal,
});
out.push(gr1.svg);

// ── Cascade P1 → P2 ──────────────────────────────────────────────────────
const p2 = platform(P2_YF, P2_HW, P2_YB, { fill: T.surfAlt, nHoriz: 6 });
out.push('<!-- ── Cascade P1 → P2 ──────────────────────────────────────── -->');
out.push(cascade(P1_YF, P2_YB, p1.xFL, p1.xFR, p2.xBL, p2.xBR, 20));

// ── Platform 2: Intelligent Operating Model ───────────────────────────────
out.push('<!-- ── P2: Intelligent Operating Model ──────────────────────── -->');
out.push(p2.svg);

const ca2 = containerArea(P2_YF, P2_HW, P2_YB);
const gr2 = platformGrid(P2_LAYERS, ca2.xLeft, ca2.contentY, ca2.availW, {
  cols: 2, titleFill: T.skyBlue,
});
out.push(gr2.svg);

// ── Cascade P2 → P3 ──────────────────────────────────────────────────────
const p3 = platform(P3_YF, P3_HW, P3_YB, { fill: T.meshFill });
out.push('<!-- ── Cascade P2 → P3 ──────────────────────────────────────── -->');
out.push(cascade(P2_YF, P3_YB, p2.xFL, p2.xFR, p3.xBL, p3.xBR, 20));

// ── Platform 3: Agentic Platform Model ────────────────────────────────────
out.push('<!-- ── P3: Agentic Platform Model ───────────────────────────── -->');
out.push(p3.svg);

const ca3 = containerArea(P3_YF, P3_HW, P3_YB);
const gr3 = platformGrid(P3_LAYERS, ca3.xLeft, ca3.contentY, ca3.availW, {
  cols: 2, titleFill: T.accent,
});
out.push(gr3.svg);

// ── Cascade P3 → Canvas (perspective → flat, expanding fan) ──────────────
out.push('<!-- ── Cascade P3 → Canvas ──────────────────────────────────── -->');
out.push(cascade(P3_YF, CV_Y, p3.xFL, p3.xFR, BX, BX + BW, 18));

// ── Application Canvas ─────────────────────────────────────────────────────
out.push('<!-- ── Application Canvas ───────────────────────────────────── -->');
out.push(`<rect x="${BX}" y="${CV_Y}" width="${BW}" height="${CV_H}" fill="${T.dark}"/>`);

// Canvas title area
out.push(tx(VP_X, CV_Y + 22, 'APPLICATION CANVAS', 11, 700, T.white, 'middle', 3));
out.push(tx(VP_X, CV_Y + 38, 'AI-driven · Specification-powered · Generative Development Engine', 8, 400, T.muted, 'middle', 0.5));

// Thin separator line
out.push(`<line x1="${BX + 20}" y1="${CV_Y + 48}" x2="${BX + BW - 20}" y2="${CV_Y + 48}" stroke="${T.line}" stroke-width="0.5" opacity="0.3"/>`);

// ── Canvas: Inputs (left column) ──────────────────────────────────────────
const INP_X     = BX + 24;
const INP_AVAIL = 680;
const INP_FONT  = 7;
const INP_PPC   = INP_FONT * 0.60;
const INP_CH    = 16, INP_CG = 6, INP_PAD = 12;

out.push(tx(INP_X, CV_Y + 60, 'ACCEPTS AS INPUT', 7.5, 700, T.muted, 'start', 1.5));

let icx = 0, icy = 0;
for (const { d, src } of CANVAS_INPUTS) {
  const chipFill = src === 'plat' ? T.accent : T.skyBlue;
  const cw = Math.ceil(d.length * INP_PPC) + INP_PAD * 2;
  if (icx > 0 && icx + cw > INP_AVAIL) { icx = 0; icy += INP_CH + INP_CG; }
  const cx = INP_X + icx, cy = CV_Y + 70 + icy;
  out.push(`<rect x="${cx}" y="${cy}" width="${cw}" height="${INP_CH}" rx="4" fill="${chipFill}" opacity="0.85"/>`);
  out.push(`<text x="${f(cx + cw / 2)}" y="${cy + 11}" text-anchor="middle" font-family="${FONT}" font-size="${INP_FONT}" font-weight="500" fill="${T.white}">${esc(d)}</text>`);
  icx += cw + INP_CG;
}

// ── Canvas: Outputs (right column) ────────────────────────────────────────
const OUT_X = BX + 724;
const OUT_W = BX + BW - OUT_X - 20;   // ≈ 446px

// Vertical separator
out.push(`<line x1="${OUT_X - 12}" y1="${CV_Y + 53}" x2="${OUT_X - 12}" y2="${CV_Y + CV_H - 12}" stroke="${T.line}" stroke-width="0.5" opacity="0.25"/>`);

out.push(tx(OUT_X, CV_Y + 60, 'GENERATES', 7.5, 700, T.muted, 'start', 1.5));
CANVAS_OUTPUTS.forEach((label, i) => {
  const oy = CV_Y + 70 + i * 36;
  out.push(`<rect x="${OUT_X}" y="${oy}" width="${OUT_W}" height="28" rx="3" fill="${T.white}" opacity="0.07"/>`);
  out.push(`<rect x="${OUT_X}" y="${oy}" width="4" height="28" rx="2" fill="${T.accent}"/>`);
  out.push(tx(OUT_X + 14, oy + 18, label, 8.5, 600, T.white, 'start'));
});

// ── Layer label pills (drawn last — on top of all cascades) ───────────────
out.push(layerLabel(VP_X, P1_YF + 26, 'ADAPTIVE BUSINESS MODEL',    'STRATEGY · C-SUITE · BOARD',      360));
out.push(layerLabel(VP_X, P2_YF + 26, 'INTELLIGENT OPERATING MODEL', 'TRANSFORMATION · DELIVERY TEAMS',  418));
out.push(layerLabel(VP_X, P3_YF + 26, 'AGENTIC PLATFORM MODEL',      'ENGINEERING · AI/ML · ARCHITECTS', 394));

// Footer
out.push(tx(W - 32, H - 14,
  'IntelligentOS v4.1 · Vivid Consulting Group · IA Brand · March 2026',
  8, 400, T.muted, 'end'));

out.push('</svg>');

// ─── Write ────────────────────────────────────────────────────────────────
writeFileSync(new URL('./IntelligentOS_v4.svg', import.meta.url), out.join('\n'), 'utf8');
console.log('✓ Written outputs/IntelligentOS_v4.svg');
console.log(`  Canvas: ${W}×${H}  VP=(${VP_X}, ${VP_Y.toFixed(1)})`);
console.log(`  P1: ${P1_LAYERS.length} containers, ${P1_LAYERS.reduce((s,l)=>s+l.deliverables.length,0)} deliverables`);
console.log(`  P2: ${P2_LAYERS.length} containers, ${P2_LAYERS.reduce((s,l)=>s+l.deliverables.length,0)} deliverables`);
console.log(`  P3: ${P3_LAYERS.length} containers, ${P3_LAYERS.reduce((s,l)=>s+l.deliverables.length,0)} deliverables`);
console.log(`  Canvas inputs: ${CANVAS_INPUTS.length}  outputs: ${CANVAS_OUTPUTS.length}`);
