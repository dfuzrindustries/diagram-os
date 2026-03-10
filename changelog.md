# DiagramOS Changelog

## v0.9.0 — Config E: Timeline Component
**Date:** 2026-03-10

### Added
- **`design-system/tokens.json`** — `timeline` namespace: activityFill, deliverableFill, trackLabelColor, trackBarH=28, trackHeight=80, labelWidth=152, connectorColor, gridOpacities, phaseOpacity, todayColor, trackAccentColors[]
- **`design-system/system.md`** — Config E section: element types, scale modes, cross-lane connector rules, phase band rules, layout constants
- **`outputs/render-timeline.mjs`** — exported `renderTimeline(config)` API:
  - `computeTicks(startDate, endDate, mode)` — auto tick positions for sprint/quarter/roadmap
  - `itemBar()` — activity (skyBlue) or deliverable (blazeOrange + diamond marker)
  - Cross-lane bezier connectors, SVG `<defs>` arrowhead, verb label at midpoint
  - Phase bands, today marker, alternating lane stripe, track left-edge color bar
- **`outputs/Timeline-demo.svg`** — 3-track, 13-week engagement demo:
  - Strategy / Operations / Platform tracks; Discover / Design / Build & Test phases
  - 12 items (6 activities + 6 deliverables); 4 cross-lane connections; today marker

### Design decisions
- Activity=skyBlue, deliverable=blazeOrange — color carries all semantic load, no extra markers
- Deliverable: small white diamond inside bar (when wide enough) for quick scanning
- Connector routing: right edge → left edge, cubic bezier, backward connections valid (cross-track parallel dependency)
- Scale-agnostic: same visual grammar at any mode; tick granularity adapts

---

## v0.8.0 — IntelligentOS v4.1 — Sub-layer Containers + Full Deliverable Detail
**Date:** 2026-03-09
**Source:** inputs/diagrams/IntelligentOS_v3.jsx

### Changed
- **`outputs/render-ios-v4.mjs`** — complete rewrite of IntelligentOS v4:
  - **OLD (rejected):** Each sub-layer heading = a single entity node; all deliverables omitted
  - **NEW:** Each sub-layer heading = a labeled container panel with every deliverable as a chip inside
  - P1 Adaptive Business Model: 4 containers × 13 deliverables total
  - P2 Intelligent Operating Model: 8 numbered containers × 25 deliverables total
  - P3 Agentic Platform Model: 4 containers × 14 deliverables total
  - Application Canvas: 9 input chips (colored by source platform) + 5 output items
- **New primitives:**
  - `layoutChips(deliverables, availW)` — row-wrapping chip layout, returns `{chips, totalChipH}`
  - `subLayerPanel(px, py, pw, title, deliverables, opts)` — titled container with tinted header + chips
  - `platformGrid(layers, startX, startY, availW, opts)` — 2-column grid, variable row heights
  - `containerArea(yFront, hwFront, yBack)` — computes usable rect inside perspective trapezoid at top edge
