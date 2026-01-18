# Experimental Features - Claude Context

> **Parent Project**: Battlefield Portal SDK
> **Purpose**: Sandbox for exploring features beyond documented SDK capabilities
> **Methodology**: See [METHODOLOGY.md](experimental/METHODOLOGY.md) for the full process

---

## Quick Start for Claude Sessions

**Before doing ANY experimental work**, read [METHODOLOGY.md](experimental/METHODOLOGY.md).

The key principle: **Never contaminate working code.**

---

## Folder Structure

```
experimental/
├── CLAUDE.md              # This file - session context
├── METHODOLOGY.md         # The full experimental process (READ THIS)
├── prototypes/            # Experimental code (isolated)
│   └── {feature}-{approach}-v{n}.ts
├── spatials/              # Test environments
│   └── {test-name}.spatial.json
└── research/              # Per-feature research documents
    └── {feature}.md
```

---

## Active Research Topics

| Feature | Status | Document |
|---------|--------|----------|
| Double Jump | Research Complete | [research/double-jump.md](experimental/research/double-jump.md) |

---

## Critical Rules

1. **ALL experimental code** goes in `experimental/prototypes/`
2. **NEVER edit** files in `mods/` or `patterns/` during experiments
3. **ALWAYS test** in isolated spatials (use `construct.json` or create in `experimental/spatials/`)
4. **DOCUMENT everything** - failures are as valuable as successes
5. **VALIDATE with user** before declaring success

---

## Session Types

| Type | Goal | Output |
|------|------|--------|
| **Research** | Understand what's possible | Research doc in `research/` |
| **Implementation** | Build working prototype | Prototype in `prototypes/` |
| **Refinement** | Polish and tune | Improved prototype |
| **Extraction** | Formalize for reuse | New pattern in `patterns/` |

---

## When User Asks for Experimental Feature

1. Check if research exists in `research/`
2. If not, start with **Research Session** (see METHODOLOGY.md Phase 1-3)
3. If research exists, proceed to **Implementation Session** (see METHODOLOGY.md Phase 4-5)
4. Always confirm approach with user before heavy coding
