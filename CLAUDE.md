# Battlefield 6 Portal SDK

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
Every `mod.*` call must exist in SDK. Claude tends to invent plausible-sounding functions.
**Always validate** with `/portal:validate` before delivery.

### Context Budget
Stay under 40% context. Use skills instead of loading large files directly.

---

## Process Routing

| User Says | Process |
|-----------|---------|
| "Build me a mod" | `processes/discovery.md` → `planning.md` → `building.md` |
| "Check this code" | `/portal:validate` → `processes/validation.md` if errors |
| "Can Portal do X?" | `/portal:research` or `processes/experimental.md` |
| "It's not working" | `processes/troubleshooting.md` |
| "I need [undocumented feature]" | `processes/experimental.md` |
| Context getting full | `processes/context-management.md` |

---

## Skills Reference

| Skill | Purpose | Returns |
|-------|---------|---------|
| `/portal:research` | Find patterns for a concept | Pattern summary + snippets |
| `/portal:build` | Generate complete mod code | `.ts` + `.strings.json` + Godot requirements |
| `/portal:validate` | Check code against SDK | Error list or PASSED |

### Typical Flow
```
1. /portal:research  → Understand what patterns apply
2. Discuss with user → Clarify requirements
3. /portal:build     → Generate code from patterns
4. /portal:validate  → Verify all mod.* calls
5. Deliver           → Code + strings + setup instructions
```

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

### Example Mods (`mods/`)
9 working mods (~100K lines total). Don't read directly - use patterns.

### SDK Types
- `code/mod/index.d.ts` - 24,540 lines. Let validator search it.
- `bf6-portal-mod-types` - npm package with JSDoc

### Utility Library (`bf6-portal-utils-master/`)
11 community modules: Events, Timers, Logger, SolidUI, Raycast, etc.

### Sub-Projects
- `spatial-generator/` - Programmatic spatial JSON generation
- `experimental/` - Sandbox for undocumented features
- `agents/` - Agent architecture for context-efficient workflows

---

## SDK Structure

```
Battlefield Portal SDK/
├── CLAUDE.md              # This file - lean orchestrator
├── processes/             # Workflow documents
├── patterns/              # Verified code patterns (v1.3)
├── mods/                  # 9 example mods
├── code/mod/              # SDK types (24K lines)
├── agents/                # Agent definitions + skills
├── experimental/          # Undocumented feature sandbox
├── spatial-generator/     # Spatial JSON tools
├── bf6-portal-utils-master/ # Community utilities
├── dev/                   # Reference material
│   ├── old-claude.md      # Original 700-line CLAUDE.md
│   └── sdk-reference.md   # Deep dive content
└── templates/             # Per-mod templates
```

---

## Context Rules

### What to Load
- This file (`CLAUDE.md`) - ~170 lines
- `patterns/_index.md` - ~200 lines
- Specific pattern files as needed

### What NOT to Load
- `code/mod/index.d.ts` - Let validator search it
- Full example mods - Use patterns instead
- All patterns at once - Load only what's needed

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

1. Read this file (`CLAUDE.md`)
2. Read `patterns/_index.md` to know what patterns exist
3. Identify user intent → route to appropriate process
4. Use skills to stay context-efficient
