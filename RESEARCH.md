# Spatial JSON Research Document

> **Last Updated**: 2026-01-18
> **Sources**: SDK examples, user examples (construct.json, battleman.json), online documentation

---

## Table of Contents

1. [Spatial JSON Structure](#1-spatial-json-structure)
2. [Object Types Reference](#2-object-types-reference)
3. [Coordinate System](#3-coordinate-system)
4. [Rotation Matrix Format](#4-rotation-matrix-format)
5. [Asset Analysis: FiringRange_Floor_A](#5-asset-analysis-firingrange_floor_a)
6. [ObjId System](#6-objid-system)
7. [Reference Linking](#7-reference-linking)
8. [Online Documentation Summary](#8-online-documentation-summary)
9. [Feasibility Assessment](#9-feasibility-assessment)

---

## 1. Spatial JSON Structure

### Root Format

All spatial JSON files follow this structure:

```json
{
    "Portal_Dynamic": [
        { /* object 1 */ },
        { /* object 2 */ },
        ...
    ]
}
```

The `Portal_Dynamic` array contains all placeable/modifiable objects for the map.

### Universal Object Properties

Every object in the array contains these core properties:

```json
{
    "name": "DisplayName",
    "type": "ObjectType",
    "id": "namespace/path/name",
    "position": { "x": 0, "y": 0, "z": 0 },
    "right": { "x": 1, "y": 0, "z": 0 },
    "up": { "x": 0, "y": 1, "z": 0 },
    "front": { "x": 0, "y": 0, "z": 1 }
}
```

Optional properties:
- `ObjId`: Numeric ID for TypeScript code access
- `linked`: Array of property names that contain references to other objects
- `Team`: Team assignment ("Team1" or "Team2")
- `AltTeam`: Alternate team designation ("TeamNeutral")

---

## 2. Object Types Reference

### 2.1 DeployCam

Initial camera position for player deployment view.

```json
{
    "name": "DeployCam",
    "type": "DeployCam",
    "id": "DeployCam",
    "position": { "x": -91.6011, "y": 167.886, "z": 3.86193 },
    "right": { "x": 1, "y": 0, "z": 0 },
    "up": { "x": 0, "y": 0, "z": -1 },
    "front": { "x": 0, "y": 1, "z": 0 }
}
```

**Note**: DeployCam uses a special rotation for top-down view:
- `up: (0, 0, -1)` and `front: (0, 1, 0)` points camera downward

### 2.2 CombatArea

Defines the playable boundary. Links to a PolygonVolume.

```json
{
    "name": "CombatArea",
    "type": "CombatArea",
    "id": "CombatArea",
    "CombatVolume": "CombatArea/CollisionPolygon3D",
    "position": { "x": -82.1664, "y": 64.1217, "z": 44.2427 },
    "right": { "x": 1, "y": 0, "z": 0 },
    "up": { "x": 0, "y": 1, "z": 0 },
    "front": { "x": 0, "y": 0, "z": 1 },
    "linked": ["CombatVolume"]
}
```

### 2.3 Sector

Manages objectives (CapturePoints, MCOMs) and sector boundaries.

```json
{
    "name": "Sector - This manages the CapturePoint Names",
    "type": "Sector",
    "id": "Sector - This manages the CapturePoint Names",
    "CapturePoints": ["Obectives/Flags/CapturePointA", "Obectives/Flags/CapturePointB"],
    "SectorArea": "CombatArea/CollisionPolygon3D",
    "position": { "x": -85.5523, "y": 64.1863, "z": -57.1726 },
    "linked": ["SectorArea", "CapturePoints"]
}
```

For simple testing platforms without objectives, use empty `CapturePoints: []`.

### 2.4 PolygonVolume

Defines a 3D boundary volume (polygon extruded vertically).

```json
{
    "name": "CollisionPolygon3D",
    "type": "PolygonVolume",
    "id": "CombatArea/CollisionPolygon3D",
    "height": 500,
    "points": [
        { "x": -177.678, "y": 121.1117, "z": -61.6443 },
        { "x": -211.0764, "y": 121.1117, "z": -38.0853 },
        { "x": -222.1514, "y": 121.1117, "z": -37.5907 },
        { "x": -250.3474, "y": 121.1117, "z": -21.9596 }
    ]
}
```

**Key properties:**
- `height`: Vertical extent of the volume
- `points`: Array of 3D coordinates defining polygon corners (all at same Y)
- No position/rotation properties (points are absolute coordinates)

### 2.5 HQ_PlayerSpawner

Team headquarters with spawn protection zone.

```json
{
    "name": "TEAM_1_HQ",
    "type": "HQ_PlayerSpawner",
    "id": "TEAM_1_HQ",
    "ObjId": 1,
    "AltTeam": "TeamNeutral",
    "VehicleSpawnersEnabled": true,
    "InfantrySpawns": [
        "TEAM_1_HQ/SpawnPoint_1_1"
    ],
    "HQArea": "TEAM_1_HQ/HQ_Team1",
    "position": { "x": -74.608, "y": 96.2336, "z": -44.1977 },
    "linked": ["HQArea", "InfantrySpawns"]
}
```

For Team 2, add `"Team": "Team2"` (Team1 is default).

### 2.6 SpawnPoint

Individual infantry spawn location.

```json
{
    "name": "SpawnPoint_1_1",
    "type": "SpawnPoint",
    "id": "TEAM_1_HQ/SpawnPoint_1_1",
    "position": { "x": -73.0917, "y": 90.09661, "z": -32.8596 },
    "right": { "x": 0.0619544, "y": 0, "z": -0.998079 },
    "up": { "x": 0, "y": 1, "z": 0 },
    "front": { "x": 0.998079, "y": 0, "z": 0.0619544 }
}
```

**Note**: Rotation determines which direction player faces on spawn.

### 2.7 CapturePoint

Conquest/Breakthrough objective point.

```json
{
    "name": "CapturePointA",
    "type": "CapturePoint",
    "id": "Obectives/Flags/CapturePointA",
    "ObjId": 200,
    "OutlineAbove16Points": true,
    "TacticalAdviceAirVehicleFriendly": true,
    "TacticalAdvicePriorityLevel_Team1": "AICommanderWorldPriority_2",
    "TacticalAdvicePriorityLevel_Team2": "AICommanderWorldPriority_2",
    "CaptureArea": "Obectives/Flags/CapturePointA/CapturePointArea",
    "InfantrySpawnPoints_Team1": [...],
    "InfantrySpawnPoints_Team2": [...],
    "position": { "x": -70.9904, "y": 88.1388, "z": -26.5188 },
    "linked": ["CaptureArea", "InfantrySpawnPoints_Team1", "InfantrySpawnPoints_Team2"]
}
```

### 2.8 VehicleSpawner

Vehicle spawn point.

```json
{
    "name": "VehicleSpawner-Abrams",
    "type": "VehicleSpawner",
    "id": "Vehicles/Team1/VehicleSpawner-Abrams",
    "VehicleType": "M2Bradley",
    "P_AutoSpawnEnabled": true,
    "P_DefaultRespawnTime": 45,
    "position": { "x": -284.711, "y": 70.5284, "z": 25.2139 },
    "right": { "x": -0.0366089, "y": 0, "z": -0.99933 },
    "up": { "x": 0, "y": 1, "z": 0 },
    "front": { "x": 0.99933, "y": 0, "z": -0.0366089 }
}
```

**VehicleType values**: "UH60", "M2Bradley", "Abrams", "Leopard", "CV90", etc.

### 2.9 Structural Assets (Floor Tiles, Walls)

Structural assets like `FiringRange_Floor_A` use the asset type name as both `name` and `type`:

```json
{
    "name": "FiringRange_Floor_A",
    "type": "FiringRange_Floor_A",
    "id": "Node3D/Floor/FiringRange_Floor_A",
    "position": { "x": -76.492, "y": 90, "z": -20.383 },
    "right": { "x": -4.37114e-08, "y": 0, "z": -1 },
    "up": { "x": 0, "y": 1, "z": 0 },
    "front": { "x": 1, "y": 0, "z": -4.37114e-08 }
}
```

---

## 3. Coordinate System

### Position Format

- **X**: Horizontal (east-west)
- **Y**: Vertical (up-down) - **THIS IS THE HEIGHT AXIS**
- **Z**: Horizontal (north-south)

Values are floats, can be negative.

### Typical Coordinate Ranges (from construct.json)

| Axis | Min | Max | Notes |
|------|-----|-----|-------|
| X | -250 | +90 | Map dependent |
| Y | 64 (ground) | 167 (camera) | 90 = elevated platform |
| Z | -115 | +155 | Map dependent |

### Elevation Reference Points

- **~64**: Typical ground level
- **90**: Elevated platform (construct.json floor tiles)
- **121**: Combat area polygon Y
- **167**: Deploy camera height

---

## 4. Rotation Matrix Format

Rotations use a 3x3 orthonormal matrix represented as three vectors:

```json
{
    "right": { "x": 1, "y": 0, "z": 0 },
    "up": { "x": 0, "y": 1, "z": 0 },
    "front": { "x": 0, "y": 0, "z": 1 }
}
```

### Common Rotation Patterns

**Identity (no rotation)**:
```json
"right": { "x": 1, "y": 0, "z": 0 },
"up": { "x": 0, "y": 1, "z": 0 },
"front": { "x": 0, "y": 0, "z": 1 }
```

**90-degree Y rotation (floor tiles use this)**:
```json
"right": { "x": -4.37114e-08, "y": 0, "z": -1 },
"up": { "x": 0, "y": 1, "z": 0 },
"front": { "x": 1, "y": 0, "z": -4.37114e-08 }
```

**Top-down camera (DeployCam)**:
```json
"right": { "x": 1, "y": 0, "z": 0 },
"up": { "x": 0, "y": 0, "z": -1 },
"front": { "x": 0, "y": 1, "z": 0 }
```

### Scientific Notation for Near-Zero Values

The value `-4.37114e-08` is essentially 0 but represents floating-point precision from Godot's internal calculations. When generating, use `0` or match this pattern for consistency.

### Computing Rotation from Yaw Angle

For spawn points facing a specific direction:

```typescript
function createRotationFromYaw(yawDegrees: number): RotationMatrix {
    const yawRad = (yawDegrees * Math.PI) / 180;
    const cos = Math.cos(yawRad);
    const sin = Math.sin(yawRad);

    return {
        right: { x: cos, y: 0, z: -sin },
        up: { x: 0, y: 1, z: 0 },
        front: { x: sin, y: 0, z: cos }
    };
}
```

---

## 5. Asset Analysis: FiringRange_Floor_A

### Dimensions (derived from construct.json)

By analyzing consecutive floor tile positions:

| Tiles | Position 1 | Position 2 | Difference |
|-------|------------|------------|------------|
| A1→A2 | x: -76.492 | x: -72.955 | **3.537** (X spacing) |
| A1→A3 | z: -20.383 | z: -25.3931 | **5.0101** (Z spacing) |

### Standard Configuration

- **Tile spacing X**: 3.537 units
- **Tile spacing Z**: 5.0101 units
- **Elevation**: Y = 90
- **Rotation**: 90-degree Y rotation

### Grid Calculation

For a 10x20 tile grid:
- **Width**: 10 tiles × 3.537 = ~35.37 units
- **Length**: 20 tiles × 5.0101 = ~100.2 units

### Other Available Floor Assets

From `asset_types.json`:
- `FiringRange_Floor_A`
- `FiringRange_Floor_B`
- `FiringRange_Floor_01`
- `FiringRange_Floor_02`
- `BuildingBlockFloor_01`, `_02`, `_03`

---

## 6. ObjId System

### Purpose

`ObjId` is a numeric identifier that allows TypeScript code to reference spatial objects:

```typescript
const hq = mod.GetHQ(1);  // Gets HQ with ObjId=1
const capturePoint = mod.GetCapturePoint(200);  // Gets capture point with ObjId=200
```

### Standard Conventions (from SDK examples)

| ObjId Range | Purpose |
|-------------|---------|
| 1-2 | HQ Spawners (Team1=1, Team2=2) |
| 10-99 | AI paths, waypoints, utility objects |
| 100-199 | Sectors |
| 200-499 | Objectives (CapturePoints, MCOMs) |
| 500-599 | Sound objects |
| 600-699 | AreaTriggers |
| 1100-1199 | Team 1 Spawn Protection areas |
| 1200-1299 | Team 2 Spawn Protection areas |

### Objects That Use ObjId

| Object Type | Uses ObjId | Notes |
|-------------|------------|-------|
| HQ_PlayerSpawner | Yes | 1 for Team1, 2 for Team2 |
| CapturePoint | Yes | Starting at 200 |
| MCOM | Yes | Starting at 200 |
| Sector | Yes | Starting at 100 |
| AreaTrigger | Yes | Starting at 600 |
| SpawnPoint | No | Referenced by parent ID |
| PolygonVolume | No | Referenced by parent ID |
| DeployCam | No | Only one per map |
| VehicleSpawner | No | |

---

## 7. Reference Linking

### How Objects Reference Each Other

Objects reference other objects via string IDs:

```json
{
    "HQArea": "TEAM_1_HQ/HQ_Team1",
    "InfantrySpawns": [
        "TEAM_1_HQ/SpawnPoint_1_1",
        "TEAM_1_HQ/SpawnPoint_1_2"
    ],
    "linked": ["HQArea", "InfantrySpawns"]
}
```

### The `linked` Array

The `linked` property lists which properties contain cross-references:
- Helps the editor validate relationships
- Should include all properties that reference other object IDs

### Hierarchical ID Paths

IDs use forward slashes to create hierarchy:
- `TEAM_1_HQ` - top level
- `TEAM_1_HQ/HQ_Team1` - child of TEAM_1_HQ
- `TEAM_1_HQ/SpawnPoint_1_1` - another child

This organization mirrors Godot's scene tree structure.

---

## 8. Online Documentation Summary

### Official Resources

1. **Battlefield Portal Documentation** - https://docs.bfportal.gg/
   - Community-maintained, comprehensive API docs
   - Includes `mod.GetSpatialObject(objId)` reference

2. **EA Portal 101 Guide** - https://www.ea.com/games/battlefield/battlefield-6/news/portal-101-advanced-creations
   - Official introduction to Portal SDK Tool

3. **EA Help: How to Use Portal** - https://help.ea.com/en/articles/battlefield/battlefield-6/how-to-use-battlefield-portal/
   - Basic Portal usage guide

### Key Technical Insights from Online Research

1. **Spatial Editing is Additive**
   - Cannot remove terrain or key buildings
   - Can only add/modify objects
   - "Static" layer is non-editable

2. **Standard Workflow**
   - Edit in Godot → Export → Upload to Portal Web Builder
   - Manual JSON editing not officially recommended

3. **Community Tools**
   - ObjId Manager for Portal SDK
   - BF6 Portal Tool (GitHub)
   - BFPortalUnleashed (pseudo-JavaScript)
   - Battlefield 6 Portal MCP Server (includes gdconverter)

### GitHub Repositories

- https://github.com/battlefield-portal-community/PortalSDK
- https://github.com/florentpoujol/battlefield6_portal_tutorials
- https://github.com/NodotProject/Unofficial-BF6-Portal-SDK-Docs
- https://github.com/battlefield-portal-community/awesome

---

## 9. Feasibility Assessment

### What AI CAN Generate

| Capability | Feasibility | Notes |
|------------|-------------|-------|
| Floor tile grids | High | Predictable spacing, simple structure |
| Spawn points | High | Position + rotation, straightforward |
| HQ spawners | High | Template-based, links to spawn points |
| Combat area boundaries | High | Rectangle polygon generation |
| Basic sectors | High | Links to existing polygons |
| DeployCam | High | Single object, simple structure |

### What AI CANNOT Do (Without Human Validation)

1. **Validate gameplay balance** - spawn distances, fairness
2. **Ensure navigation works** - players can actually walk on surfaces
3. **Test in-game rendering** - assets may clip or have visual issues
4. **Complex geometry** - buildings, multi-level structures
5. **Map-specific constraints** - some assets only work on certain maps

### Recommended Approach

**Hybrid workflow:**
1. AI generates spatial JSON for simple structures
2. Human validates in Godot editor
3. Human tests in-game
4. Iterate based on feedback

### Minimum Viable Platform

For a simple testing platform, we need:

```
Objects required: ~10-15
├── 1x Sector
├── 1x CombatArea
├── 1x PolygonVolume (combat boundary)
├── 2x HQ_PlayerSpawner (Team1, Team2)
├── 2x PolygonVolume (HQ areas)
├── 6x SpawnPoint (3 per team)
├── 1x DeployCam
└── Nx FiringRange_Floor_A (grid)
```

---

## Appendix A: Complete construct.json Analysis

### File Statistics
- **Total objects**: ~100+ (large due to floor tile grid)
- **Floor tiles**: 50+ FiringRange_Floor_A instances
- **Elevation**: Y = 90 for floor, Y = 121 for combat polygon

### Object Hierarchy
```
Portal_Dynamic/
├── Sector (manages objectives)
├── CombatArea → CollisionPolygon3D
├── TEAM_1_HQ → HQ_Team1 (PolygonVolume) + SpawnPoint_1_1
├── TEAM_2_HQ → HQ_Team2 (PolygonVolume) + SpawnPoint_2_1
├── DeployCam
├── CapturePointA-E (5 capture points with spawn points)
├── AI_WaypointPath
└── Node3D/Floor/ (all floor tiles)
```

---

## Appendix B: Complete battleman.json Analysis

### Key Differences from construct.json
- Uses `FiringRange_Wall_1024_01` for walls
- Uses `FiringRange_WallPanelContact_01` for wall panels
- Smaller combat area focused on arena
- No capture points (custom game mode)

### Wall Asset Pattern
```json
{
    "name": "FiringRange_Wall_1024_02",
    "type": "FiringRange_Wall_1024_01",
    "id": "Battleman/Arena/Walls/FiringRange_Wall_1024_02",
    "position": { "x": -56.1867, "y": 90, "z": -2.25292 }
}
```

**Note**: `name` can differ from `type` for organization purposes.

---

## Appendix C: Asset Types for Level Building

### Floor Assets
- `FiringRange_Floor_A` (primary, well-tested)
- `FiringRange_Floor_B`
- `BuildingBlockFloor_01`, `_02`, `_03`
- `CableFloor_01`, `_02`, `_03`

### Wall Assets
- `FiringRange_Wall_1024_01` (large wall)
- `FiringRange_WallPanelContact_01`
- `BarrierConcreteWall_01_192x320`
- `BarrierHesco_01_128x240`

### Barrier Assets
- `BarrierStoneBlock_01_A` through `_H`
- `BarrierJersey_01_256x124`
- `CinderblockStack_01_A_120`, `_180`, `_60`

### Structural Assets
- `ConstructionSetPillar01_A_128x512x128`
- `FoundationStairs_01_256x128_B`
- `ConcreteRamp_01`

See `FbExportData/asset_types.json` for complete catalog of 8,750 assets.
