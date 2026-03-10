# Technical Diagram Design System
## Vivid Consulting Group — v0.2
### Reference: Palantir Platform Architecture + IntelligentOS v1.1

---

## 1. Design Philosophy

**One diagram, three jobs:** Orient the executive, inform the architect,
guide the implementer. Every diagram serves all three simultaneously
through visual layering — not three separate documents.

**Restraint is the style.** The system works because of what it withholds:
color, weight, decoration. Enforced through strict token constraints.

**Structure before aesthetics.** Layer hierarchy, connector logic, and
entity classification are decided before any visual choices are made.

---

## 2. Color Tokens

See tokens.json for all values. Never hardcode hex values in diagrams.
Use token names only. Token reference:

### Structural Diagram Palette

| Token             | Usage                                          |
|-------------------|------------------------------------------------|
| background        | Canvas. Never pure white.                      |
| sketchLine        | All structural lines, planes, borders          |
| sketchDark        | Labels, icons, entity outlines                 |
| accentPrimary     | Active entities, highlighted relationships     |
| accentSubtle      | Secondary highlights                           |
| surfacePanel      | Flat panel backgrounds                         |
| surfaceAlt        | Platform plane surfaces                        |
| pillBackground    | Entity label pills (default)                   |
| connectorDefault  | Dashed connector lines                         |
| connectorActive   | Active/highlighted flow paths                  |
| labelMuted        | Subtitles, metadata, secondary labels          |

**Rule:** accentPrimary on ≤20% of elements per diagram. More than 20%
means the diagram has a focus problem — resolve in intake, not with color.

### Intelligent Agency Brand Palette
Source: IntelleigentAgencyBrandIDfinalWIP.pdf, slide 5.
Use these tokens for IA-branded diagrams. Reference via `brand.*` namespace.

| Token              | Hex       | Role                                               |
|--------------------|-----------|----------------------------------------------------|
| brand.charcoal     | #252930   | Primary text, icons, dark backgrounds              |
| brand.deepTeal     | #1E4A57   | Platform fills, strong structural emphasis         |
| brand.slate        | #656578   | Secondary labels, muted structural elements        |
| brand.skyBlue      | #6BA4C8   | Mid-tone highlights, platform surface tints        |
| brand.mistBlue     | #9EB3C4   | Subtle fills, inactive states, background tints    |
| brand.blazeOrange  | #E84E1B   | Brand accent — hero emphasis only, ≤10% coverage   |
| brand.volt         | #D4E100   | Brand accent — hero emphasis only, ≤10% coverage   |
| brand.offWhite     | #F1F3F1   | Light surface, reversed-text backgrounds           |

**Brand accent rule:** `brand.blazeOrange` and `brand.volt` are brand expression
colors — never use them as status or alert indicators. Status is communicated
through weight and accent presence only. Combined brand accent coverage ≤10%.

---

## 3. Typography
See tokens.json roles. Never exceed two type sizes within a single layer.
Hierarchy is communicated through position and weight, not size escalation.

---

## 4. Layer Architecture
Every diagram uses one of three configurations. Declare config before
opening the canvas. Each layer also declares a `renderMode`.

### Render Mode

Every layer has a `renderMode`. This is independent of the config — the same
config can mix render modes across layers.

| renderMode    | Primitives                          | Visual signal              |
|---------------|-------------------------------------|----------------------------|
| `flat`        | serviceBand, zone, dataChip         | Thin tier, service layer   |
| `perspective` | platform(), ent(), cascade()        | Hero platform, spatial depth |
| `mixed`       | both — declared per layer           | Hierarchy within hierarchy |

**Default render modes by config:**

| Config | Layer 1 (Top) | Layer 2 (Mid) | Layer 3/4 (Bot) |
|--------|---------------|---------------|-----------------|
| A      | flat          | perspective   | flat            |
| B      | flat          | flat          | —               |
| C      | perspective or flat | —       | —               |
| D      | flat          | flat or perspective | flat      |

**Seam connectors between different render modes:**
- flat → perspective: fan cascade contracts inward (band width → platform back width)
- perspective → flat: single centered arrow (signals convergence, not parallel fan)

The `cascade()` function handles both seam types with the same signature.
Declare the seam direction in the assembler so the correct visual is produced.

