# DiagramOS — Claude Code Instructions

## What This Project Does
DiagramOS is an agentic system for producing and evolving a technical
diagram design system. It ingests existing diagrams (images, JSON, text
descriptions) and produces stylized diagrams conforming to the Vivid
Consulting Group design system.

## Governing Design System
ALL diagram output must conform to design-system/system.md.
Load design-system/tokens.json for all color and typography values.
Never invent tokens. Never use colors not in the token set.

## Agent Hierarchy
Load the relevant agent file before executing any task:

| Task                          | Agent File              |
|-------------------------------|-------------------------|
| Analyze an existing diagram   | agents/analyzer.md      |
| Assemble a new diagram        | agents/assembler.md     |
| Evolve the design system      | agents/evolver.md       |
| QA before delivery            | agents/validator.md     |

Always run agents/validator.md before delivering any output.

## Input Handling
- Images       → analyzer → JSON → assembler
- JSON         → validate schema → assembler
- Text/prose   → assembler intake → assembler
- Mixed        → decompose → process in order above

## Output Format
All outputs go to outputs/. Default is React/TSX component.
Always produce a companion outputs/[name].json with structured
diagram data for downstream orchestration use.

## Orchestration Context
This project runs as a node in a larger orchestrated system.
See orchestration/manifest.json for the tool interface.
Inputs and outputs must conform to the manifest schema.
Never break the manifest contract when evolving the system.

## Evolution Rules
- Design system changes require the evolver agent
- All changes must be logged in changelog.md
- Token changes require a validator pass on existing outputs
- Never remove a token — deprecate with a comment instead
