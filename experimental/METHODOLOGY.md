# Experimental Features Methodology

> **Purpose**: A systematic approach for exploring, testing, and validating experimental game mechanics in the Battlefield Portal SDK
> **Last Updated**: 2026-01-18

---

## The Core Challenge

When a user wants a feature that isn't documented in our patterns or obviously supported by the SDK, we face several questions:

1. **Is it possible?** - Does the SDK expose the necessary primitives?
2. **How might we do it?** - What approaches could work?
3. **Does it actually work?** - How do we test without assumptions?
4. **Is it good enough?** - Does the result meet the user's intent?
5. **How do we keep it safe?** - How do we not break existing work?

This methodology addresses each stage.

---

## Phase 1: Question Framing

Before any exploration, clearly define:

### 1.1 The User's Intent
- What experience does the user want?
- What's the minimum viable version?
- What would "close enough" look like?
- Are there examples from other games they're referencing?

### 1.2 The Knowledge Gap
- Is this feature documented in our patterns? (Check `patterns/_index.md`)
- Have we seen similar code in example mods?
- Is this a "known unknown" (we know we don't know) or "unknown unknown"?

### 1.3 Success Criteria
- How will we know if it works?
- What's the measurable outcome?
- What edge cases matter?

**Output**: A clear problem statement with success criteria.

---

## Phase 2: SDK Capability Audit

Systematically search the SDK for relevant primitives.

### 2.1 Direct Search
Search `code/mod/index.d.ts` for keywords related to the feature:
- Function names (verbs: Set, Get, Enable, Apply, Force)
- Nouns (Player, Soldier, Movement, Velocity, Position)
- Related concepts (if seeking "jump", also search "air", "ground", "fall")

### 2.2 Enum Discovery
Many capabilities are hidden in enums:
- `SoldierStateBool` - What player states can we query?
- `SoldierStateVector` - What vectors can we read?
- `SoldierStateNumber` - What numeric values exist?
- `RestrictedInputs` - What inputs can we control?
- `Gadgets`, `Weapons`, etc. - What items might have side effects?

### 2.3 Document Findings
Create a table:

| What We Need | SDK Provides | Gap |
|--------------|--------------|-----|
| Detect jump input | `SoldierStateBool.IsJumping` | None |
| Apply upward force | Nothing | Must simulate via Teleport |

### 2.4 Study Example Mods
Search existing mods for similar patterns:
- How do they solve related problems?
- What workarounds have they used?
- What can we learn from their approach?

**Output**: Capability inventory showing what exists, what's missing, and potential workarounds.

---

## Phase 3: Approach Brainstorming

Generate multiple potential solutions before committing to one.

### 3.1 Divergent Thinking
List ALL approaches, even impractical ones:
- Direct approach (if SDK supports it)
- Simulation approach (fake it with available primitives)
- Repurposing approach (use unrelated feature creatively)
- Approximation approach (achieve similar-enough effect)
- Hybrid approach (combine multiple techniques)

### 3.2 Approach Evaluation
For each approach, assess:

| Criteria | Questions |
|----------|-----------|
| Feasibility | Can we actually build this with SDK primitives? |
| Complexity | How much code/state management needed? |
| Performance | Will polling loops or frequent calls cause issues? |
| Feel | Will players notice it's a workaround? |
| Robustness | How many edge cases could break it? |
| Maintainability | Can we explain this to future Claude sessions? |

### 3.3 Rank and Select
- Identify the simplest approach that might work
- Identify the most robust approach
- Choose which to prototype first (usually simplest)

**Output**: Ranked list of approaches with recommended first attempt.

---

## Phase 4: Isolated Prototyping

Build and test in complete isolation from user's work.

### 4.1 Isolation Principles

**CRITICAL**: Experimental code must NEVER touch:
- Files in `mods/` (user's working projects)
- Files in `patterns/` (verified, trusted code)
- Any file the user is actively developing

**All experimental code goes in**:
```
experimental/
├── prototypes/           # Prototype .ts files
│   └── {feature}-v{n}.ts # Versioned prototypes
├── spatials/             # Test-specific spatial files
└── research/             # Research documents per feature
```

### 4.2 Test Environment
Use isolated spatial environments:
- `example spacials/construct.json` - Elevated platform above normal gameplay
- Create custom spatials in `experimental/spatials/` if needed
- Never modify existing level spatials

### 4.3 Prototype Naming Convention
```
{feature}-{approach}-v{version}.ts

Examples:
- double-jump-teleport-v1.ts
- double-jump-teleport-v2.ts
- double-jump-arc-simulation-v1.ts
```

### 4.4 Prototype Structure
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
// Description: [What this attempts to do]
// Open Questions: [What we're trying to learn]

import * as mod from "../../code/mod";

// ... implementation ...
```

**Output**: Working prototype in `experimental/prototypes/`.

---

## Phase 5: Empirical Testing

Test with actual gameplay, not assumptions.

### 5.1 Test Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| Happy Path | Does basic functionality work? | Can player double jump? |
| Edge Cases | What breaks it? | Death mid-jump, vehicle entry, water |
| Timing | Are there race conditions? | Rapid input, lag |
| Multiplayer | Does it work for all players? | Multiple players jumping simultaneously |
| Performance | Does it impact game feel? | Frame rate, input lag |

### 5.2 Test Documentation
For each test:
```markdown
## Test: [Name]
**Input**: [What we did]
**Expected**: [What we thought would happen]
**Actual**: [What actually happened]
**Conclusion**: [What we learned]
```

### 5.3 Open Questions Protocol
Some things can only be learned empirically:
- "How long does IsJumping stay true?" → Test and measure
- "Does Teleport preserve momentum?" → Test and observe
- "What's the minimum Wait() interval?" → Test with various values

**Output**: Test results document with empirical findings.

---

## Phase 6: Validation

Confirm the solution meets original intent.

### 6.1 Success Criteria Check
Return to Phase 1 success criteria:
- Does it achieve the minimum viable version?
- Does it feel "good enough"?
- Are edge cases handled acceptably?

### 6.2 User Validation
Before declaring success:
- Show the user what we built
- Get feedback on feel/behavior
- Identify any gaps between expectation and result

### 6.3 Limitation Documentation
Be explicit about what DOESN'T work:
- Known edge cases that fail
- Compromises made
- "Good enough" vs "perfect" gaps

**Output**: Validation report with user sign-off.

---

## Phase 7: Promotion (Optional)

If the experiment succeeds and is worth reusing:

### 7.1 Pattern Extraction
If robust enough for reuse:
1. Clean up code
2. Document thoroughly
3. Move to `patterns/` with proper header
4. Update `patterns/_index.md`

### 7.2 Integration
If user wants it in their mod:
1. Copy relevant code (don't move prototype)
2. Adapt to mod's architecture
3. Test in context of full mod
4. Keep prototype for reference

### 7.3 Archive
If experiment fails or is one-off:
1. Keep prototype in `experimental/prototypes/`
2. Document why it failed or was abandoned
3. Future sessions can learn from it

**Output**: Either a new pattern, integrated code, or archived learning.

---

## Contamination Prevention Checklist

Before ANY experimental work:

- [ ] User's mod files identified and marked off-limits
- [ ] Working in `experimental/` folder only
- [ ] Using test spatial (not user's level)
- [ ] Prototype clearly marked as experimental
- [ ] No imports from user's mod code

During experimental work:

- [ ] All new files created in `experimental/`
- [ ] No edits to files outside `experimental/`
- [ ] No git commits mixing experimental and production
- [ ] Clear communication about what's being tested

Before integration:

- [ ] User explicitly requests integration
- [ ] Code copied (not moved) to target location
- [ ] Integration tested in context
- [ ] Prototype preserved for reference

---

## Quick Reference: Experimental Session Flow

```
1. FRAME THE QUESTION
   └─→ What does user want? What would success look like?

2. AUDIT THE SDK
   └─→ What primitives exist? What's missing?

3. BRAINSTORM APPROACHES
   └─→ List options, evaluate, select first attempt

4. PROTOTYPE IN ISOLATION
   └─→ Build in experimental/, never touch user's code

5. TEST EMPIRICALLY
   └─→ Actually run it, document results, answer open questions

6. VALIDATE WITH USER
   └─→ Does it meet their intent? Good enough?

7. PROMOTE OR ARCHIVE
   └─→ Pattern extraction, integration, or documented learning
```

---

## Folder Structure

```
experimental/
├── CLAUDE.md              # Context for Claude sessions
├── METHODOLOGY.md         # This document
├── prototypes/            # Experimental code
│   └── {feature}-{approach}-v{n}.ts
├── spatials/              # Test environments
│   └── {test-name}.spatial.json
└── research/              # Per-feature research docs
    └── {feature}.md
```

---

## Anti-Patterns to Avoid

| Don't | Do Instead |
|-------|------------|
| Edit user's mod files during experiments | Work only in `experimental/` |
| Assume SDK behavior without testing | Test empirically and document |
| Skip to coding before understanding SDK | Complete capability audit first |
| Commit experimental code with production | Keep experimental on separate branch or uncommitted |
| Declare success without user validation | Always confirm with user |
| Abandon failed experiments silently | Document what didn't work and why |
