# DiagramOS User Guide
**Vivid Consulting Group — Technical Diagram System**
*v0.6 · March 2026*

---

## What DiagramOS Does

DiagramOS takes a description of a system — in plain language, an image, or structured JSON — and produces a styled technical diagram that conforms to the Vivid Consulting Group design system. Every output is an SVG file plus a companion JSON schema, ready for presentation or downstream orchestration.

The system has one job: make your architecture legible to three audiences at once — the executive who needs orientation, the architect who needs structure, and the engineer who needs detail.

---

## Quick Start: The Minimum Viable Prompt

If you're in a hurry, four things get you a good diagram:

1. **What kind of system** — platform, workflow, data architecture, integration map
2. **The layers** — what sits on top, middle, and bottom
3. **Key entities** — the 5–12 named things in the middle
4. **Who it's for** — executive, architect, or engineering audience

**Example:**
> "Create a platform architecture diagram for our customer data platform.
> Top layer: Salesforce, Tableau, and our mobile app.
> Middle: the core ontology with entities Customer, Account, Product, Order, and Campaign.
> Bottom: Snowflake, S3, and Kafka.
> Audience: CTO and VP of Engineering."

That's enough. The system will select Config A (three-plane), one-point perspective for the middle, flat panels for top and bottom.

---

## Anatomy of a Complete Prompt

For complex diagrams, structure your prompt around these fields:

```
DIAGRAM TYPE:   [Platform Architecture | Domain Ontology | Workflow | Integration | Data Flow]
AUDIENCE:       [Executive | Architect | Engineering | Mixed]
CONFIG:         [A: three-plane | B: two-plane | C: single-plane | D: four-tier service stack]
RENDER MODE:    [perspective | flat | mixed] — optional, system will infer from config

LAYERS:
  TOP:    [names of top-layer systems/apps]
  MIDDLE: [primary entities and relationships]
  BOTTOM: [infrastructure/data stores]

ENTITIES:
  - [Name] ([Class])  ← Classes: System, Actor, Process, DataObject, IntegrationPoint
  - [Name] is highlighted  ← marks this entity as accent (blaze orange, ≤20% of entities)

RELATIONSHIPS:
  - [Entity A] → [Verb] → [Entity B]  ← verbs only, max 2 words
  - [Entity A] → [Verb] → [Entity B]  [active]  ← draws in accent color

TITLE: [diagram title]
NOTES: [anything unusual — e.g., "Data Mesh has 4 internal zones: X, Y, Z, W"]
```

You don't need every field. The more you provide, the more faithful the output.

---

## Diagram Types

Choose the type that matches your audience's primary question:

| Type | Config | Audience | Trigger Question |
|---|---|---|---|
| **Platform Architecture** | A or D | Executive, CTO | How does the system fit together? |
| **Domain Ontology Map** | C | Architect, Product | What are the entities and relationships? |
| **Workflow Map** | B | Ops, Implementation | How does work move through the system? |
| **Integration Diagram** | B or C | Engineering | What connects to what? |
| **Capability Overview** | A | Executive, Sales | What can the platform do? |
| **Data Flow** | B | Data, Engineering | Where does data come from and go? |
| **Service Architecture** | D | Engineering, CTO | What service tiers exist and how do they compose? |
| **Timeline** | E | Delivery Leads, Program Mgmt | When does work happen and what are the outputs? |

---

## Render Mode

Every layer in a diagram declares a render mode. You don't need to specify this unless you want to override the default.

| Mode | What it looks like | When to use |
|---|---|---|
| **flat** | Rectangular bands, zone containers, data chips | Thin service tiers, API layers, systems of record — anything where categorical separation matters more than spatial depth |
| **perspective** | One-point perspective trapezoid, depth grid, isometric entities | Hero platforms — when you want the viewer to feel the *weight* of a layer |
| **mixed** | Flat bands above and below, perspective middle | When the core platform needs prominence and the service tiers are thin |

**Examples:**
- `"Use mixed mode: flat top and bottom bands, perspective for the Data Mesh layer"`
- `"Keep everything flat — this is an engineering handoff, not an executive presentation"`
- `"Middle layer should be perspective, the rest flat"`

If you don't specify, the system uses:
- Config A → perspective middle, flat top/bottom (default mixed)
- Config D → all flat
- Config B/C → flat

---

## Entity Classes

Use these class names in your prompt. The renderer will pick the right icon automatically.

| Class | Icon | Use for |
|---|---|---|
| `System` | Building / server block | Platforms, databases, applications |
| `Actor` | Person / role figure | Teams, users, personas |
| `Process` | Labeled pill | Named actions, workflow steps |
| `DataObject` | Document / stack | Datasets, models, files |
| `IntegrationPoint` | Icon + badge | APIs, connectors, external systems |
| `AssetCard` | Inset metadata card | Individual tracked entities (max 1 per diagram) |

