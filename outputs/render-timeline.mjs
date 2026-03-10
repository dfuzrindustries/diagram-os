// render-timeline.mjs — DiagramOS Config E: Timeline
// Horizontal swimlane diagram with activities, deliverables, cross-lane connectors.
// Date range → auto-computed tick positions. Scale-mode agnostic visual grammar.

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
  surf:     '#F7F6F3',
  surfAlt:  '#EDEBE7',
  conn:     '#B0ABA3',
  pill:     '#F0F0EE',
  muted:    '#9A9590',
  white:    '#FFFFFF',
};

const FONT = "'Inter', system-ui, sans-serif";

function f(n)  { return parseFloat(n.toFixed(1)); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function tx(x, y, s, size=9, weight=400, fill=T.dark, anchor='middle', spacing=0) {
  const ls = spacing ? ` letter-spacing="${spacing}"` : '';
  return `<text x="${f(x)}" y="${f(y)}" text-anchor="${anchor}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}"${ls}>${esc(s)}</text>`;
}

// ─── Date utilities ───────────────────────────────────────────────────────
function parseDate(s)    { return new Date(s + 'T00:00:00Z'); }
function diffDays(a, b)  { return (b - a) / 86400000; }
function addDays(d, n)   { return new Date(d.getTime() + n * 86400000); }
function addMonths(d, n) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
}

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const Q_LABEL     = ['Q1','Q1','Q1','Q2','Q2','Q2','Q3','Q3','Q3','Q4','Q4','Q4'];

// computeTicks — returns [{date, label, days, frac, major}]
function computeTicks(startDate, endDate, mode) {
  const totalDays = diffDays(startDate, endDate);
  const raw = [];

  if (mode === 'sprint') {
    // Weekly ticks, aligned to Monday
    let d = new Date(startDate);
    const dow = d.getUTCDay();
    if (dow !== 1) d = addDays(d, dow === 0 ? 1 : (8 - dow) % 7);
    let wk = 1;
    while (d <= endDate) {
      const days = diffDays(startDate, d);
      raw.push({ date: new Date(d), label: `Wk ${wk}`, days, major: wk % 2 === 1 });
      d = addDays(d, 7);
      wk++;
    }
  } else if (mode === 'quarter') {
    // Monthly ticks; quarter-start months are major
    let d = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
    while (d <= endDate) {
      const days = diffDays(startDate, d);
      const m     = d.getUTCMonth();
      const major = m % 3 === 0;
      const label = major
        ? `${Q_LABEL[m]} ${d.getUTCFullYear()}`
        : MONTH_SHORT[m];
      raw.push({ date: new Date(d), label, days, major });
      d = addMonths(d, 1);
    }
  } else { // roadmap
    // Quarterly ticks
    const startQ = Math.floor(startDate.getUTCMonth() / 3);
    let d = new Date(Date.UTC(startDate.getUTCFullYear(), startQ * 3, 1));
    while (d <= endDate) {
      const days = diffDays(startDate, d);
      const m    = d.getUTCMonth();
      raw.push({ date: new Date(d), label: `${Q_LABEL[m]} ${d.getUTCFullYear()}`, days, major: true });
      d = addMonths(d, 3);
    }
  }

  return raw
    .filter(t => t.days >= -1 && t.days <= totalDays + 1)
    .map(t => ({ ...t, frac: Math.min(1, Math.max(0, t.days / totalDays)) }));
}

// ─── Layout constants ─────────────────────────────────────────────────────
const W         = 1400;
const MARGIN_L  = 20;
const MARGIN_R  = 24;
const LABEL_W   = 152;          // left sidebar for track labels
const CHART_X   = MARGIN_L + LABEL_W;   // 172 — where time axis begins
const CHART_W   = W - CHART_X - MARGIN_R;   // 1204
const TITLE_H   = 78;           // title block
const AXIS_H    = 46;           // date tick header row
const HEADER_H  = TITLE_H + AXIS_H;    // 124
const TRACK_H   = 80;           // per-swimlane height
const BAR_H     = 28;           // activity / deliverable bar height
const BAR_Y_OFF = (TRACK_H - BAR_H) / 2;   // 26 — vertical centering
const FOOTER_H  = 36;

// Track accent colors (left-edge indicator, label tint)
const TRACK_COLORS = [T.deepTeal, T.skyBlue, T.slate, T.mistBlue, T.accent];

