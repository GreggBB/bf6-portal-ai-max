# Battlefield 6 Portal SDK - Gemini Instructions

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
Every `mod.*` call must exist in SDK. AI models tend to invent plausible-sounding functions.
**Always validate** against the pattern library before delivery.

### Context Efficiency
Gemini has a large context window, but stay efficient. Use patterns instead of loading entire files.

---

## Process Routing

| User Says | Action |
|-----------|--------|
| "Build me a mod" | Follow discovery → planning → building flow |
| "Check this code" | Validate against pattern library |
| "Can Portal do X?" | Search patterns/_index.md |
| "It's not working" | Follow troubleshooting process |
| "I need [undocumented feature]" | Check experimental folder |

---

## Key Resources

### Pattern Library (`patterns/`)
Start with `patterns/_index.md` - the master catalog of 35+ verified patterns:
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
├── GEMINI.md              # This file - Gemini instructions
├── CLAUDE.md              # Claude-specific instructions
├── AGENTS.md              # Generic AI agent instructions
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

## Workflow for Building Mods

### 1. Discovery Phase
- Understand what the user wants to build
- Check `patterns/_index.md` for relevant patterns
- Identify which SDK features are needed

### 2. Planning Phase
- Break down the mod into components
- Map features to specific patterns
- Note any experimental/undocumented needs

### 3. Building Phase
- Generate code using verified patterns
- Include `.strings.json` for any UI text
- Document Godot spatial requirements

### 4. Validation Phase
- Verify all `mod.*` calls exist in patterns
- Check event hook signatures
- Ensure object comparisons use `mod.GetObjId()`

---

## Quick Validation Checklist

Before delivering code:
- [ ] Every `mod.*` call exists in SDK (check patterns)
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

1. Read this file (`GEMINI.md`)
2. Read `patterns/_index.md` to know what patterns exist
3. Identify user intent → route to appropriate process
4. Use patterns library for all code generation
