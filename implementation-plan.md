# Implementation Plan: Spatial JSON Generator

> **Status**: ✅ Implementation Complete (v1.0.0)
> **Created**: 2026-01-18
> **Completed**: 2026-01-18
> **Goal**: Create a TypeScript programmatic API that generates valid `.spatial.json` files to supplement Portal mods

---

## Executive Summary

The generator has been implemented as a **composable library** with a fluent builder pattern, enabling both simple presets and custom configurations.

**Design Decisions (Implemented):**
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Interface style | **Programmatic API** | More flexible for integration with existing scripts and projects |
| File handling | **New files only** | Simpler implementation; no merge complexity |
| CLI tool | **Deferred** | Can add later if needed; API is the priority |

---

## Implementation Todos ✅

All tasks completed in a single session:

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

---

## File Structure

```
Battlefield Portal SDK/spatial-generator/
├── src/
│   ├── index.ts              # Main exports (programmatic API)
│   ├── builder.ts            # SpatialBuilder class
│   ├── validator.ts          # Validation logic
│   ├── output.ts             # JSON serialization
│   ├── types/
│   │   ├── spatial.ts        # SpatialObject, Vector3, RotationMatrix
│   │   ├── game-objects.ts   # Sector, CombatArea, HQ, SpawnPoint, etc.
│   │   └── assets.ts         # Floor, wall, barrier asset definitions
│   ├── utils/
│   │   ├── vector.ts         # Vector3 math (add, subtract, scale, distance)
│   │   ├── rotation.ts       # createIdentity(), createYawRotation(deg), createTopDown()
│   │   └── id.ts             # generateUniqueId(), buildHierarchicalId()
│   ├── generators/
│   │   ├── floor-grid.ts     # generateFloorGrid(config) → SpatialObject[]
│   │   ├── spawn-system.ts   # generateHQWithSpawns(config) → SpatialObject[]
│   │   ├── combat-area.ts    # generateCombatArea(bounds, height) → SpatialObject[]
│   │   ├── deploy-cam.ts     # generateDeployCam(position, lookAt) → SpatialObject
│   │   ├── walls.ts          # generateWallSegment, generateWallPerimeter
│   │   └── sector.ts         # generateSector(capturePoints, areaRef) → SpatialObject
│   └── presets/
│       └── testing-platform.ts
├── examples/
│   └── generate-test-platform.ts
├── package.json
├── tsconfig.json
├── CLAUDE.md
├── RESEARCH.md
└── implementation-plan.md    # This file
```

---

## Implementation Order

1. **Setup** - package.json, tsconfig.json
2. **Types** - All interfaces in types/
3. **Utils** - Vector, rotation, ID utilities
4. **Generators** - Floor grid first (most complex), then spawn system
5. **Builder** - Fluent API wrapping generators
6. **Validation** - Reference checking, bounds checking
7. **Presets** - Testing platform preset
8. **Example** - Working example script showing API usage

---

## Phase 1: Core Types & Utilities

**Key Type Definitions:**
```typescript
interface Vector3 { x: number; y: number; z: number; }

interface RotationMatrix {
  right: Vector3;
  up: Vector3;
  front: Vector3;
}

interface SpatialObject {
  name: string;
  type: string;
  id: string;
  position: Vector3;
  right: Vector3;
  up: Vector3;
  front: Vector3;
  ObjId?: number;
  linked?: string[];
  [key: string]: unknown;  // Additional properties per type
}

interface SpatialDocument {
  Portal_Dynamic: SpatialObject[];
}
```

---

## Phase 2: Object Generators

**Floor Grid Generator:**
```typescript
interface FloorGridConfig {
  origin: Vector3;           // Starting corner
  tilesX: number;            // Width in tiles
  tilesZ: number;            // Length in tiles
  elevation?: number;        // Y position (default: 90)
  assetType?: string;        // Default: FiringRange_Floor_A
  idPrefix?: string;         // For unique naming
}

function generateFloorGrid(config: FloorGridConfig): {
  objects: SpatialObject[];
  bounds: { min: Vector3; max: Vector3 };
}
```