// ─── Render one item bar ──────────────────────────────────────────────────
function itemBar(x1, x2, barY, item) {
  const barW = Math.max(f(x2 - x1), 6);
  const fill  = item.type === 'deliverable' ? T.accent : T.skyBlue;
  const SHORT = barW < 88;  // too narrow for inside label

  let svg = '';
  svg += `<rect x="${f(x1)}" y="${f(barY)}" width="${barW}" height="${BAR_H}" rx="4" fill="${fill}"/>`;

  if (!SHORT) {
    const cx = f(x1 + barW / 2);
    if (item.type === 'deliverable') {
      // Small diamond marker + label inside
      const mx = f(x1 + 14), my = f(barY + BAR_H / 2);
      svg += `<polygon points="${mx},${my-4} ${mx+4},${my} ${mx},${my+4} ${mx-4},${my}" fill="${T.white}" opacity="0.75"/>`;
      svg += tx(f(x1 + barW / 2 + 3), barY + BAR_H - 9, item.label, 7.5, 600, T.white);
    } else {
      svg += tx(cx, barY + BAR_H - 9, item.label, 7.5, 500, T.white);
    }
  } else {
    // Narrow: label below bar
    svg += tx(f(x1 + barW / 2), barY + BAR_H + 11, item.label, 6.5, 400, T.dark);
  }

  return { svg, x1: f(x1), x2: f(x2), barY };
}

