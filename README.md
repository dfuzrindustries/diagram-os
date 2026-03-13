# DiagramOS

An agentic diagram production system for Intelligent Agency. Takes a description of a system — in plain language, an image, or structured JSON — and produces styled SVG diagrams conforming to the IA design system.

---

## What It Does

DiagramOS converts any input (prose, image, JSON) into production-ready SVG diagrams through a multi-agent pipeline. Every output is an SVG file plus a companion JSON schema for downstream orchestration.

The system has one job: make complex systems legible to three audiences at once — the executive who needs orientation, the architect who needs structure, and the engineer who needs detail.

---

## Diagram Configs

| Config | Type | Render Mode | Best For |
|--------|------|-------------|----------|
| A | Platform Architecture | Perspective | Three-layer platform systems, ontologies |
| B | Domain / Integration | Perspective | Two-layer domains, integration maps |
| C | Workflow | Flat | Linear processes, single-plane flows |
| D | Service Architecture | Flat (bands) | Enterprise service stacks, data mesh |
| E | Timeline | Flat (swimlane) | Roadmaps, program plans, delivery schedules |

### Config E — Timeline Scale Modes

| Mode | Tick Granularity | Best For |
|------|-----------------|----------|
| `sprint` | Weekly | < 8 weeks |
| `quarter` | Monthly | 2–9 months |
| `roadmap` | Quarterly | > 9 months |

---

## Agent Hierarchy

| Task | Agent File |
|------|-----------|
| Analyze an existing diagram | `agents/analyzer.md` |
| Assemble a new diagram | `agents/assembler.md` |
| Evolve the design system | `agents/evolver.md` |
| QA before delivery | `agents/validator.md` |

The assembler agent handles natural language intake — no JSON required from the user. It infers diagram type, scale, entities, and relationships from a plain-language description, then resolves the full configuration before rendering.

---

## Renderers

All renderers live in `outputs/` and are tracked in git. Generated SVGs and JSON are gitignored.

| File | Output | Description |
|------|--------|-------------|
| `render-svg.mjs` | `IntelligentOS.svg` | IntelligentOS v3 — perspective platform architecture |
| `render-ios-v4.mjs` | `IntelligentOS_v4.svg` | IntelligentOS v4.1 — sub-layer containers + full deliverable chips |
| `render-modern-arch.mjs` | `ModernArchitecture.svg` | Config D flat enterprise architecture |
| `render-modern-arch-mixed.mjs` | `ModernArchitecture-Mixed.svg` | Mixed mode (flat + perspective) proof of concept |
| `render-timeline.mjs` | `Timeline-demo.svg` | Config E timeline — exported `renderTimeline(config)` API |
| `render-productlaunch-timeline.mjs` | `ProductLaunch-timeline.svg` | 6-month product launch (natural language → timeline demo) |
| `render-value-engine.mjs` | `ValueEngine.svg` | IA Value Engine — journey arc + 32 workflow groups |

---

## Design System

Governed by `design-system/system.md`. All color and typography values from `design-system/tokens.json` — never hardcoded.

**Brand palette:**

| Token | Hex | Role |
|-------|-----|------|
| `brand.charcoal` | `#252930` | Primary text, dark fills |
| `brand.deepTeal` | `#1E4A57` | Platform fills, structural emphasis |
| `brand.slate` | `#656578` | Secondary labels, muted |
| `brand.skyBlue` | `#6BA4C8` | Mid highlights, activities |
| `brand.mistBlue` | `#9EB3C4` | Subtle fills, inactive |
| `brand.blazeOrange` | `#E84E1B` | Brand accent — deliverables, emphasis |
| `brand.volt` | `#D4E100` | Brand accent — secondary emphasis |
| `brand.offWhite` | `#F1F3F1` | Light surfaces, reversed text |

**Rules:**
- All colors from tokens only — no hardcoded hex
- No traffic-light color conventions (red ≠ bad, green ≠ good)
- Brand accent coverage (blazeOrange + volt) ≤ 10% per diagram
- Connector labels: verb form, ≤ 2 words

---

## Usage

Run any renderer directly with Node.js (no browser required):

```bash
node outputs/render-timeline.mjs
node outputs/render-value-engine.mjs
```

Or import the timeline API into your own render script:

```js
import { renderTimeline } from './render-timeline.mjs';

const svg = renderTimeline({
  title:   'My Roadmap',
  start:   '2026-03-10',
  end:     '2026-09-10',
  mode:    'quarter',
  today:   '2026-03-13',
  phases:  [{ label: 'Discovery', start: '2026-03-10', end: '2026-05-01' }],
  tracks:  [
    {
      label: 'Engineering',
      items: [
        { label: 'Infrastructure', type: 'activity',    start: '2026-03-10', end: '2026-04-12' },
        { label: 'Platform Launch', type: 'deliverable', start: '2026-07-13', end: '2026-09-07' },
      ],
    },
  ],
  connections: [],
});
```

See `docs/user-guide.md` for the full prompting reference, including natural language intake, iteration prompts, and common mistakes.

---

## Repository Structure

```
diagram-os/
├── agents/                  # Agent instruction files
│   ├── analyzer.md
│   ├── assembler.md         # Includes Intake paths A–E
│   ├── evolver.md
│   └── validator.md
├── design-system/
│   ├── system.md            # Full design system specification
│   ├── tokens.json          # Color, typography, layout tokens (v0.3.0)
│   └── icon-taxonomy.md
├── docs/
│   └── user-guide.md        # Prompting reference for non-technical users
├── orchestration/
│   ├── manifest.json        # Tool interface for orchestration layer
│   └── hooks.md
├── outputs/                 # Render scripts (tracked) + SVG outputs (gitignored)
│   ├── render-timeline.mjs
│   ├── render-value-engine.mjs
│   └── ...
├── inputs/                  # Source assets — gitignored
├── changelog.md
├── CLAUDE.md                # Claude Code project instructions
└── README.md
```

---

## Changelog

See `changelog.md` for full version history. Current version: **v0.9.0**.

| Version | Summary |
|---------|---------|
| v0.9.0 | Config E Timeline — swimlanes, activities, deliverables, cross-lane connectors |
| v0.8.0 | IntelligentOS v4.1 — sub-layer containers + full deliverable chip layout |
| v0.7.0 | IntelligentOS v4 + Icon Library v1 |
| v0.6.0 | renderMode system + mixed mode renderer + user guide |
| v0.5.0 | Config D service band stack — serviceBand, zone, dataChip primitives |
| v0.4.0 | Intelligent Agency brand palette — 8 brand.* tokens |
| v0.3.0 | One-point perspective engine — trapezoid platforms, perspective grid |
| v0.2.0 | Palantir style — hatching, ground rings, cascade fans |
| v0.1.0 | Initial seed — design system, tokens, schema, agents |

---

*Intelligent Agency · DiagramOS · March 2026*