**Example:** `"Customer 360 (DataObject), Knowledge Graph (System), AI Models (System, highlighted)"`

---

## Relationship Labels

Rules for connector labels:
- Verb form only: "Produces", "Informs", "Feeds" — never "Production" or "Information"
- Maximum 2 words
- Mark a relationship as `[active]` to draw it in accent color with an arrowhead

**Good:** `Customer → Owns → Account`, `Lakehouse → Feeds → Data Products [active]`
**Bad:** `Customer has ownership of Account`, `Processing pipeline for raw data`

---

## Color and Accent

You do not choose colors directly — the design system handles all color. But you can request:

- **Highlight an entity:** "highlight [Name]" or "[Name] is active" → blaze orange accent
- **Active flow:** mark a relationship `[active]` → accent color stroke
- **IA Brand:** "use IA brand palette" → applies the Intelligent Agency brand colors (already default)

**Rule the system enforces:** Accent elements cannot exceed 20% of total elements. If you mark too many things, the system will ask you to reduce.

---

## Special Cases

### Four-layer service stack (Config D)
When your architecture has thin horizontal service tiers (engagement → API → data platform → records), specify this explicitly:

> "This is a four-tier service architecture. Top: [apps]. API layer: [services].
> Core platform: [main system with zones X, Y, Z]. Bottom: [systems of record]."

The system will use Config D with flat service bands and an optional mixed-mode perspective core.

### Internal zones within a platform
When a platform has distinct internal sections:

> "The Data Mesh has four internal zones: Data Products, Knowledge Graph, Data Lakehouse, Analytics/AI Models."

Name the zones explicitly. The system will lay them out as labeled sub-regions.

### Side labels
When logical groupings span multiple layers (e.g., "Systems of Engagement" labels both the app and API tiers), say:

> "Label the top two tiers together as 'Systems of Engagement' on the left margin."

---

## Timeline Diagrams (Config E)

Timelines show **when** work happens and **what gets produced**. They work at any scale — a 4-week sprint, a 6-month program, or a 3-year roadmap — using the same visual grammar.

### The minimum viable timeline prompt

Four things get you a clean timeline:

1. **Date range** — start and end dates
2. **Scale** — sprint (weeks), quarter (months), or roadmap (quarters)
3. **Workstreams** — 1–5 named tracks running in parallel
4. **What's in each track** — activities (work with duration) and deliverables (named outputs)

**Example:**
> "Create a 12-week program timeline from March 2 to May 31.
> Scale: quarter (monthly ticks).
> Three tracks: Strategy, Operations, Platform.
> Strategy: Stakeholder Interviews (activity, wk 1–2), Strategic Narrative (deliverable, wk 3–4).
> Operations: Current State Assessment (activity, wk 1–3), Current State Report (deliverable, wk 4–5).
> Platform: Platform Discovery (activity, wk 3–6), Agent Design Specs (deliverable, wk 7–9).
> Today marker at March 10."

---

### Scale modes

| Mode | Tick unit | Major tick label | Best for |
|---|---|---|---|
| `sprint` | 1 week | Every other week | 4–16 week execution plans |
| `quarter` | 1 month | Quarter start (Q1, Q2…) | 3–9 month programs |
| `roadmap` | 1 quarter | Every quarter | 1–3 year roadmaps |

You don't need to count ticks — the renderer computes all positions from your date range.

---

### Activities vs Deliverables

Every item in a track is one of two types:

| Type | Color | Meaning |
|---|---|---|
| **Activity** | Blue | Work with a duration — a workshop, a sprint, an assessment |
| **Deliverable** | Orange | A named output artifact — a report, a spec, a model |

The color carries all the meaning. You don't need extra labels or markers.

**Example items:**
- `"Stakeholder Interviews (activity, Mar 2–15)"` → blue bar
- `"Strategic Narrative (deliverable, Mar 23–Apr 5)"` → orange bar with diamond marker

---

### Phases

Named epochs that provide temporal context across all tracks. Phases appear as very light column backgrounds behind the swimlanes.

> "Three phases: Discover (Mar 2–22), Design (Mar 23–Apr 26), Build & Test (Apr 27–May 31)."

Maximum 5 phases per diagram.

---

### Cross-lane connections

When a deliverable in one track influences work in another track, use a connection:

> "Connect: Strategic Narrative → Platform Discovery, labeled 'Scopes'"
> "Connect: Current State Report → Data Architecture Doc, labeled 'Informs'"

**Connection label rules** — same as relationship labels:
- Verb form only: "Feeds", "Informs", "Validates", "Scopes", "Unblocks"
- Maximum 2 words
- Connections can travel backward in time — a parallel dependency doesn't have to be sequential

---

### Today marker

> "Mark today at March 10." or just `today: 2026-03-10`

A dashed orange vertical line spans the full chart height. Shows where you are in the plan at a glance.

---

### Full timeline prompt structure

