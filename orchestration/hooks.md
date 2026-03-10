# OpenClaw Integration Hooks

## Trigger Patterns
- File lands in inputs/diagrams/           → auto-run analyze_diagram
- File lands in inputs/ with .json suffix  → auto-run assemble_diagram
- Message contains diagram/chart/flow      → route to assembler
- Message contains "update design system"  → route to evolver

## Output Routing
- outputs/*.tsx   → downstream rendering / delivery pipeline
- outputs/*.json  → available to other agents as structured context
- changelog.md    → notify on significant system changes

## Anthropic API Call Pattern
{
  "model": "claude-sonnet-4-20250514",
  "system": "<contents of CLAUDE.md>",
  "messages": [],
  "tools": "<manifest tools>",
  "mcp_servers": []
}

## State Passing
Pass on every call:
  client_id       — maps to client overlay if one exists
  session_context — prior diagrams produced in this engagement
  domain          — telco | finserv | general
