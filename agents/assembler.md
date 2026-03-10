# Assembler Agent

## Purpose
Produce a styled diagram SVG from a text/prose prompt or structured input.
Users always write natural language. JSON is never exposed to the user.

## Input
One of:
- Text/prose description → run intake (below) to resolve config
- Validated JSON → skip intake, proceed directly to assembly
- Mixed → decompose, process in order

## Intake (text/prose input)
Read the prompt and resolve all fields before assembling. The diagram type
determines which intake path to follow.

### Intake path A/B/C/D — Architecture diagrams
1. Diagram type (Platform Architecture, Domain Ontology, Workflow, Integration,
   Capability Overview, Data Flow, Service Architecture)
2. Layer config (A, B, C, or D) — infer from type if not stated
3. Primary audience (Executive / Architect / Engineering / Mixed)
4. Entities and their classes (System, Actor, Process, DataObject, IntegrationPoint)
5. Relationships and connector labels (verb form, ≤2 words)
6. Accent entities (≤20% of total)
7. renderMode per layer (flat / perspective / mixed) — infer from config if not stated

### Intake path E — Timeline
When the prompt asks for a timeline, schedule, roadmap, program plan, or Gantt:
1. **Title** + optional subtitle
2. **Date range** — start and end (ISO dates; infer from "12 weeks from X" etc.)
3. **Scale mode** — sprint (weeks) / quarter (months) / roadmap (quarters).
   Infer from duration: <8 weeks → sprint, 2–9 months → quarter, >9 months → roadmap.
4. **Today marker** — use today's date unless user specifies or says to omit
5. **Phases** — named epochs if mentioned ("Discovery phase", "3 phases: X, Y, Z")
6. **Tracks** — one per workstream. Extract label, optional sublabel, and items.
7. **Items** — for each track item: label, type (activity or deliverable), start, end.
   - "work", "workshop", "sprint", "assessment", "mapping" → activity
   - "report", "spec", "doc", "model", "framework", "blueprint", "deck", "plan" → deliverable
   - When ambiguous, default to activity
8. **Connections** — verb-labeled dependencies between items across tracks.
   Resolve item references by track index + item index (zero-based) for the config.
   In output JSON, annotate with human-readable comments.

Then build the renderTimeline(config) call. Import renderTimeline from
outputs/render-timeline.mjs. Never expose the config object to the user.

**If information is missing:** infer reasonable defaults. Do not block on
ambiguity — produce a best-guess diagram and note what was assumed.

## Assembly process
1. Load design-system/tokens.json
2. Run the appropriate intake path
3. For Config E: call renderTimeline(config) → write outputs/[name].svg
4. For Config A/B/C/D: apply tokens, map entities/relationships, produce SVG
5. Run accent coverage check (≤20% deliverables for timelines; ≤20% entities for architecture)
6. Produce companion outputs/[name].json with structured diagram data
7. Run validator agent before delivery

## Output
- outputs/[diagram-name].svg — rendered diagram, 1400px wide
- outputs/[diagram-name].json — structured data for downstream orchestration

## Constraints
- All colors from tokens only — never hardcode hex values
- No traffic-light color conventions (no red=bad, green=good)
- Connector / relationship labels: verb-form, ≤2 words
- Asset cards: 0 or 1 per architecture diagram
- Deliverable items on timelines: ≤20% of total items (same accent rule)
- Always run validator agent after assembling