```
TIMELINE:
  TITLE:     [diagram title]
  RANGE:     [start date] to [end date]
  SCALE:     [sprint | quarter | roadmap]
  TODAY:     [date] — optional

PHASES:      — optional
  - [Phase name]: [start] to [end]

TRACKS:
  - [Track name] ([audience or workstream]):
      [Item label] ([activity | deliverable], [start] to [end])
      [Item label] ([activity | deliverable], [start] to [end])

CONNECTIONS: — optional
  - [Source item] → [Verb] → [Destination item]
```

---

### Iteration prompts

| Goal | Prompt |
|---|---|
| Add a track | "Add a '[Name]' track with: [items]" |
| Add an item | "Add '[Name]' (activity/deliverable, [start]–[end]) to the [track] track" |
| Add a connection | "Connect [item A] → [Verb] → [item B]" |
| Add a phase | "Add a '[Phase name]' phase from [start] to [end]" |
| Change scale | "Switch to roadmap scale" |
| Extend the range | "Extend the timeline to [new end date]" |
| Move today marker | "Move today to [new date]" |

---

### Common mistakes

**Mixing up types:**
> "Add a 'Weekly Standup' deliverable"

Standups are recurring activities, not deliverables. Use `activity` for work; `deliverable` for named output artifacts.

**Too many deliverables:**
> "Mark every item as a deliverable"

Deliverable = orange = accent. The accent rule applies: keep deliverables to ≤20% of total items so they read as outputs, not background noise.

**Vague date ranges:**
> "A few weeks in Q2"

Give precise ISO dates or week numbers. The renderer needs exact positions to compute ticks and bar widths correctly.

---

## Requesting Design System Changes

DiagramOS can evolve its own design system. Route evolution requests through the **evolver agent** by saying:

> "Evolve the design system to support [new concept]."

Examples:
- "Evolve the design system to add a `timeline` component for process diagrams"
- "Add a `status badge` token for entity health states (using weight/accent, not color)"
- "We need a Config E for single-zone full-bleed data flow diagrams"

**Rules for evolution:**
- All changes are logged in `changelog.md`
- No token is ever deleted — only deprecated with a comment
- Changes must pass a validator pass on existing outputs before shipping
- Brand accent rule always applies: blazeOrange and volt are never status indicators

---

## What You'll Get Back

Every diagram produces:

| File | Contents |
|---|---|
| `outputs/[name].svg` | The rendered diagram, 1400px wide |
| `outputs/[name].json` | Structured diagram data (entities, relationships, layer config) |

The JSON is machine-readable and can be fed back into DiagramOS to evolve the diagram, or passed to downstream orchestration.

---

## Iteration Prompts

Once you have a first draft, refine with:

| Goal | Prompt |
|---|---|
| Add an entity | "Add `[Name]` ([Class]) to the [layer] layer" |
| Change a relationship | "Change the [A]→[B] relationship label to '[Verb]'" |
| Highlight something | "Highlight [Name] as the active element" |
| Add a layer | "Add a [description] layer above/below [existing layer]" |
| Change render mode | "Switch the [layer] to perspective / flat" |
| Evolve the design system | "Evolve the design system to support [concept]" |
| Re-run with a source image | "Apply our styles to [filename.png]" |

---

## Common Mistakes

**Too vague:**
> "Make a diagram of our system."

Add: what type, what layers, what entities, who it's for.

**Too many accents:**
> "Highlight Customer, Account, Product, Order, Campaign, and AI Models."

Accent is for ≤20% of elements. Pick the 1–3 things that are truly the hero of this diagram.

**Color requests:**
> "Make the data layer blue and the API layer green."

Don't specify colors — use the design system vocabulary instead ("highlight", "active", "accent"). Colors are governed by tokens.

**Relationship nouns instead of verbs:**
> "Customer → Account Ownership → Account"

Use verbs: "Customer → Owns → Account"

**Forcing the wrong config:**
> "Use Config A for our simple two-step workflow."

Config B (two-plane) is right for workflows. Config A is for multi-platform ecosystem diagrams.

---

## Vocabulary Reference

These words trigger specific behaviors:

| Word | Behavior |
|---|---|
| `highlight`, `active`, `hero` | Accent color on entity or relationship |
| `perspective`, `isometric` | One-point perspective render mode for that layer |
| `flat`, `band`, `tier` | Flat service band render mode |
| `zone`, `section`, `internal region` | Creates a labeled sub-region within a platform |
| `side label`, `left margin label` | Vertical bracket annotation on the left margin |
| `evolve` | Triggers the evolver agent for design system changes |
| `validate` | Triggers the validator agent before delivery |
| `Config A/B/C/D` | Selects the layer configuration directly |
| `mixed mode` | Per-layer renderMode override |

---

*DiagramOS · Vivid Consulting Group · system.md v0.3 · tokens.json v0.3.0*
