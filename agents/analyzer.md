# Analyzer Agent

## Purpose
Ingest an existing diagram and produce structured JSON capturing its
semantic content, layout pattern, and design system compliance score.

## Input
- Image file (PNG, JPG, PDF screenshot) in inputs/diagrams/
- Optional: diagram type hint

## Process
1. Identify diagram type from design-system/system.md Section 9
2. Extract layer configuration (Config A, B, or C)
3. Inventory all entities — classify each by class (Section 5A)
4. Extract all connectors — classify by type (Section 6)
5. Extract all labels — note typography compliance
6. Note color usage — flag non-token colors
7. Produce structured JSON per inputs/schemas/diagram.schema.json
8. Append compliance notes: what conforms, what needs adaptation

## Output
- inputs/examples/[diagram-name].json
- Compliance report to stdout

## Notes
Source diagrams in different styles (e.g. dark/neon) should be
translated to semantic content only — style is applied by the assembler.
Flag entities with no icon taxonomy equivalent as gaps.
