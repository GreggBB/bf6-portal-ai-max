# Battlefield 6 Portal SDK - AI Agent Instructions

> **SDK Version**: 1.1.3.0 | **Pattern Library**: v1.3 (Full SDK Coverage)

---

## Critical Constraints

### BF2042 vs BF6 Isolation
Battlefield 2042 was internally "Battlefield 6" - mixing code causes errors.
**Rule**: ALL code must source from local SDK only. Never use web-sourced BF2042 examples.

### GetObjId Rule
SDK objects (teams, players, vehicles) cannot use `===` for comparison.
```typescript
// WRONG
if (team1 === team2) { }

// RIGHT
if (mod.GetObjId(team1) === mod.GetObjId(team2)) { }
```

### Never Invent Functions
Every `mod.*` call must exist in SDK. AI agents tend to invent plausible-sounding functions.
**Always validate** against SDK types before delivery.

### Context Budget
Stay under 40% context. Use patterns instead of loading large files directly.

---

## Process Routing

| User Says | Action |
|-----------|--------|
| "Build me a mod" | Follow discovery → planning → building flow |
| "Check this code" | Validate against SDK types |
| "Can Portal do X?" | Check patterns library |
| "It's not working" | Follow troubleshooting process |
| "I need [undocumented feature]" | Check experimental folder |

---

## Key Resources

### Pattern Library (`patterns/`)
- `patterns/_index.md` - Master catalog of 35+ patterns
- **Core**: Event hooks, state management, object equality
- **Player**: Spawning, equipment, input control, camera
- **Gameplay**: Economy, vehicles, capture points, sectors, rounds
- **UI**: Widgets, notifications
- **Audio**: Music, SFX, voice-over
- **Spatial**: Area triggers, world icons, objects, VFX
- **AI**: 18 AI behavior functions

### Utility Library (`bf6-portal-utils-master/`)
11 community modules: Events, Timers, Logger, SolidUI, Raycast, etc.

### Sub-Projects
- `spatial-generator/` - Programmatic spatial JSON generation
- `experimental/` - Sandbox for undocumented features
- `agents/` - Agent architecture reference

---

## SDK Structure

```
bf6-portal-AI-max/
├── AGENTS.md              # This file - AI agent instructions
├── CLAUDE.md              # Claude-specific instructions
├── GEMINI.md              # Gemini-specific instructions
├── processes/             # Workflow documents
├── patterns/              # Verified code patterns (v1.3)
├── agents/                # Agent definitions + skills
├── experimental/          # Undocumented feature sandbox
├── spatial-generator/     # Spatial JSON tools
├── bf6-portal-utils-master/ # Community utilities
├── dev/                   # Reference material
│   ├── old-claude.md      # Original detailed CLAUDE.md
│   └── sdk-reference.md   # Deep dive content
└── templates/             # Per-mod templates
```

---

## Context Rules

### What to Load
- This file (`AGENTS.md`) or platform-specific variant
- `patterns/_index.md` - Pattern catalog
- Specific pattern files as needed

### What NOT to Load
- All patterns at once - Load only what's needed
- Full example files - Use patterns instead

### Budget Targets
| Phase | Target | Max |
|-------|--------|-----|
| Session start | 5% | 10% |
| After research | 15% | 20% |
| After build | 25% | 30% |
| After validation | 30% | 40% |

---

## Quick Validation Checklist

Before delivering code:
- [ ] Every `mod.*` call exists in SDK
- [ ] Event hook signatures exact (parameter names matter)
- [ ] Object comparisons use `mod.GetObjId()`
- [ ] Player validity checked before operations
- [ ] `.strings.json` keys documented
- [ ] Godot requirements noted

---

## Debugging

Portal logs: `C:\Users\{username}\AppData\Local\Temp\Battlefield 6\PortalLog.txt`

Use `console.log()` in mod code to write there.

---

## Process Documents

| Document | When to Use |
|----------|-------------|
| `processes/discovery.md` | Gathering mod requirements |
| `processes/planning.md` | Complex mod planning |
| `processes/building.md` | Code generation |
| `processes/validation.md` | Fixing validation errors |
| `processes/experimental.md` | Undocumented features |
| `processes/context-management.md` | Session handoffs |
| `processes/troubleshooting.md` | Runtime issues |

---

## Session Start Checklist

1. Read this file (`AGENTS.md`)
2. Read `patterns/_index.md` to know what patterns exist
3. Identify user intent → route to appropriate process
4. Use patterns to stay context-efficient