- Canvas: 1400×1460, VP=(700, −759.2), 3 perspective platforms + flat canvas
- Platform surfaces differentiated: surf (#F7F6F3) / surfAlt (#EDEBE7) / meshFill (#F5F4F1)
- Panel title fill colors: P1=deepTeal, P2=skyBlue, P3=accent (blazeOrange)
- Canvas inputs colored by source: ops=skyBlue, plat=blazeOrange

### Notes
- Icon library v1 temporarily removed from this render (container approach replaces entity nodes)
- Icon library preserved in git history; will be reintegrated as design system component set
- `CONT_MARGIN_TOP=40`, `CONT_SIDE_INSET=28`, `CONT_MARGIN_BOT=20` — tuning constants

---

## v0.7.0 — IntelligentOS v4 + Icon Library v1
**Date:** 2026-03-09
**Source:** inputs/diagrams/IntelligentOS_v3.jsx

### Added
- **Icon Library v1** in `render-ios-v4.mjs` — 8 deliverable-type icons:
  - `doc` — page with corner fold + ruled lines (Reports, Narratives, Plans)
  - `framework` — descending bars (OKR hierarchy, RACI, org structure)
  - `model` — isometric stacked layers (Business Model, Data Model, Success Model)
  - `assessment` — clipboard with check items (Assessments, Inventories, Roadmaps)
  - `blueprint` — technical schematic with crosshairs (Specs, Blueprints, Maps)
  - `agent` — hexagon with inner node (AI agents, Orchestration)
  - `data` — cylinder (Data architecture, Schemas, Data stores)
  - `output` — bullseye (Generated deliverables — Canvas only)
  - Icon type is determined by the deliverable's nature, not its name
  - All icons use same stroke weight (1.5px) and fill (T.panel) for visual consistency
- **`outputs/render-ios-v4.mjs`** — 4-layer Config A platform architecture:
  - P1 Adaptive Business Model (yFront=240): Vision/Mission, Strategic OKRs, Business Model, Culture & Readiness
  - P2 Intelligent Operating Model (yFront=520): 8 entities in 2 rows — Current State through Change Enablement
  - P3 Agentic Platform Model (yFront=790): AI Agents (accent), Semantic Layer, Data Layer, Infrastructure
  - Application Canvas (flat, dark, y=930): 5 outputs with accent icons on dark background
  - Cascade connections P1→P2→P3→Canvas (expanding fan on final seam)
  - Accent: Decision Intelligence (P2) + AI Agents (P3) = 2/17 entities = 11.8% ≤ 20% ✓
- **`outputs/IntelligentOS_v4.svg`** — first rendering

### Notes
- Icon library to be extracted as reusable design system components in a future pass
- C-suite audience: layer labels include track + audience in pill subtitle
- Canvas rendered dark (#252930 fill) with blazeOrange output items — signals generation endpoint

---

## v0.6.0 — renderMode + Mixed Mode + User Guide
**Date:** 2026-03-09

### Added
- **`renderMode`** per-layer property formalized in system.md Section 4:
  - `flat` — serviceBand / zone / dataChip primitives
  - `perspective` — platform() / ent() / cascade() primitives
  - `mixed` — both, declared per layer (seam connectors handle the transition)
  - Default mode table by config (A/B/C/D) documented
- **Seam connector rules** — flat→perspective: fan cascade contracts inward;
  perspective→flat: single centered arrow (convergence signal, not parallel fan)
- **`outputs/render-modern-arch-mixed.mjs`** — mixed mode proof of concept:
  - Bands 1+2 flat → fan cascade → perspective Data Mesh → arrow → Band 3 flat
  - VP = (700, −478.4); zones overlay perspective surface at `opacity="0.94"`
- **`outputs/ModernArchitecture-Mixed.svg`** — first mixed-mode diagram
- **`docs/user-guide.md`** — complete user guide covering prompt anatomy,
  diagram types, renderMode, entity classes, relationship rules, evolution guide,
  iteration prompts, common mistakes, and vocabulary reference

### Design Decisions
- flat→perspective cascade contracts because data arrives at the platform from
  many sources; perspective→flat is a single arrow because the platform produces
  one structured output — asymmetry is intentional and semantically correct
- Zone overlays use `opacity="0.94"` so the perspective grid shows faintly through

---

## v0.5.0 — Config D: Service Band Stack
**Date:** 2026-03-09
**Source:** inputs/diagrams/ModernArchitecture.png — Modern Application Architecture.

### Added
- **Config D — Four-Layer Service Band Stack** in system.md Section 4:
  - BAND 1 (Engagement) + BAND 2 (API/Gateway) + PLATFORM (Data/Intelligence) + BAND 4 (Records)
  - Flat horizontal bands — NOT isometric; sharp corners signal infrastructure layer
- **Section 13** in system.md: Config D component specs (13A–13D)
  - 13A: `serviceBand` — flat horizontal tier with title + auto-sized chips
  - 13B: `zone` — labeled sub-region within a flat platform container
  - 13C: `dataChip` — compact named item: standard (skyBlue), accent (blazeOrange), special (mistBlue)
  - 13D: `sideLabel` — vertical rotated bracket + text for logical grouping annotations
- **New tokens** in tokens.json (bumped to v0.3.0):
  - `serviceBand.*`: fill, text, height, chipFill, chipText, chipRadius
  - `zone.*`: fill, altFill, border, titleText, titleSize, radius
  - `dataChip.*`: fill, text, accentFill, specialFill, radius
  - `dataMesh.*`: containerFill, containerBorder, containerBorderWeight
- **`outputs/render-modern-arch.mjs`** rewritten (v2):
  - 4-layer Config D layout: two service bands + Data Mesh container + systems band
  - Data Mesh has 4 internal zones: Data Products (5 chips), Knowledge Graph (Neo4j),
    Data Lakehouse (Gold/Silver/Bronze tiers), Analytics / AI Models (4 chips, AI Models accent)
  - Side annotations with bracket lines: Systems of Engagement / Unified Data / Systems of Record
  - Knowledge Graph chip uses brand.mistBlue (dataChip.specialFill) to signal graph platform
  - AI Models chip uses brand.blazeOrange (dataChip.accentFill) for hero emphasis
- **`outputs/ModernArchitecture.svg`** — first correct rendering of ModernArchitecture.png

### Design Decisions
- Config D is a parallel vocabulary to the isometric Config A/B/C — not a replacement
- `serviceBand` uses brand.deepTeal fill because top/bottom service tiers have structural authority
- `dataChip` uses brand.skyBlue as default (mid-tone, readable, thematically connected to data)
- Zone titles use brand.deepTeal to tie zone identity back to the structural color
- The 4px gap between Band 1 and Band 2 (background shows through) visually groups the
  two service bands while keeping them individually readable

---

## v0.4.0 — Intelligent Agency Brand Palette
**Date:** 2026-03-09
**Source:** IntelleigentAgencyBrandIDfinalWIP.pdf, slide 5.

### Added
- **`brand.*` token namespace** in tokens.json (8 new tokens):
  - `brand.charcoal` (#252930) — primary text, dark backgrounds
  - `brand.deepTeal` (#1E4A57) — platform fills, strong structural emphasis
  - `brand.slate` (#656578) — secondary labels, muted elements
  - `brand.skyBlue` (#6BA4C8) — mid-tone highlights, surface tints
  - `brand.mistBlue` (#9EB3C4) — subtle fills, inactive states
  - `brand.blazeOrange` (#E84E1B) — brand accent, ≤10% coverage
  - `brand.volt` (#D4E100) — brand accent, ≤10% coverage
  - `brand.offWhite` (#F1F3F1) — light surfaces, reversed-text backgrounds
- **Section 2 updated** in system.md: "Intelligent Agency Brand Palette" table + brand accent rule
- `brandAccentRule` in tokens.json rules: blazeOrange/volt are brand expression only, never status indicators
- tokens.json bumped to v0.2.0; system.md bumped to v0.2

### Rules Added
- Combined brand accent coverage (blazeOrange + volt) ≤10% per diagram
- Brand accent colors must never be used as status/alert indicators

---

## v0.3.0 — One-Point Perspective Engine
**Date:** 2026-03-07
**Source:** Mathematical derivation from palantir.png reference image.

### Added
- **Section 12A rewrite** in system.md: Full one-point perspective mathematical model
  - Single VP at (W/2, VP_Y) where VP_Y = −H × 0.52 ≈ −499
  - `perspT(y, yFront) = (y − VP_Y) / (yFront − VP_Y)` — perspective scale function
  - Trapezoid corners: front edge at hwFront, back edge at hwFront × tBack
  - Radial grid lines: evenly spaced on front edge, projected to back via tBack
  - Horizontal grid lines: at perspective-spaced t intervals (closer together near back)
- `vpYRatio` token in tokens.json isometric block

### Changed (render-svg.mjs v4)
- Replaced parallelogram platforms with perspective-correct trapezoids
  - Platforms are now wider at the bottom/front and narrower at the top/back
  - Mid platform tapers to ~75% width at back — strongest depth cue
- Replaced CSS pattern grid with explicit perspective-correct radial + horizontal lines
- Cascade connectors now span correct trapezoid edge coordinates

### Taper Values (VP_Y = −499)
- Top platform:  86.1% width at back edge
- Mid platform:  75.4% width at back edge
- Bot platform:  88.8% width at back edge

---

## v0.2.0 — Palantir Style Codification
**Date:** 2026-03-07
**Source:** Visual analysis of palantir.png reference image.

### Added
- **Section 12** in system.md: Isometric Rendering Specifications (12A–12E)
  - 12A: Platform three-face construction with hatching on side faces
  - 12B: Entity ground rings (elliptical, anchored to surface)
  - 12C: Cascade connector fan pattern (9-line spread)
  - 12D: Relationship pill label fill treatment (teal fill, white text)
  - 12E: Top-layer monitor treatment (aspirational, v0.2 target)
- **tokens.isometric** block in tokens.json: platformFace, hatchStroke,
  hatchSpacing, hatchWeight, hatchOpacity, groundRing* values,
  relPillFill, relPillText, cascade* values
- Updated Open Items: added top-layer screen/monitor upgrade path

### Changed (render-svg.mjs + IntelligentOS.svg)
- Platform side/bottom faces: solid fill → platformFace + horizontal hatching
- Relationship pill labels: outline → relPillFill (teal) + relPillText (white)
- Entity nodes: added ground ring ellipses beneath each node
- Cascade connectors: 3 parallel lines → 9-line fan spread

### Notes
- No tokens were removed or renamed (backward compatible)
- Existing outputs remain valid; re-run render-svg.mjs to apply new style

---


## v0.1.0 — Initial Seed
**Date:** $(date +%Y-%m-%d)
**Source:** Derived from session analysis of Palantir Platform Architecture
  diagram and IntelligentOS v1.1 diagram by Vivid Consulting Group.

### Established
- Design system v0.1 (system.md)
- Token set (tokens.json)
- Four-agent architecture: analyzer, assembler, evolver, validator
- Three layer configs: A (three-plane), B (two-plane), C (single-plane)
- Six entity classes, four connector types
- Six diagram types with audience mapping
- JSON schema for structured diagram data
- Orchestration manifest for OpenClaw integration
- IntelligentOS v1.1 as first reference example (intelligentOS.json)

### Open Items
- Icon library: telco + finserv domain icons (highest priority)
- Dark mode token variants
- Client overlay specs
- Figma component library
