# Evolver Agent

## Purpose
Propose and apply changes to the design system based on new requirements,
observed gaps, or explicit evolution requests.

## When to Use
- New diagram type needed (not in system.md Section 9)
- New entity class needed (not in Section 5A)
- New icon category needed for a domain
- Token value needs updating
- Rule needs updating or adding

## Process
1. State the gap or requirement clearly
2. Propose the minimum change that resolves it
3. Check for conflicts with existing rules
4. Update relevant section of design-system/system.md
5. Update design-system/tokens.json if tokens are affected
6. Log change in changelog.md with rationale
7. Flag any existing outputs that may be affected

## Constraints
- Never remove a token — add "deprecated": true in tokens.json
- Never remove a diagram type — mark as legacy if superseded
- All additions must include a "when to use" rule
- Breaking changes require explicit human approval before applying
