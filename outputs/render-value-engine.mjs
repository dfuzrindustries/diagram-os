// render-value-engine.mjs — DiagramOS
// IA Value Engine & Value Streams
// Two-zone diagram: Journey Arc (top) + WFG Reference Grid (bottom)

import { writeFileSync } from 'fs';

// ─── Tokens ──────────────────────────────────────────────────────────────────
const T = {
  bg:       '#F8F8F6',
  line:     '#C8C4BC',
  dark:     '#252930',
  deepTeal: '#1E4A57',
  skyBlue:  '#6BA4C8',
  mistBlue: '#9EB3C4',
  accent:   '#E84E1B',
  slate:    '#656578',
  surf:     '#FFFFFF',
  surfAlt:  '#F7F6F3',
  pill:     '#F0F0EE',
  muted:    '#9A9590',
  white:    '#FFFFFF',
  offWhite: '#F1F3F1',
};

const FONT = "'Inter', system-ui, sans-serif";
const f    = n  => parseFloat(n.toFixed(1));
const esc  = s  => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function tx(x, y, s, size=9, weight=400, fill=T.dark, anchor='middle', spacing=0) {
  const ls = spacing ? ` letter-spacing="${spacing}"` : '';
  return `<text x="${f(x)}" y="${f(y)}" text-anchor="${anchor}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}"${ls}>${esc(s)}</text>`;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const PHASES = [
  { label: 'PHASE 1 — ACQUIRE',          color: T.deepTeal, vs: [0]     },
  { label: 'PHASE 2 — PROVE & DEPLOY',   color: T.skyBlue,  vs: [1,2,3] },
  { label: 'PHASE 3 — SCALE & COMPOUND', color: T.dark,     vs: [4,5]   },
];

const VS = [
  {
    id: 'VS1', name: 'Qualify & Win', phase: 0,
    inv: '$0', invNote: 'IA cost of sale', dur: '2–4 weeks',
    cumStart: 'Day 0',
    outputs: ['Opportunity Brief', 'Signed SOW', 'Proposal'],
    wfgs: [
      { id:'1.1', label:'Lead Qualification',         full:true },
      { id:'1.2', label:'Solution Shaping',           full:true },
      { id:'1.3', label:'Proposal Development',       full:true },
      { id:'1.4', label:'Deal Close',                 full:true },
      { id:'1.5', label:'Sales-to-Delivery Handoff',  full:true },
    ],
  },
  {
    id: 'VS2', name: 'Diagnose', phase: 1,
    inv: '$25K', invNote: '1-day workshop', dur: '~3 weeks',
    cumStart: 'Week 3',
    outputs: ['AI Assessment', 'Readiness Snapshot', 'POC SOW'],
    wfgs: [
      { id:'2.1', label:'Pre-Workshop Discovery',      full:true },
      { id:'2.2', label:'Strategic Diagnostic',        full:true },
      { id:'2.3', label:'Readiness Assessment',        full:true },
      { id:'2.4', label:'Opportunity Prioritization',  full:true },
      { id:'2.5', label:'SOW & Close',                 full:true },
      { id:'2.6', label:'Post-Workshop Deliverables',  full:true },
    ],
  },
  {
    id: 'VS3', name: 'Validate', phase: 1,
    inv: '$75K', invNote: '30-day POC', dur: '~5 weeks',
    cumStart: 'Week 6',
    outputs: ['Working Prototypes', 'DFVR Assessment', 'Pilot SOW'],
    wfgs: [
      { id:'3.1', label:'POC Setup',               full:true },
      { id:'3.2', label:'Requirements Refinement', full:true },
      { id:'3.3', label:'Prototype Development',   full:true },
      { id:'3.4', label:'User Validation',         full:true },
      { id:'3.5', label:'Assessment & Decision',   full:true },
      { id:'3.6', label:'Executive Readout',       full:true },
    ],
  },
  {
    id: 'VS4', name: 'Deploy', phase: 1,
    inv: '$150K', invNote: '60–90 day pilot', dur: '~12 weeks',
    cumStart: 'Week 11',
    outputs: ['Production System', 'ROI Evidence', 'Expansion Roadmap'],
    wfgs: [
      { id:'4.1', label:'Production Foundation',      full:false },
      { id:'4.2', label:'Phased User Deployment',     full:false },
      { id:'4.3', label:'Optimization & ROI',         full:false },
      { id:'4.4', label:'Executive Readout & Scale',  full:false },
    ],
  },
  {
    id: 'VS5', name: 'Transform', phase: 2,
    inv: '$600K', invNote: '12-month program', dur: '12 months',
    cumStart: 'Month 6',
    outputs: ['Enterprise-Wide AI', 'AI Center of Excellence', 'Level 5 Maturity'],
    wfgs: [
      { id:'5.1', label:'Platform Deployment',             full:false },
      { id:'5.2', label:'Priority Function AI Deployment', full:false },
      { id:'5.3', label:'Cycle Assessment & Planning',     full:false },
      { id:'5.4', label:'Cross-Functional Orchestration',  full:false },
      { id:'5.5', label:'Autonomous Process Enablement',   full:false },
      { id:'5.6', label:'Transformation Completion',       full:false },
    ],
  },
  {
    id: 'VS6', name: 'Partner', phase: 2,
    inv: 'Co-Invest', invNote: 'Revenue share model', dur: 'Ongoing',
    cumStart: 'Month 18',
    outputs: ['Co-Investment Model', 'Joint IP', 'Revenue Share'],
    wfgs: [
      { id:'6.1', label:'Partnership Foundation',   full:false },
      { id:'6.2', label:'Innovation Sprints',       full:false },
      { id:'6.3', label:'Fund Execution',           full:false },
      { id:'6.4', label:'Continuous Improvement',   full:false },
      { id:'6.5', label:'Strategic Advisory',       full:false },
    ],
  },
];

// ─── Layout constants ─────────────────────────────────────────────────────────
const W    = 1400;
const MAR  = 24;
const CON  = W - 2 * MAR;  // 1352

// VS block widths — proportional to duration (VS5 dominates intentionally)
// 132+132+157+207+544+140 = 1312; + 5×8 gaps = 1352 ✓
const VS_W  = [132, 132, 157, 207, 544, 140];
const BGAP  = 8;

// Compute VS block left-x positions
const VSX = VS_W.reduce((acc, w, i) => {
  acc.push(i === 0 ? MAR : acc[i-1] + VS_W[i-1] + BGAP);
  return acc;
}, []);

const TITLE_H  = 80;
const PHASE_H  = 32;   // phase label strip height
const BLOCK_H  = 174;  // VS block height total
const HDR_H    = 28;   // colored header strip
const TIME_H   = 40;   // time axis row
const FB_H     = 40;   // feedback loop row
const SEP_H    = 72;   // section separator
const WFG_HH   = 30;   // WFG column header
const WFG_CH   = 20;   // WFG chip height
const WFG_CG   = 5;    // chip gap
const WFG_PAD  = 14;
const MAX_WFG  = Math.max(...VS.map(v => v.wfgs.length));  // 6
const WFG_AREA = WFG_PAD + MAX_WFG * (WFG_CH + WFG_CG) + WFG_PAD;
const LEG_H    = 46;

const Y_TITLE  = 0;
const Y_PHASE  = Y_TITLE + TITLE_H;
const Y_BLOCKS = Y_PHASE + PHASE_H;
const Y_TIME   = Y_BLOCKS + BLOCK_H + 6;
const Y_FB     = Y_TIME + TIME_H;
const Y_SEP    = Y_FB + FB_H;
const Y_WFGHH  = Y_SEP + SEP_H;
const Y_WFGCH  = Y_WFGHH + WFG_HH;
const Y_LEG    = Y_WFGCH + WFG_AREA;
const H        = Y_LEG + LEG_H;

const out = [];

// ─── SVG root + defs ─────────────────────────────────────────────────────────
out.push(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
<rect width="${W}" height="${H}" fill="${T.bg}"/>
<defs>
  <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4"
    markerWidth="5" markerHeight="5" orient="auto">
    <path d="M1,1.5 L7,4 L1,6.5" fill="none" stroke="${T.muted}"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
  <marker id="arr-acc" viewBox="0 0 8 8" refX="7" refY="4"
    markerWidth="5" markerHeight="5" orient="auto">
    <path d="M1,1.5 L7,4 L1,6.5" fill="none" stroke="${T.accent}"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
</defs>`);

// ─── Title block ──────────────────────────────────────────────────────────────
out.push(tx(W/2, 36, 'IA Value Engine & Value Streams', 17, 700, T.dark));
out.push(tx(W/2, 56, 'PROGRESSIVE COMMITMENT MODEL  ·  6 VALUE STREAMS  ·  32 WORKFLOW GROUPS', 7.5, 400, T.muted, 'middle', 1.5));
out.push(`<line x1="${MAR}" y1="${TITLE_H - 8}" x2="${W-MAR}" y2="${TITLE_H - 8}" stroke="${T.line}" stroke-width="0.75"/>`);

// ─── Phase bands ─────────────────────────────────────────────────────────────
for (const ph of PHASES) {
  const vi  = ph.vs[0];
  const vl  = ph.vs[ph.vs.length - 1];
  const px  = VSX[vi];
  const pw  = VSX[vl] + VS_W[vl] - px;

  // Subtle tinted background spanning phase + blocks + time axis
  out.push(`<rect x="${px}" y="${Y_PHASE}" width="${pw}" height="${PHASE_H + BLOCK_H + 6 + TIME_H + FB_H - 2}" fill="${ph.color}" opacity="0.04" rx="2"/>`);

  // Phase label strip
  out.push(`<rect x="${px}" y="${Y_PHASE}" width="${pw}" height="${PHASE_H}" fill="${ph.color}" opacity="0.14" rx="2"/>`);
  out.push(tx(f(px + pw/2), Y_PHASE + 20, ph.label, 7.5, 700, ph.color, 'middle', 1.5));
}

// ─── VS blocks ───────────────────────────────────────────────────────────────
for (let i = 0; i < VS.length; i++) {
  const vs    = VS[i];
  const bx    = VSX[i];
  const bw    = VS_W[i];
  const by    = Y_BLOCKS;
  const ph    = PHASES[vs.phase];
  const bodyY = by + HDR_H;

  // Block shadow / depth (subtle)
  out.push(`<rect x="${bx+2}" y="${by+2}" width="${bw}" height="${BLOCK_H}" rx="3" fill="${T.dark}" opacity="0.04"/>`);

  // Block body
  out.push(`<rect x="${bx}" y="${by}" width="${bw}" height="${BLOCK_H}" rx="3" fill="${T.surf}" stroke="${T.line}" stroke-width="0.75"/>`);

  // Header strip (phase color)
  out.push(`<rect x="${bx}" y="${by}" width="${bw}" height="${HDR_H}" rx="3" fill="${ph.color}"/>`);
  // Square the bottom corners of header
  out.push(`<rect x="${bx}" y="${by + HDR_H - 4}" width="${bw}" height="4" fill="${ph.color}"/>`);

  // VS id (small, left-aligned in header)
  out.push(tx(bx + 9, by + HDR_H - 9, vs.id, 7, 700, `${T.white}99`, 'start', 1));
  // VS name (right of id)
  out.push(tx(bx + 36, by + HDR_H - 9, vs.name, 8.5, 600, T.white, 'start'));

  // ── Body content ──

  // Investment amount — prominent
  out.push(tx(f(bx + bw/2), bodyY + 22, vs.inv, 14, 700, T.deepTeal));
  // Investment note
  out.push(tx(f(bx + bw/2), bodyY + 34, vs.invNote, 6.5, 400, T.muted));

  // Duration pill
  const durText = vs.dur;
  const durW    = Math.max(Math.ceil(durText.length * 5.0 + 18), 54);
  const durPillX = f(bx + bw/2 - durW/2);
  out.push(`<rect x="${durPillX}" y="${bodyY + 39}" width="${durW}" height="14" rx="3" fill="${T.pill}"/>`);
  out.push(tx(f(bx + bw/2), bodyY + 49, durText, 6.5, 500, T.slate));

  // Divider
  out.push(`<line x1="${bx+8}" y1="${bodyY + 59}" x2="${bx+bw-8}" y2="${bodyY + 59}" stroke="${T.line}" stroke-width="0.5" opacity="0.5"/>`);

  // "KEY OUTPUTS" micro-label
  out.push(tx(bx + 10, bodyY + 70, 'KEY OUTPUTS', 5.5, 700, T.muted, 'start', 1));

  // Output chips — stacked vertically
  const chipX = bx + 8;
  const chipW = bw - 16;
  vs.outputs.forEach((op, oi) => {
    const cy = bodyY + 74 + oi * 18;
    out.push(`<rect x="${chipX}" y="${cy}" width="${chipW}" height="14" rx="2" fill="${T.deepTeal}" opacity="0.11"/>`);
    out.push(tx(f(bx + bw/2), cy + 10, op, 6, 500, T.deepTeal));
  });
}

// ─── Connector arrows between VS blocks ──────────────────────────────────────
for (let i = 0; i < VS.length - 1; i++) {
  const cx = f(VSX[i] + VS_W[i] + BGAP/2);
  const cy = f(Y_BLOCKS + BLOCK_H/2);
  // Small solid right-pointing triangle
  out.push(`<polygon points="${cx-3},${cy-5} ${cx+4},${cy} ${cx-3},${cy+5}" fill="${T.muted}" opacity="0.55"/>`);
}

// ─── Time axis ───────────────────────────────────────────────────────────────
const taxY = Y_TIME + 12;  // baseline y of time axis

// Horizontal line spanning VS blocks (not full width — just from VS1 left to VS6 right)
const taxX1 = VSX[0];
const taxX2 = VSX[5] + VS_W[5];
out.push(`<line x1="${taxX1}" y1="${taxY}" x2="${taxX2}" y2="${taxY}" stroke="${T.line}" stroke-width="0.75"/>`);

// Tick marks and cumulative-start labels at each VS left boundary
VS.forEach((vs, i) => {
  const tx_x = VSX[i];
  out.push(`<line x1="${tx_x}" y1="${taxY - 5}" x2="${tx_x}" y2="${taxY + 4}" stroke="${T.muted}" stroke-width="0.75"/>`);
  out.push(tx(tx_x, taxY + 16, vs.cumStart, 6.5, 400, T.muted));
});

// End tick at VS6 right edge
const endX = VSX[5] + VS_W[5];
out.push(`<line x1="${endX}" y1="${taxY - 5}" x2="${endX}" y2="${taxY + 4}" stroke="${T.muted}" stroke-width="0.75"/>`);
out.push(tx(endX - 2, taxY + 16, '→', 7, 400, T.muted, 'end'));

// "ENGAGEMENT TIMELINE" label — left
out.push(tx(taxX1, taxY + 16, '', 6.5, 400, T.muted, 'start'));
// Cumulative investment callout — right of VS5, below axis
const invX = VSX[4] + VS_W[4]/2;
out.push(tx(invX, taxY + 28, 'Cumulative client investment at VS5: $850K+', 6.5, 500, T.slate, 'middle', 0.5));

// ─── Feedback loop (VS6 → VS1) ───────────────────────────────────────────────
const fbY   = f(Y_FB + 20);
const fbX1  = f(VSX[5] + VS_W[5] - 10);  // departs VS6 right
const fbX2  = f(VSX[0] + 10);             // arrives VS1 left
const fbMid = f((fbX1 + fbX2) / 2);

// Dashed arc — sweeps below time axis
out.push(`<path d="M${fbX1},${fbY} C${f(fbX1+40)},${f(fbY+22)} ${f(fbX2-40)},${f(fbY+22)} ${fbX2},${fbY}" fill="none" stroke="${T.accent}" stroke-width="1.25" stroke-dasharray="5,3" opacity="0.70" marker-end="url(#arr-acc)"/>`);

// Label pill at arc midpoint
const fbLabel = 'Referrals, Case Studies & Market Credibility → VS1';
const fbLW    = Math.ceil(fbLabel.length * 4.3 + 20);
out.push(`<rect x="${f(fbMid - fbLW/2)}" y="${f(fbY + 8)}" width="${fbLW}" height="13" rx="3" fill="${T.bg}" stroke="${T.accent}" stroke-width="0.75" opacity="0.9"/>`);
out.push(tx(fbMid, fbY + 18, fbLabel, 6.5, 500, T.accent));

// ─── Section separator ───────────────────────────────────────────────────────
const sepY = Y_SEP + 12;
out.push(`<line x1="${MAR}" y1="${sepY}" x2="${W-MAR}" y2="${sepY}" stroke="${T.line}" stroke-width="0.75"/>`);

// Section heading
out.push(tx(MAR, sepY + 24, 'WORKFLOW GROUPS', 9, 700, T.dark, 'start', 2));
out.push(tx(MAR, sepY + 38, '32 workflow groups across 6 value streams. Each group maps to one or more agent clusters in the automation layer.', 7, 400, T.muted, 'start'));

// ─── WFG column headers ───────────────────────────────────────────────────────
VS.forEach((vs, i) => {
  const bx    = VSX[i];
  const bw    = VS_W[i];
  const ph    = PHASES[vs.phase];

  // Header block
  out.push(`<rect x="${bx}" y="${Y_WFGHH}" width="${bw}" height="${WFG_HH}" rx="2" fill="${ph.color}"/>`);
  // VS id
  out.push(tx(bx + 8, Y_WFGHH + 11, vs.id, 6.5, 700, `${T.white}88`, 'start', 1));
  // VS name
  out.push(tx(bx + 8, Y_WFGHH + 23, vs.name, 7.5, 600, T.white, 'start'));
});

// ─── WFG chips ───────────────────────────────────────────────────────────────
VS.forEach((vs, i) => {
  const bx   = VSX[i];
  const bw   = VS_W[i];
  const cw   = bw - 12;
  const cx   = bx + 6;

  vs.wfgs.forEach((wfg, wi) => {
    const cy   = Y_WFGCH + WFG_PAD + wi * (WFG_CH + WFG_CG);
    const fill = wfg.full ? T.skyBlue : T.mistBlue;
    const txt  = wfg.full ? T.white : T.dark;

    out.push(`<rect x="${cx}" y="${cy}" width="${cw}" height="${WFG_CH}" rx="3" fill="${fill}" opacity="${wfg.full ? 1 : 0.85}"/>`);

    // WFG id (left, subtle)
    out.push(tx(cx + 6, cy + 13, wfg.id, 5.5, 700, wfg.full ? `${T.white}99` : `${T.dark}66`, 'start', 0.5));

    // WFG name — truncate if needed
    const labelX = cx + 6 + 22;
    const maxW   = cw - 28;
    // Estimate character count that fits
    const maxChars = Math.floor(maxW / 4.5);
    const label  = wfg.label.length > maxChars
      ? wfg.label.slice(0, maxChars - 1) + '…'
      : wfg.label;
    out.push(tx(labelX, cy + 13, label, 6.5, wfg.full ? 500 : 400, txt, 'start'));
  });
});

// WFG column dividers (subtle vertical lines between columns)
for (let i = 1; i < VS.length; i++) {
  const lx = VSX[i] - BGAP/2;
  out.push(`<line x1="${lx}" y1="${Y_WFGHH}" x2="${lx}" y2="${Y_WFGCH + WFG_AREA - WFG_PAD}" stroke="${T.line}" stroke-width="0.4" opacity="0.5"/>`);
}

// ─── Legend ───────────────────────────────────────────────────────────────────
const legY  = Y_LEG + 16;
const legX0 = MAR;

const legItems = [
  { fill: T.skyBlue,  label: 'Full playbook — ready for agent automation',      text: T.white },
  { fill: T.mistBlue, label: 'Abbreviated playbook — expansion needed first',   text: T.dark  },
];

legItems.forEach((li, i) => {
  const lx = legX0 + i * 290;
  out.push(`<rect x="${lx}" y="${legY - 8}" width="22" height="11" rx="2" fill="${li.fill}"/>`);
  out.push(tx(lx + 28, legY, li.label, 7.5, 400, T.muted, 'start'));
});

// Footer
out.push(tx(W - MAR, legY, 'Intelligent Agency · Value Engine v1.1 · DiagramOS · March 2026', 7.5, 400, T.muted, 'end'));

out.push('</svg>');

// ─── Write ────────────────────────────────────────────────────────────────────
const svg = out.join('\n');
writeFileSync(new URL('./ValueEngine.svg', import.meta.url), svg, 'utf8');
console.log(`✓ Written outputs/ValueEngine.svg`);
console.log(`  Canvas: ${W}×${H}px`);
console.log(`  Value streams: ${VS.length}  Phases: ${PHASES.length}  WFGs: ${VS.reduce((n,v) => n + v.wfgs.length, 0)}`);