### Config A — Three-Plane (Hero Diagrams)
Use for: executive architecture overviews, platform capability maps,
ecosystem diagrams.

  PLANE 1 (Top)    — Application / Interface layer
                     Flat panel style. Grid-based icon arrays.
  PLANE 2 (Middle) — Domain / Ontology layer
                     Isometric 3D. Named entities + relationship labels.
  PLANE 3 (Bottom) — Infrastructure / Data layer
                     Flat panel style. Grid-based icon arrays.

Planes connect via cascade connectors — curved dashed lines fanning
from the edge of one plane to the surface of the next.

### Config D — Four-Layer Service Band Stack
Use for: modern application architecture, enterprise data platform overviews
where service tiers need explicit flat separation rather than isometric depth.

  BAND 1 (Top)     — Engagement/Application layer    (flat serviceBand)
  BAND 2           — API/Gateway/Integration layer   (flat serviceBand)
  PLATFORM (Hero)  — Data/Intelligence platform      (flat or perspective)
  BAND 4 (Bottom)  — Systems of Record               (flat serviceBand)

Service bands are NOT isometric — they are flat horizontal fills.
When `renderMode: flat`, the hero platform uses the `dataMesh` container with
internal `zone` sub-regions and `dataChip` items.
When `renderMode: perspective`, the hero platform uses the one-point perspective
engine; zones overlay the perspective surface as flat rectangles verified safe
from the platform edge at every y position.

Side labels identify logical groupings that span multiple bands.
See Section 13 for full component specs.

### Config E — Timeline (Swimlane Diagrams)
Use for: project plans, program roadmaps, engagement timelines, delivery schedules.
Works at any time scale — sprint (weeks), quarter (months), or roadmap (quarters).

  HEADER        — Title + date axis with computed tick marks
  SWIMLANES     — One horizontal band per workstream / track
  FOOTER        — Legend + diagram credit

**Element types within a swimlane:**

| Type         | Token                     | Visual                             | Use when                     |
|--------------|---------------------------|------------------------------------|------------------------------|
| `activity`   | timeline.activityFill     | skyBlue rounded rect, label inside | Work with a duration          |
| `deliverable`| timeline.deliverableFill  | blazeOrange rect + diamond mark   | Named output artifact         |

The visual distinction (blue vs orange) carries all the semantic load.
No additional status markers are needed.

**Scale modes — declare in config, ticks are auto-computed from date range:**

| Mode      | Tick unit | Major tick  | Good for              |
|-----------|-----------|-------------|-----------------------|
| `sprint`  | 1 week    | Odd weeks   | 4–16 week plans       |
| `quarter` | 1 month   | Q-start     | 3–9 month programs    |
| `roadmap` | 1 quarter | All         | 1–3 year roadmaps     |

