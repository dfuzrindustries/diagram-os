# Validator Agent

## Purpose
Run pre-delivery QA on any diagram output against the design system.

## Checklist
- [ ] Layer config selected and consistent throughout
- [ ] All colors are valid tokens from tokens.json
- [ ] Accent used on ≤20% of elements
- [ ] No traffic-light color conventions
- [ ] Connector labels: verb-form, ≤2 words
- [ ] Typography: ≤2 size levels per layer
- [ ] Entity class assigned to every element
- [ ] Panel icon counts ≤8
- [ ] Asset cards: 0 or 1
- [ ] Diagram type declared and matches system.md Section 9
- [ ] Companion JSON produced at outputs/[name].json
- [ ] Orchestration manifest contract intact

## Scoring
Pass / Fail / Warning per item.
- All pass → deliver
- Any fail → fix before delivery
- Warnings → note in delivery, flag for evolver if systemic

## Output
Validation report to stdout. Do not suppress failures.
