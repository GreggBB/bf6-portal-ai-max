# Building Process

> **When**: After planning (or directly after discovery for simple mods)
> **Purpose**: Generate complete, validated mod code
> **Output**: Working `.ts` file + `.strings.json` + Godot requirements

---

## Build Decision Tree

```
Requirements clear?
├── No → Go to processes/discovery.md
└── Yes
    └── Complexity?
        ├── Simple (< 500 lines) → Single /portal:build call
        ├── Medium (500-1500 lines) → May need chunking
        └── Complex (> 1500 lines) → Chunked builds required
```

---

## Single Build (Simple Mods)

For mods with < 5 features and < 500 estimated lines:

### Invoke the Builder

```
/portal:build ModName

Requirements:
- Feature 1: [description]
- Feature 2: [description]
- Feature 3: [description]

Patterns:
- patterns/core/event-hooks.md
- patterns/core/state-management.md
- [other patterns as needed]

Constraints:
- [any limitations]
```

### What Builder Returns

1. **Complete `.ts` file** with:
   - GC/GD class structure
   - All event hooks
   - Feature implementations
   - Source citations as comments

2. **`.strings.json` entries** for all `mod.Message()` calls

3. **Godot requirements** list (spawn points, objectives, etc.)

---

## Chunked Build (Complex Mods)

For mods with > 1500 estimated lines or many interconnected features:

### Strategy

Build in phases, each producing a functional increment:

1. **Chunk 1**: Core structure + primary mechanic
2. **Chunk 2**: Add secondary features
3. **Chunk 3**: Add polish features
4. **Merge**: Combine into final file

### Chunk Size Guidelines

| Chunk Type | Target Lines | Content |
|------------|--------------|---------|
| Core | 200-400 | GC/GD, main loop, primary mechanic |
| Feature | 150-300 | One major feature or 2-3 minor |
| Polish | 100-200 | UI, audio, edge cases |

### Chunked Build Example

**Chunk 1 - Core**:
```
/portal:build RaceMod_Core

Requirements:
- GC/GD structure for racing
- OnGameModeStarted initialization
- Basic checkpoint detection

Patterns:
- patterns/core/state-management.md
- patterns/gameplay/checkpoints.md
```

**Chunk 2 - Features**:
```
/portal:build RaceMod_Features

Existing code context:
[paste GC/GD structure from Chunk 1]

Requirements:
- Lap counting
- Position tracking
- Finish detection

Patterns:
- patterns/gameplay/checkpoints.md (position tracking)
- patterns/ui/widgets.md
```

**Chunk 3 - Polish**:
```
/portal:build RaceMod_Polish

Existing code context:
[paste current state]

Requirements:
- Timer display
- Position UI
- Victory announcement

Patterns:
- patterns/ui/widgets.md
- patterns/audio/audio.md
```

### Merging Chunks

After all chunks:
1. Combine GC/GD classes (merge properties)
2. Combine event hooks (merge logic)
3. Resolve any naming conflicts
4. Run `/portal:validate` on merged code

---

## Build Rules

### Always

- Source every `mod.*` call from patterns or SDK
- Include source citations as comments
- Validate after every build

### Never

- Invent functions not in SDK
- Use web-sourced BF2042 code
- Skip validation
- Build without clear requirements

---

## Context Management During Builds

| Action | Context Impact |
|--------|----------------|
| Single build | +15-25% |
| Each chunk | +10-15% |
| Validation | +5% |

**If approaching 40%**:
1. Complete current chunk
2. Validate what you have
3. Create checkpoint (see `processes/context-management.md`)
4. Continue in new session if needed

---

## Post-Build Checklist

After receiving built code:

- [ ] Code compiles (no syntax errors)
- [ ] All `mod.*` calls look correct
- [ ] Strings file has all keys
- [ ] Godot requirements documented
- [ ] Run `/portal:validate`

---

## Validation Integration

**Always validate after building**:

```
/portal:validate

[paste the generated code]
```

### If Validation Passes
- Code is ready for delivery
- Include strings file and Godot requirements

### If Validation Fails

| Error Type | Fix Approach |
|------------|--------------|
| 1-3 simple errors | Fix in main context |
| 4+ errors | Re-build with corrections |
| Structural issues | Re-plan and rebuild |

---

## Delivery Format

When delivering to user:

```markdown
## [ModName] Complete

### Code
\`\`\`typescript
// [ModName].ts
[complete code]
\`\`\`

### Strings
\`\`\`json
// [ModName].strings.json
{
  "HUD_SCORE": "Score: %1",
  "MSG_WIN": "Victory!"
}
\`\`\`

### Godot Setup
1. Create [N] SpawnPoint objects
2. Create [N] CapturePoint objects
3. [etc.]

### Notes
- [Any special instructions]
- [Known limitations]
```

---

## Building Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Build without requirements | Complete discovery first |
| Skip validation | Always validate |
| Build massive mods in one call | Use chunked builds |
| Copy from web examples | Use only local patterns |
| Ignore validation errors | Fix before delivery |

---

## Next Steps

After successful build and validation:

1. **All clear** → Deliver to user
2. **Validation errors** → See `processes/validation.md`
3. **Runtime issues** → See `processes/troubleshooting.md`
4. **Context full** → See `processes/context-management.md`