// ─── Main renderer ────────────────────────────────────────────────────────
export function renderTimeline(config) {
  const {
    title,
    subtitle  = '',
    start,
    end,
    mode      = 'quarter',
    today     = null,
    phases    = [],
    tracks,
    connections = [],
  } = config;

  const startDate = parseDate(start);
  const endDate   = parseDate(end);
  const totalDays = diffDays(startDate, endDate);
  const ticks     = computeTicks(startDate, endDate, mode);

  function dateX(dateStr) {
    const days = diffDays(startDate, parseDate(dateStr));
    return f(CHART_X + (days / totalDays) * CHART_W);
  }
  function fracX(frac) { return f(CHART_X + frac * CHART_W); }

  const nTracks    = tracks.length;
  const CHART_H    = nTracks * TRACK_H;
  const CHART_BOT  = HEADER_H + CHART_H;
  const H          = CHART_BOT + FOOTER_H + 12;

  const out = [];

  // SVG root + defs (arrowhead marker for connectors)
  out.push(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
<rect width="${W}" height="${H}" fill="${T.bg}"/>
<defs>
  <marker id="conn-arrow" viewBox="0 0 8 8" refX="7" refY="4"
    markerWidth="5" markerHeight="5" orient="auto">
    <path d="M1,1.5 L7,4 L1,6.5" fill="none" stroke="${T.conn}"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
</defs>`);

  // ── Title ──
  out.push(tx(CHART_X + CHART_W / 2, 34, title, 17, 700, T.dark));
  if (subtitle) out.push(tx(CHART_X + CHART_W / 2, 54, subtitle, 8, 400, T.muted, 'middle', 1.5));
  out.push(`<line x1="${MARGIN_L}" y1="${TITLE_H - 4}" x2="${W - MARGIN_R}" y2="${TITLE_H - 4}" stroke="${T.line}" stroke-width="0.5"/>`);

  // ── Phase bands (drawn first, behind everything) ──
  for (const ph of phases) {
    const px1 = dateX(ph.start);
    const px2 = dateX(ph.end);
    const phW = f(px2 - px1);
    const phFill = ph.fill || T.deepTeal;
    out.push(`<rect x="${px1}" y="${TITLE_H}" width="${phW}" height="${AXIS_H + CHART_H}" fill="${phFill}" opacity="${ph.opacity || 0.04}"/>`);
    // Phase label in the axis row
    out.push(tx(f(+px1 + phW / 2), TITLE_H + 14, ph.label.toUpperCase(), 7, 700, T.slate, 'middle', 1.5));
    // Phase end boundary
    out.push(`<line x1="${f(+px1 + phW)}" y1="${TITLE_H}" x2="${f(+px1 + phW)}" y2="${CHART_BOT}" stroke="${T.line}" stroke-width="0.75" stroke-dasharray="3,2" opacity="0.35"/>`);
  }

  // ── Tick grid + axis labels ──
  for (const tick of ticks) {
    const tx_x     = fracX(tick.frac);
    const majOpac  = tick.major ? 0.28 : 0.13;
    const majW     = tick.major ? '0.75' : '0.4';
    // Vertical grid line spanning full chart height
    out.push(`<line x1="${tx_x}" y1="${HEADER_H}" x2="${tx_x}" y2="${CHART_BOT}" stroke="${T.line}" stroke-width="${majW}" opacity="${majOpac}"/>`);
    // Tick mark on axis
    out.push(`<line x1="${tx_x}" y1="${TITLE_H}" x2="${tx_x}" y2="${TITLE_H + (tick.major ? 8 : 5)}" stroke="${T.line}" stroke-width="0.75"/>`);
    // Tick label
    const labelY   = TITLE_H + 28;
    out.push(tx(tx_x, labelY, tick.label,
      tick.major ? 8 : 7.5,
      tick.major ? 700 : 400,
      tick.major ? T.deepTeal : T.muted));
  }

  // Axis baseline
  out.push(`<line x1="${CHART_X}" y1="${HEADER_H}" x2="${CHART_X + CHART_W}" y2="${HEADER_H}" stroke="${T.line}" stroke-width="1"/>`);

  // ── Swimlanes + items ──
  // Collect bar positions keyed by "ti_ii" for connector routing
  const pos = {};

  tracks.forEach((track, ti) => {
    const trackTop  = HEADER_H + ti * TRACK_H;
    const trackCy   = trackTop + TRACK_H / 2;
    const trackColor = TRACK_COLORS[ti % TRACK_COLORS.length];

    // Alternating row background
    if (ti % 2 === 0) {
      out.push(`<rect x="${MARGIN_L}" y="${trackTop}" width="${W - MARGIN_L - MARGIN_R}" height="${TRACK_H}" fill="${T.surf}" opacity="0.55"/>`);
    }

    // Track separator
    out.push(`<line x1="${MARGIN_L}" y1="${trackTop}" x2="${W - MARGIN_R}" y2="${trackTop}" stroke="${T.line}" stroke-width="0.5" opacity="0.45"/>`);

    // Left-edge color bar
    out.push(`<rect x="${MARGIN_L}" y="${trackTop}" width="3" height="${TRACK_H}" fill="${trackColor}"/>`);

    // Track label (right-aligned in sidebar)
    out.push(tx(CHART_X - 12, trackCy + 4,  track.label,    9,   600, trackColor, 'end'));
    if (track.sublabel) {
      out.push(tx(CHART_X - 12, trackCy + 15, track.sublabel, 7,   400, T.muted,     'end'));
    }

    // Sidebar divider
    out.push(`<line x1="${CHART_X}" y1="${trackTop + 10}" x2="${CHART_X}" y2="${trackTop + TRACK_H - 10}" stroke="${T.line}" stroke-width="0.75" opacity="0.3"/>`);

    // Items
    track.items.forEach((item, ii) => {
      const x1  = dateX(item.start);
      const x2  = dateX(item.end);
      const barY = trackTop + BAR_Y_OFF;
      const { svg } = itemBar(x1, x2, barY, item);
      out.push(svg);
      pos[`${ti}_${ii}`] = {
        x1: parseFloat(x1), x2: parseFloat(x2),
        barY, cy: barY + BAR_H / 2,
      };
    });
  });

  // Bottom border
  out.push(`<line x1="${MARGIN_L}" y1="${CHART_BOT}" x2="${W - MARGIN_R}" y2="${CHART_BOT}" stroke="${T.line}" stroke-width="0.75"/>`);

  // ── Cross-lane connectors ──
  for (const conn of connections) {
    const src = pos[`${conn.from[0]}_${conn.from[1]}`];
    const dst = pos[`${conn.to[0]}_${conn.to[1]}`];
    if (!src || !dst) continue;

    // Depart from right edge of source bar, arrive at left edge of dest bar
    const x1 = src.x2, y1 = src.cy;
    const x2 = dst.x1, y2 = dst.cy;

    // Horizontal distance drives control-point spread; min spread = 40px
    const spread = Math.max(Math.abs(x2 - x1) * 0.45, 40);
    const cx1 = f(x1 + spread);
    const cx2 = f(x2 - spread);

    out.push(`<path d="M${f(x1)},${f(y1)} C${cx1},${f(y1)} ${cx2},${f(y2)} ${f(x2)},${f(y2)}" fill="none" stroke="${T.conn}" stroke-width="1.25" stroke-dasharray="5,3" opacity="0.65" marker-end="url(#conn-arrow)"/>`);

    // Connector label at arc midpoint
    if (conn.label) {
      const mx = f((x1 + x2) / 2);
      const my = f((y1 + y2) / 2 - 7);
      const lw = Math.ceil(conn.label.length * 4.2 + 14);
      out.push(`<rect x="${f(mx - lw / 2)}" y="${f(my - 9)}" width="${lw}" height="12" rx="3" fill="${T.pill}" stroke="${T.line}" stroke-width="0.5"/>`);
      out.push(tx(mx, my, conn.label, 6.5, 500, T.slate));
    }
  }

  // ── Today marker ──
  if (today) {
    const todayX = dateX(today);
    out.push(`<line x1="${todayX}" y1="${TITLE_H}" x2="${todayX}" y2="${CHART_BOT}" stroke="${T.accent}" stroke-width="1" stroke-dasharray="4,3" opacity="0.55"/>`);
    const pillW = 40;
    out.push(`<rect x="${f(+todayX - pillW / 2)}" y="${TITLE_H + AXIS_H - 14}" width="${pillW}" height="13" rx="3" fill="${T.accent}"/>`);
    out.push(tx(todayX, TITLE_H + AXIS_H - 3, 'TODAY', 6.5, 700, T.white, 'middle', 1));
  }

  // ── Legend ──
  const legY  = CHART_BOT + 20;
  const legX0 = CHART_X;
  const items = [
    { label: 'Activity',     fill: T.skyBlue },
    { label: 'Deliverable',  fill: T.accent  },
  ];
  items.forEach((li, i) => {
    const lx = legX0 + i * 100;
    out.push(`<rect x="${lx}" y="${legY - 8}" width="22" height="10" rx="2" fill="${li.fill}"/>`);
    out.push(tx(lx + 28, legY, li.label, 7.5, 400, T.muted, 'start'));
  });

  // Footer right
  out.push(tx(W - MARGIN_R, legY, `${title} · DiagramOS Config E · IA Brand · March 2026`, 7.5, 400, T.muted, 'end'));

  out.push('</svg>');
  return out.join('\n');
}

// ─── Demo: 13-week engagement timeline ────────────────────────────────────
// Three parallel workstreams (Strategy / Operations / Platform)
// Scale mode: quarter (monthly ticks)
// 4 cross-lane connections showing deliverable dependencies

const demo = {
  title:    'Intelligent Engagement — 13-Week Program Timeline',
  subtitle: 'STRATEGY · OPERATIONS · PLATFORM  ·  AUDIENCE: DELIVERY LEADS',
  start:    '2026-03-02',
  end:      '2026-05-31',
  mode:     'quarter',
  today:    '2026-03-10',

  phases: [
    { label: 'Discover',      start: '2026-03-02', end: '2026-03-22', fill: T.deepTeal },
    { label: 'Design',        start: '2026-03-23', end: '2026-04-26', fill: T.skyBlue  },
    { label: 'Build & Test',  start: '2026-04-27', end: '2026-05-31', fill: T.mistBlue },
  ],

  tracks: [
    {
      label:    'Strategy',
      sublabel: 'ADAPTIVE BUSINESS MODEL',
      items: [
        { label: 'Stakeholder Interviews',  type: 'activity',    start: '2026-03-02', end: '2026-03-15' },
        { label: 'Strategic Narrative',     type: 'deliverable', start: '2026-03-23', end: '2026-04-05' },
        { label: 'OKR Framework',           type: 'deliverable', start: '2026-04-13', end: '2026-04-26' },
      ],
    },
    {
      label:    'Operations',
      sublabel: 'INTELLIGENT OPERATING MODEL',
      items: [
        { label: 'Current State Assessment', type: 'activity',    start: '2026-03-02', end: '2026-03-22' },
        { label: 'Current State Report',     type: 'deliverable', start: '2026-03-30', end: '2026-04-12' },
        { label: 'Value Stream Mapping',     type: 'activity',    start: '2026-04-06', end: '2026-04-19' },
        { label: 'JTBD & Workflow Mapping',  type: 'activity',    start: '2026-04-20', end: '2026-05-10' },
        { label: 'Workflow Specifications',  type: 'deliverable', start: '2026-05-11', end: '2026-05-24' },
      ],
    },
    {
      label:    'Platform',
      sublabel: 'AGENTIC PLATFORM MODEL',
      items: [
        { label: 'Platform Discovery',    type: 'activity',    start: '2026-03-23', end: '2026-04-12' },
        { label: 'Data Architecture Doc', type: 'deliverable', start: '2026-04-13', end: '2026-04-26' },
        { label: 'Agent Design Specs',    type: 'deliverable', start: '2026-04-27', end: '2026-05-10' },
        { label: 'Technical Build',       type: 'activity',    start: '2026-05-11', end: '2026-05-31' },
      ],
    },
  ],

  // [track, item] references
  connections: [
    { from: [0, 0], to: [2, 0], label: 'Scopes'  },   // Stakeholder Interviews → Platform Discovery
    { from: [1, 1], to: [2, 1], label: 'Informs' },   // Current State Report   → Data Architecture Doc
    { from: [0, 2], to: [1, 4], label: 'Validates'},   // OKR Framework          → Workflow Specifications
    { from: [1, 3], to: [2, 2], label: 'Informs' },   // JTBD & Workflow Mapping → Agent Design Specs
  ],
};

const svg = renderTimeline(demo);
writeFileSync(new URL('./Timeline-demo.svg', import.meta.url), svg, 'utf8');
console.log('✓ Written outputs/Timeline-demo.svg');
console.log(`  Tracks: ${demo.tracks.length}  Connections: ${demo.connections.length}`);
console.log(`  Scale: ${demo.mode}  Range: ${demo.start} → ${demo.end}`);