**Spawn System Generator:**
```typescript
interface SpawnSystemConfig {
  teamNumber: 1 | 2;
  basePosition: Vector3;
  spawnCount: number;
  spacing: number;           // Distance between spawn points
  facingDirection: number;   // Yaw angle in degrees
  idPrefix: string;
}

function generateSpawnSystem(config: SpawnSystemConfig): SpatialObject[]
// Returns: HQ_PlayerSpawner + PolygonVolume (HQ area) + N SpawnPoints
```

---

## Phase 3: Builder API

**Builder Pattern:**
```typescript
const platform = new SpatialBuilder()
  .setMapTarget('MP_Abbasid')  // Cairo - for coordinate reference
  .addFloorGrid({
    origin: { x: -80, y: 90, z: -50 },
    tilesX: 10,
    tilesZ: 20
  })
  .addTeamSpawns({
    team1: { position: 'south', spawnCount: 3 },
    team2: { position: 'north', spawnCount: 3 }
  })
  .addCombatArea({ padding: 10 })
  .addDeployCam({ height: 70, lookAt: 'center' })
  .build();

// Export
fs.writeFileSync('output.spatial.json', platform.toJSON());
```

---

## Phase 4: Presets

**Testing Platform Preset:**
```typescript
function createTestingPlatform(options?: {
  width?: number;      // Default: 10 tiles
  length?: number;     // Default: 20 tiles
  elevation?: number;  // Default: 90
  spawnsPerTeam?: number; // Default: 3
}): SpatialDocument
```

---

## Phase 5: Validation

**Validation Rules:**
1. All `linked` references point to existing object IDs
2. No duplicate ObjIds
3. Spawn points are within combat area bounds
4. Floor tiles don't have gaps (optional warning)
5. Required objects present (Sector, CombatArea, HQ for each team)

---

## Critical Constants

```typescript
// Floor tile spacing (FiringRange_Floor_A)
const TILE_SPACING_X = 3.537;
const TILE_SPACING_Z = 5.0101;

// Standard elevations
const ELEVATED_PLATFORM_Y = 90;
const COMBAT_POLYGON_Y = 121;
const DEPLOY_CAM_Y = 167;

// ObjId conventions
const OBJID_TEAM1_HQ = 1;
const OBJID_TEAM2_HQ = 2;
const OBJID_CAPTURE_POINT_START = 200;

// Rotation presets
const ROTATION_IDENTITY = { right: {x:1,y:0,z:0}, up: {x:0,y:1,z:0}, front: {x:0,y:0,z:1} };
const ROTATION_Y90 = { right: {x:0,y:0,z:-1}, up: {x:0,y:1,z:0}, front: {x:1,y:0,z:0} };
```

---

## Verification Plan

### Stage 1: Unit Validation
- Generated JSON matches schema of working examples
- All `linked` references resolve
- ObjId conventions followed

### Stage 2: Godot Validation
- Import generated `.spatial.json` into Godot SDK
- Objects appear in scene tree correctly
- No import errors or warnings

### Stage 3: Export Validation
- Export from Godot and verify structure preserved
- Compare against known-working spatial files

### Stage 4: In-Game Testing
- Load on Cairo (MP_Abbasid) or similar map
- Verify: floor renders, spawns work, boundaries enforced, camera correct

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Generated geometry clips terrain | Use elevated Y=90+ positions |
| Invalid references crash game | Validator catches before export |
| Spawn points outside combat area | Auto-calculate bounds from floor grid |
| Floor tiles have gaps | Validator warns if tiles non-contiguous |

---

## Success Criteria

1. Generate a 10x20 tile platform with team spawns
2. Import cleanly into Godot with no errors
3. Export and load in-game on Cairo map
4. Players spawn correctly on elevated platform
5. Combat boundary prevents falling off edges

---

## Reference Documents

- `RESEARCH.md` - Comprehensive spatial JSON format documentation
- `../example spacials/construct.json` - Floor tile and spawn patterns
- `../example spacials/battleman.json` - Wall placement patterns
- `../FbExportData/asset_types.json` - All 8,750 available assets
