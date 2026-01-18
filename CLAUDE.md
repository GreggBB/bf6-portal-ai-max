# Spatial JSON Generator - Claude Context

> **Project Status**: ✅ Implementation Complete (v1.0.0)
> **Last Updated**: 2026-01-18

## What We Built

A TypeScript programmatic API that generates valid `.spatial.json` files for Battlefield Portal. These files define level modifications that get loaded alongside base maps - spawners, boundaries, structural assets, and game objects.

### Primary Goal ✅
Create elevated testing platforms above existing levels - simple floor grids with team spawns at opposite ends. Think: arenas, mazes, bomberman-style maps.

### Why This Matters
- Godot editor is designed for human GUI interaction, not AI generation
- But the output format (`.spatial.json`) is structured JSON that CAN be programmatically generated
- This enables AI-assisted level design for simple structures

---

## Project Status

### Completed ✅
- [x] Set up project structure (package.json, tsconfig.json)
- [x] Create type definitions (spatial.ts, game-objects.ts, assets.ts)
- [x] Implement utility functions (vector.ts, rotation.ts, id.ts)
- [x] Build floor grid generator
- [x] Build spawn system generator (HQ + SpawnPoints)
- [x] Build combat area and sector generators
- [x] Build deploy cam generator
- [x] Create SpatialBuilder fluent API
- [x] Implement validator
- [x] Create testing-platform preset
- [x] Write example script and generate test output

### Next Steps (Future Enhancements)
- [ ] Add wall generator for perimeter boundaries
- [ ] Add capture point generator for conquest modes
- [ ] Add vehicle spawner generator
- [ ] CLI wrapper for command-line usage
- [ ] Import generated spatial into Godot for validation

---

## Usage

### Quick Start (Preset)

```typescript
import { createTestingPlatform, validateDocument } from '@bf-portal/spatial-generator';
import * as fs from 'fs';

// Create a 10x20 tile testing platform
const document = createTestingPlatform();

// Validate the document
const validation = validateDocument(document);
console.log(validation.valid ? 'Valid!' : validation.errors.join('\n'));

// Export to file
fs.writeFileSync('my-platform.spatial.json', JSON.stringify(document, null, 2));
```

### Builder API (Custom Configuration)

```typescript
import { SpatialBuilder, vec3, Elevations } from '@bf-portal/spatial-generator';

const builder = new SpatialBuilder()
  .setMapTarget('MP_Abbasid')
  .addFloorGrid({
    origin: vec3(-50, Elevations.Platform, -75),
    tilesX: 15,
    tilesZ: 30,
  })
  .addTeamSpawns({
    spawnCount: 5,
    padding: 8,
  })
  .addCombatArea({
    padding: 15,
  })
  .addSector()
  .addDeployCam();

const json = builder.toJSON();
```

### Running the Examples

```bash
cd spatial-generator
npm install
npm run example
```

Generated files are output to `spatial-generator/output/`.

---

## File Structure

```
spatial-generator/
├── src/
│   ├── index.ts              # Main exports
│   ├── builder.ts            # SpatialBuilder fluent API
│   ├── validator.ts          # Validation logic
│   ├── types/
│   │   ├── spatial.ts        # Core types (Vector3, SpatialObject, etc.)
│   │   ├── game-objects.ts   # Game object types (HQ, Sector, etc.)
│   │   └── assets.ts         # Asset definitions and constants
│   ├── utils/
│   │   ├── vector.ts         # Vector3 math utilities
│   │   ├── rotation.ts       # Rotation matrix utilities
│   │   └── id.ts             # ID generation utilities
│   ├── generators/
│   │   ├── floor-grid.ts     # Floor tile grid generator
│   │   ├── spawn-system.ts   # HQ + SpawnPoint generator
│   │   ├── combat-area.ts    # CombatArea + PolygonVolume generator
│   │   ├── sector.ts         # Sector generator
│   │   └── deploy-cam.ts     # DeployCam generator
│   ├── presets/
│   │   └── testing-platform.ts  # Quick platform presets
│   └── examples/
│       └── generate-test-platform.ts
├── output/                   # Generated spatial files
├── dist/                     # Compiled JavaScript
├── package.json
├── tsconfig.json
├── CLAUDE.md                 # This file
├── RESEARCH.md               # Spatial JSON format research
└── implementation-plan.md    # Original implementation plan
```

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Interface style | **Programmatic API** | More flexible for integration with existing scripts and projects |
| File handling | **New files only** | Simpler implementation; no merge complexity |
| CLI tool | **Deferred** | Can add later if needed; API is the priority |

---

## Quick Facts

### FiringRange_Floor_A Dimensions
- **X spacing**: 3.537 units
- **Z spacing**: 5.0101 units
- **Standard elevation**: Y = 90 (above typical ground ~64)

### Required Game Objects for Valid Map
1. `Sector` - manages objectives
2. `CombatArea` + `PolygonVolume` - playable boundary
3. `HQ_PlayerSpawner` (x2) - team spawn systems
4. `SpawnPoint` (multiple) - individual spawn locations
5. `DeployCam` - deployment screen camera

### ObjId Conventions
- 1-2: HQ Spawners (Team1=1, Team2=2)
- 200+: Capture Points
- 500+: Sound objects

---

## Reference Files (in parent SDK)

| File | Purpose |
|------|---------|
| `example spacials/construct.json` | Elevated testing platform reference |
| `example spacials/battleman.json` | Bomberman-style map with walls |
| `FbExportData/asset_types.json` | All 8,750 available assets |