**Cross-lane connectors:**
Cubic bezier paths, dashed (#B0ABA3), with arrowhead at destination.
Depart from the right edge of the source bar; arrive at the left edge of the destination.
Connector label (optional, ≤ 2 words, verb form) displayed at arc midpoint on a pill background.
Connectors may cross lanes and may travel left (backward in time) — this is valid and indicates
a parallel-track dependency rather than a sequential one.

**Phase bands:**
Named epochs rendered as very light tinted backgrounds behind all elements.
Phase boundary is marked with a dashed vertical line.
Phase label rendered in the axis header row. Maximum 5 phases per diagram.

**Today marker:**
Single dashed blazeOrange vertical rule spanning the full chart height.
"TODAY" pill label in axis row. Only one today marker per diagram.

**Layout constants (tokens.json: timeline.*):**
- `labelWidth: 152` — left sidebar for track labels
- `trackHeight: 80` — per-swimlane pixel height
- `trackBarH: 28` — activity / deliverable bar height
- Bar is vertically centered in lane. Labels inside bar if bar ≥ 88px wide; below bar if narrower.

**Rules:**
- Track label in sidebar: track name (bold, trackLabelColor) + optional sublabel (muted)
- Left-edge color indicator: 3px accent bar per track, rotating through trackAccentColors
- Alternating lane background: odd tracks get `surf` tint at 55% opacity
- `deliverable` items may not exceed 20% of total items per diagram (brand accent rule applies)
- Connector labels are verb form only, max 2 words: "Feeds", "Informs", "Validates", "Scopes"

### Config B — Two-Plane (Process Diagrams)
Use for: workflow maps, integration flows, data pipelines.

  PLANE 1 (Top)    — Trigger / Input layer
  PLANE 2 (Bottom) — Process / Output layer

### Config C — Single-Plane (Reference Diagrams)
Use for: component breakdowns, decision trees, taxonomy maps.

  PLANE 1 — Flat isometric surface, entities distributed spatially.

---

## 5. Entity Library

### 5A. Entity Classes

| Class           | Visual Treatment                            | When to Use                        |
|-----------------|---------------------------------------------|------------------------------------|
| System          | Isometric building/server block             | Platforms, applications, databases |
| Actor           | Isometric human figure or role icon         | People, teams, personas            |
| Process         | Pill-shaped label, accent on active         | Named actions, workflow steps      |
| DataObject      | Flat icon, grid-panel context               | Datasets, models, files            |
| IntegrationPoint| Icon + status badge                         | APIs, connectors, external systems |
| AssetCard       | Inset box, metadata rows, score badge       | Individual tracked entities        |

### 5B. Entity States

| State     | Treatment                                          |
|-----------|----------------------------------------------------|
| Default   | Sketch outline, sketchLine stroke                  |
| Active    | accentPrimary fill, slightly elevated              |
| At-Risk   | sketchDark stroke, heavier weight — no red         |
| Inactive  | 40% opacity, no label emphasis                     |

**Rule:** Never use red, amber, or traffic-light conventions. Status is
communicated through weight and accent presence, not color semantics.

---

## 6. Connector System

| Type         | Style                              | Usage                              |
|--------------|------------------------------------|------------------------------------|
| Cascade      | Curved dashed, fanning             | Cross-layer flow                   |
| Relationship | Straight dashed, labeled           | Entity-to-entity named relations   |
| ActiveFlow   | Accent color, dashed               | Highlighted path                   |
| Hierarchy    | Straight solid, thin               | Parent-child structural relations  |

Connector label rules:
- Verb form only: "Produces", "Transports" — not "Production"
- Max 2 words per label
- Label sits on a white pill background at midpoint

**Rule:** No arrowheads on cascade connectors. Arrowheads only on
relationship and flow connectors when direction is ambiguous.

---

## 7. Panel System (Flat Layers)
- Isometric rectangle, surfacePanel fill, sketchLine border
- Icon grid: 2–4 columns, consistent cell sizing
- Panel label: centered below, ALL CAPS
- Active icon: accentPrimary fill or outline
- Max 8 icons per panel

---

## 8. Asset Card Pattern
One per diagram maximum. Anchors to one entity via short connector.

  ┌─────────────────────┐
  │ ASSET #[ID]         │
  │─────────────────────│
  │ [Attribute]  [Value]│
  │ [Attribute]  [Value]│
  │ [Attribute]  [Value]│
  │─────────────────────│
  │ Score   [##]°       │
  └─────────────────────┘

Max 4 attribute rows. Score displayed as single prominent number.

---

## 9. Diagram Types

| Type                  | Config | Primary Audience    | Trigger Question                          |
|-----------------------|--------|---------------------|-------------------------------------------|
| Platform Architecture | A      | Executive, CTO      | How does the system fit together?         |
| Domain Ontology Map   | C      | Architect, Product  | What are the entities and relationships?  |
| Workflow Map          | B      | Ops, Implementation | How does work move through the system?    |
| Integration Diagram   | B or C | Engineering         | What connects to what?                    |
| Capability Overview   | A      | Executive, Sales    | What can the platform do?                 |
| Data Flow             | B      | Data, Engineering   | Where does data come from and go?         |

---

## 10. Production Checklist
- [ ] Layer config selected and consistent
- [ ] All colors from tokens.json only
- [ ] Accent on ≤20% of elements
- [ ] No traffic-light color conventions
- [ ] Connector labels: verb-form, ≤2 words
- [ ] Typography: ≤2 size levels per layer
- [ ] Entity class assigned to every element
- [ ] Panel icon counts ≤8
- [ ] Asset cards: 0 or 1
- [ ] Diagram type declared
- [ ] Companion JSON produced

---

## 11. Open Items (Next Build)
- Icon library: telco and financial services isometric icon set
- Animation / motion rules for interactive contexts
- Dark mode token mappings
- Figma component library build
- Client overlay specs (telco, finserv)
- Top-layer entities as isometric screens/monitors (see Section 12E)

---

## 12. Isometric Rendering Specifications
**Source:** Palantir Platform Architecture reference image (inputs/diagrams/palantir.png).
These specs define the precise 3D sketch aesthetic. All assemblers and renderers
must implement them.

### 12A. Platform Construction — One-Point Perspective Trapezoid

Platforms are NOT parallelograms. They are perspective-correct trapezoids using
one-point central perspective. The viewer looks head-on at the horizontal center.
All receding edges converge to a single vanishing point VP above the canvas.

**The mathematical model:**

```
  VP  =  (W/2,  VP_y)     Vanishing point, always at horizontal center.
                           VP_y = −H × 0.52  (above the canvas, negative y)

  For each platform, define:
    y_front  =  screen y of near/front edge  (larger y, closer to viewer)
    y_back   =  screen y of far/back edge    (smaller y, farther from viewer)
    hw       =  half-width of front edge     (centered at W/2)

  Perspective taper:
    t_back   =  (y_back − VP_y) / (y_front − VP_y)      0 < t_back < 1
    hw_back  =  hw × t_back                              back is narrower

  Trapezoid corners (always wider at bottom/front):
    TL  =  (W/2 − hw_back,  y_back)
    TR  =  (W/2 + hw_back,  y_back)
    BR  =  (W/2 + hw,       y_front)
    BL  =  (W/2 − hw,       y_front)
```

**Perspective-correct surface grid:**

```
  Radial lines (converge toward VP_x = W/2):
    For N evenly-spaced x_i across the front edge:
      x_front_i  =  (W/2 − hw) + i/N × 2×hw
      x_back_i   =  W/2 + (x_front_i − W/2) × t_back
      Line:  (x_front_i, y_front) → (x_back_i, y_back)

  Horizontal lines (perspective-spaced, closer together at back):
    For M intermediate lines:
      t_j   =  t_back + (j/M) × (1 − t_back)      j = 1 … M−1
      y_j   =  VP_y + (y_front − VP_y) × t_j
      hw_j  =  hw × t_j
      Line:  (W/2 − hw_j, y_j) → (W/2 + hw_j, y_j)
```

**Key rule:** VP_x is ALWAYS W/2. All platforms in a diagram share one VP.
Never use a parallelogram (equal-width top and bottom edges) for a platform.

**Platform edge strip:** A thin filled rect at y_front communicates platform
thickness. Height = 12–14px, same x extents as front edge, fill = surfaceAlt.

### 12B. Entity Ground Rings

Every entity on an isometric surface must have a ground ring:

```
  Shape:    Ellipse, centered at (cx, cy + nodeRadius + 2)
  rx:       nodeRadius + 10  (tokens.isometric.groundRingRx)
  ry:       rx × 0.28        (tokens.isometric.groundRingRyRatio)
  Fill:     none
  Stroke:   sketchLine, 0.75px
  Opacity:  0.45             (tokens.isometric.groundRingOpacity)
```

Ground rings anchor the entity to the platform surface and establish the
isometric plane. Never omit them on isometric layers.

### 12C. Cascade Connector Fan

Cascade connectors use a fan pattern, not parallel lines:

```
  Count:   9 lines (tokens.isometric.cascadeLines)
  Source:  Clustered at center of source plane bottom edge.
           Spread: ±60px around center (tokens.isometric.cascadeSourceSpread / 2)
  Target:  Spread across 82% of destination plane width
           (tokens.isometric.cascadeTargetSpread)
  Curve:   Quadratic bezier, control point at midpoint + 26px downward
  Style:   connectorDefault, 1px, stroke-dasharray 4,3
  Active:  connectorActive stroke for highlighted flow paths
  Labels:  Pill labels on prominent cascades (accentPrimary fill, white text)
```

Fan lines must not cross each other. Order source and target points consistently
left-to-right.

### 12D. Relationship Pill Labels

All relationship labels in the isometric layer use filled pills:

```
  Fill:        relPillFill (= accentPrimary, #7EC8A4)
  Text color:  relPillText (#FFFFFF)
  Active:      Same fill, add drop shadow: 0 2px 4px sketchDark at 20% opacity
  Font:        relLabel role — 7.5pt, weight 400
  Padding:     8px horizontal, label width = max(38px, charCount × 5.5px)
  Radius:      8px pill
```

This is the defining characteristic of the Palantir-derived style.
Never use outline-only pills for mid-layer relationship labels.

### 12E. Top Layer Treatment (Aspirational — v0.2 target)

In the Palantir reference, top-layer entities are rendered as isometric
screens/monitors (a tilted screen rectangle on a small desk base), not flat
boxes. This is the ideal treatment for Config A Layer 1.

Current implementation uses flat panels (acceptable for v0.1). Upgrade path:
- Each entity box becomes an isometric monitor object
- Screen face shows icon array (as currently)
- Base is a small isometric block beneath
- Active monitor gets accentPrimary element on screen

---

- Icon library: telco and financial services isometric icon set
- Animation / motion rules for interactive contexts
- Dark mode token mappings
- Figma component library build
- Client overlay specs (telco, finserv)

---

## 13. Config D Components — Service Band Stack
**Source:** ModernArchitecture.png — Modern Application Architecture diagram.
These primitives extend the system for flat, tier-based platform diagrams.
They do NOT replace the isometric engine — use Config A for 3D depth diagrams,
Config D when horizontal tier separation is the primary structure.

### 13A. Service Band

A flat, non-isometric horizontal tier for thin service/API layers.

```
  Fill:     serviceBand.fill    (brand.deepTeal, #1E4A57)
  Text:     serviceBand.text    (brand.offWhite, #F1F3F1)
  Height:   serviceBand.height  (86px)
  Chips:    serviceBand.chipFill (brand.skyBlue, #6BA4C8)
            serviceBand.chipText (#FFFFFF)
  Radius:   0 — flat corners signal infrastructure, not isometric platform
  Title:    11pt, weight 700, letter-spacing 0.5, centered at top of band
  Chips:    32px tall, 5px radius, evenly distributed with 22px gaps
```

**Rule:** Never use a serviceBand fill for isometric platforms.
Sharp corners are intentional — they separate service bands visually
from the rounded/faceted isometric platform vocabulary.

### 13B. Zone

A labeled sub-region within a flat platform container (e.g., Data Mesh).

```
  Fill:       zone.fill       (#FFFFFF) — or zone.altFill (#EFF3F5) for tinted zones
  Border:     zone.border     (#C8C4BC), 0.75px
  Title:      zone.titleText  (brand.deepTeal, #1E4A57), 8pt, weight 700
              Left-aligned, 10px from left edge, 15px from top edge
  Radius:     zone.radius     (4px)
  Padding:    10px from zone edge to nearest chip
```

Multiple zones tile within the platform container. Common layouts:
- Full-width zone (e.g., Data Products) — spans container width
- Left/right column split (e.g., KG + Lakehouse vs Analytics)
- A 12–14px gap separates adjacent zones

### 13C. Data Chip

A compact named item within a zone or service band.

```
  Fill:     dataChip.fill     (brand.skyBlue, #6BA4C8) — standard
            dataChip.accentFill (brand.blazeOrange, #E84E1B) — hero/accent (≤10%)
            dataChip.specialFill (brand.mistBlue, #9EB3C4) — knowledge/graph entities
  Text:     dataChip.text     (#FFFFFF), 7.5pt, weight 600
  Sublabel: optional 2nd line, 6.5pt, weight 400 (e.g., tier "(Gold)")
  Radius:   dataChip.radius   (5px)
  Height:   32px (band chips) — 42px (zone single-row) — 50px (zone stacked)
```

**Accent rule:** Only one chip per zone should use accentFill.
accentFill is brand expression — not a status indicator.

### 13D. Side Label

Vertical rotated annotation on the left margin identifying logical groupings
that span one or more bands/containers.

```
  Position: x = 30 (center of rotation), rotated −90°
  Bracket:  Thin vertical line at x = 52, with 4px tick marks at span endpoints
  Font:     7.5pt, weight 500, letter-spacing 1.5, labelMuted fill
  Case:     ALL CAPS
  Span:     y1 = top of first included layer, y2 = bottom of last included layer
```

Side labels appear for every logical grouping in Config D diagrams.
Never omit side labels — they are how non-technical readers orient themselves.
