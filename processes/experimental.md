# Experimental Process

> **When**: User wants a feature not covered by existing patterns
> **Purpose**: Safely explore undocumented SDK capabilities
> **Output**: Working prototype or documented learning

---

## Trigger Recognition

User might be asking for experimental work when they say:
- "Can Portal do X?" (where X isn't in patterns)
- "I want [feature from another game]"
- "Is it possible to..."
- "Can we make players [unusual ability]?"
- "I saw this in BF2042, can we..."

---

## Before Starting Experimental Work

### Check Existing Resources

1. **Search patterns** (`patterns/_index.md`) - Is this already documented?
2. **Use `/portal:research`** - Might find relevant patterns
3. **Check `experimental/research/`** - Previous research on this topic?

### If Already Documented
Don't experiment - use the existing pattern.

### If Truly Unknown
Proceed with experimental methodology.

---

## The 7-Phase Process

Full details in `experimental/METHODOLOGY.md`. Summary:

### Phase 1: Question Framing
- What does user actually want?
- What's "good enough"?
- How will we know it works?

### Phase 2: SDK Capability Audit
- Search `code/mod/index.d.ts` for relevant functions
- Document what exists vs what's missing
- Study example mods for workarounds

### Phase 3: Approach Brainstorming
- List ALL possible approaches
- Evaluate feasibility, complexity, feel
- Select first approach to try

### Phase 4: Isolated Prototyping
- **CRITICAL**: Work only in `experimental/prototypes/`
- Never touch user's mod files
- Use test spatials for isolated testing

### Phase 5: Empirical Testing
- Actually test the prototype
- Document what works and what doesn't
- Answer open questions through observation

### Phase 6: Validation
- Does it meet user's intent?
- Good enough to use?
- Document limitations

### Phase 7: Promotion or Archive
- Success → Extract to pattern or integrate
- Failure → Document learning, archive prototype

---

## Critical Isolation Rules

**Experimental code must NEVER touch**:
- Files in `mods/` (user's working projects)
- Files in `patterns/` (verified patterns)
- Any file the user is actively developing

**All experimental work goes in**:
```
experimental/
├── prototypes/           # Prototype .ts files
│   └── {feature}-v{n}.ts
├── spatials/             # Test-specific spatial files
└── research/             # Research documents per feature
```

---

## Prototype File Format

Every prototype should be self-contained:

```typescript
// experimental/prototypes/double-jump-teleport-v1.ts
//
// EXPERIMENTAL - DO NOT USE IN PRODUCTION
// Feature: Double Jump
// Approach: Teleport-based boost
// Version: 1
// Status: Testing
//
// Description: Attempts to detect mid-air jump input and
//              teleport player upward to simulate double jump
//
// Open Questions:
// - How long does IsJumping stay true?
// - Does Teleport preserve momentum?

import * as mod from "../../code/mod";

// ... implementation ...
```

---

## Research Document Format

Create for each experimental feature:

```markdown
# Feature: [Name]

> Status: [Research/Prototyping/Testing/Complete/Abandoned]
> Last Updated: [date]

## User Intent
[What does the user want to achieve?]

## SDK Capability Audit

| What We Need | SDK Provides | Gap |
|--------------|--------------|-----|
| [need] | [function or "none"] | [description] |

## Approaches Tried

### Approach 1: [Name]
- **Prototype**: `experimental/prototypes/[file].ts`
- **Result**: [Worked/Failed/Partial]
- **Notes**: [observations]

### Approach 2: [Name]
[etc.]

## Conclusion
[What we learned, final recommendation]

## Integration Path
[If successful, how to integrate into a mod]
```

---

## Contamination Prevention Checklist

**Before starting**:
- [ ] User's mod files identified and marked off-limits
- [ ] Working in `experimental/` folder only
- [ ] Using test spatial (not user's level)
- [ ] Prototype clearly marked as experimental

**During work**:
- [ ] All new files in `experimental/`
- [ ] No edits to files outside `experimental/`
- [ ] Clear communication about what's being tested

**Before integration**:
- [ ] User explicitly requests integration
- [ ] Code copied (not moved) to target location
- [ ] Integration tested in context
- [ ] Prototype preserved for reference

---

## When Experiments Fail

Failure is valuable information. Document:

1. **What we tried** - Approaches tested
2. **What happened** - Specific failures
3. **Why it failed** - SDK limitations, etc.
4. **Workarounds considered** - Even if not viable
5. **Future possibilities** - What might change this

Keep failed prototypes in `experimental/prototypes/` for future reference.

---

## Integration Path

When an experiment succeeds:

### Option A: Promote to Pattern
If robust and reusable:
1. Clean up code
2. Document thoroughly
3. Create new pattern file
4. Update `patterns/_index.md`

### Option B: Direct Integration
If user wants it in their mod:
1. **Copy** (don't move) code to mod
2. Adapt to mod's architecture
3. Test in full mod context
4. Keep prototype as reference

### Option C: Archive Only
If one-off or partially successful:
1. Keep prototype
2. Document in research file
3. Note limitations
4. Future sessions can learn from it

---

## Experimental Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Edit user's mod during experiments | Work only in `experimental/` |
| Assume SDK behavior without testing | Test empirically and document |
| Skip capability audit | Search SDK thoroughly first |
| Abandon experiments silently | Document what didn't work and why |
| Mix experimental with production | Keep strict isolation |

---

## Current Experimental Research

Check `experimental/research/` for ongoing or completed research:

| Feature | Status | Document |
|---------|--------|----------|
| Double Jump | Research Complete | `experimental/research/double-jump.md` |

---

## Next Steps

After experimental work:

1. **Success** → Integrate or promote to pattern
2. **Failure** → Document learning, discuss alternatives with user
3. **Partial** → Discuss if "good enough" meets user needs
