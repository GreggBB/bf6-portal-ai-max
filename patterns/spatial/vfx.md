# Pattern: VFX Lifecycle Management

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: mods/AcePursuit/AcePursuit.ts:1142-1148, mods/BombSquad/BombSquad.ts:721-723, mods/BumperCars/BumperCars.ts:1034-1057, mods/Exfil/Exfil.ts:2358-2387

---

## Overview

VFX (Visual Effects) in Portal include explosions, fire, smoke, sparks, and environmental effects. They can be:
1. **Pre-placed in Godot** - Retrieved by index
2. **Spawned at runtime** - Created dynamically with `SpawnObject`

VFX require explicit enabling after spawning and proper cleanup when done.

---

## Core API

### Getting VFX

```typescript
// Get a pre-placed VFX by index (placed in Godot)
const vfx = mod.GetVFX(vfxNumber: number): mod.VFX;
```

### Spawning VFX

```typescript
// Spawn VFX at runtime (returns generic object, needs EnableVFX)
const vfxObj = mod.SpawnObject(
    mod.RuntimeSpawn_Common.FX_*,  // VFX prefab
    position: mod.Vector,
    rotation: mod.Vector,
    scale?: mod.Vector
): mod.Any;
```

### Controlling VFX

```typescript
// Enable/disable VFX
mod.EnableVFX(vfx: mod.VFX, enable: boolean): void;

// Move VFX to new position
mod.MoveVFX(vfxID: mod.VFX, position: mod.Vector, rotation: mod.Vector): void;

// Remove spawned VFX
mod.UnspawnObject(obj: mod.Object): void;
```

---

## Working Code Examples

### Basic VFX Spawning
> Source: mods/AcePursuit/AcePursuit.ts:1142-1148

```typescript
async function SpawnVFXAtPosition(targetpoint: mod.Vector, vfx: any) {
    // Spawn the VFX object
    const flareVFX = mod.SpawnObject(
        vfx,
        targetpoint,
        mod.CreateVector(0, 0, 0),
        mod.CreateVector(1, 1, 1)
    );

    // VFX must be explicitly enabled to play
    mod.EnableVFX(flareVFX, true);
}

// Usage
SpawnVFXAtPosition(
    mod.CreateVector(100, 50, 200),
    mod.RuntimeSpawn_Common.FX_Sparks
);
```

### Explosion Feedback
> Source: mods/BombSquad/BombSquad.ts:721-723

```typescript
function ExplodeFeedback(pos: mod.Vector): void {
    let vfx: mod.VFX = mod.SpawnObject(
        mod.RuntimeSpawn_Common.FX_ArtilleryStrike_Explosion_GS,
        pos,
        mod.CreateVector(0, 0, 0)  // ZEROVEC
    );
    mod.EnableVFX(vfx, true);
}
```

### VFX with Cleanup Pattern
> Source: mods/BumperCars/BumperCars.ts:1034-1057

```typescript
async function SmokeRingEffect(centerPoint: mod.Vector, radius: number, smokeCount: number) {
    const spawnedSmokeVFX: mod.VFX[] = [];
    const offset = mod.CreateVector(0, -1.25, 0);

    // Spawn smoke around a circle
    for (let i = 0; i < smokeCount; i++) {
        const angle = (i / smokeCount) * Math.PI * 2;
        const x = mod.XComponentOf(centerPoint) + Math.cos(angle) * radius;
        const z = mod.ZComponentOf(centerPoint) + Math.sin(angle) * radius;
        const y = mod.YComponentOf(centerPoint) + mod.YComponentOf(offset);

        const position = mod.CreateVector(x, y, z);
        const vfx = mod.SpawnObject(
            mod.RuntimeSpawn_Common.FX_BASE_Smoke_Pillar_Black_L,
            position,
            mod.CreateVector(0, 0, 0)
        );
        mod.EnableVFX(vfx, true);
        spawnedSmokeVFX.push(vfx);
    }

    // Let VFX play
    await mod.Wait(8);

    // Disable VFX
    for (const vfx of spawnedSmokeVFX) {
        mod.EnableVFX(vfx, false);
    }

    await mod.Wait(5);

    // Clean up - unspawn objects
    for (const vfx of spawnedSmokeVFX) {
        mod.UnspawnObject(vfx);
    }
}
```

### Helper Class for VFX Spawning
> Source: mods/Exfil/Exfil.ts:2358-2387

```typescript
class VFXHelper {
    // Full signature with rotation and scale
    static SpawnVFX(
        vfxId: any,
        position: mod.Vector,
        rotation: mod.Vector,
        scale: mod.Vector
    ): mod.VFX | null {
        try {
            const vfxObject = mod.SpawnObject(vfxId, position, rotation, scale);
            mod.EnableVFX(vfxObject, true);
            const vfxInstance = mod.GetVFX(mod.GetObjId(vfxObject));
            return vfxInstance;
        } catch (error) {
            console.log(`Error spawning VFX: ${error}`);
            return null;
        }
    }

    // Simple signature with defaults
    static SpawnVFXSimple(vfxType: any, position: mod.Vector): mod.VFX | null {
        return this.SpawnVFX(
            vfxType,
            position,
            mod.CreateVector(0, 0, 0),
            mod.CreateVector(1, 1, 1)
        );
    }
}

// Usage
const smoke = VFXHelper.SpawnVFXSimple(
    mod.RuntimeSpawn_Common.FX_BASE_Smoke_Dark_M,
    targetPosition
);
```

### Using Pre-placed VFX
> Source: mods/BumperCars/BumperCars.ts:1303-1306

```typescript
// Get VFX placed in Godot editor by index
const celebrationVfx1 = mod.GetVFX(1);
const celebrationVfx2 = mod.GetVFX(2);

// Enable them for victory celebration
mod.EnableVFX(celebrationVfx1, true);
mod.EnableVFX(celebrationVfx2, true);

// Later, disable them
mod.EnableVFX(celebrationVfx1, false);
mod.EnableVFX(celebrationVfx2, false);
```

### Moving VFX
> Source: mods/Exfil/Exfil.ts:823, 1078

```typescript
// Move a VFX to follow a target
function UpdateVFXPosition(vfx: mod.VFX, newPosition: mod.Vector) {
    mod.MoveVFX(
        vfx,
        newPosition,
        mod.CreateVector(0, 0, 0)  // Rotation
    );
}

// Track an objective with smoke marker
async function TrackObjectiveWithSmoke(vfx: mod.VFX, getPosition: () => mod.Vector) {
    while (true) {
        const currentPos = getPosition();
        mod.MoveVFX(vfx, currentPos, mod.CreateVector(0, 0, 0));
        await mod.Wait(0.5);
    }
}
```

---

## Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `GetVFX` | `(vfxNumber: number): VFX` | Get pre-placed VFX by index |
| `EnableVFX` | `(vfx: VFX, enable: boolean): void` | Start/stop VFX playback |
| `MoveVFX` | `(vfxID: VFX, position: Vector, rotation: Vector): void` | Reposition active VFX |
| `SpawnObject` | `(FX_*, position, rotation, scale?): Any` | Create VFX at runtime |
| `UnspawnObject` | `(obj: Object): void` | Remove spawned VFX |
| `GetObjId` | `(object: Any): number` | Get object ID for GetVFX |

---

## Available VFX (RuntimeSpawn_Common.FX_*)

### Explosions & Combat
```typescript
mod.RuntimeSpawn_Common.FX_ArtilleryStrike_Explosion_01
mod.RuntimeSpawn_Common.FX_ArtilleryStrike_Explosion_GS
mod.RuntimeSpawn_Common.FX_ArtilleryStrike_Explosion_GS_SP_Beach
mod.RuntimeSpawn_Common.FX_Airburst_Incendiary_Detonation
mod.RuntimeSpawn_Common.FX_Airburst_Incendiary_Detonation_Friendly
mod.RuntimeSpawn_Common.FX_Autocannon_30mm_AP_Hit_GS
mod.RuntimeSpawn_Common.FX_Autocannon_30mm_AP_Hit_Metal_GS
mod.RuntimeSpawn_Common.FX_Bomb_Mk82_AIR_Detonation
mod.RuntimeSpawn_Common.FX_CarlGustaf_MK4_Impact
mod.RuntimeSpawn_Common.FX_Chaingun_30mm_HEDP_Hit
```

### Fire Effects
```typescript
mod.RuntimeSpawn_Common.FX_BASE_Fire_S           // Small fire
mod.RuntimeSpawn_Common.FX_BASE_Fire_M           // Medium fire
mod.RuntimeSpawn_Common.FX_BASE_Fire_L           // Large fire
mod.RuntimeSpawn_Common.FX_BASE_Fire_XL          // Extra large fire
mod.RuntimeSpawn_Common.FX_BASE_Fire_S_NoSmoke   // Small, no smoke
mod.RuntimeSpawn_Common.FX_BASE_Fire_M_NoSmoke   // Medium, no smoke
mod.RuntimeSpawn_Common.FX_BASE_Fire_Oil_Medium  // Oil fire
mod.RuntimeSpawn_Common.FX_Car_Fire_M_GS         // Car fire
mod.RuntimeSpawn_Common.FX_CivCar_Tire_fire_S_GS // Tire fire
```

### Smoke Effects
```typescript
mod.RuntimeSpawn_Common.FX_BASE_Smoke_Dark_M
mod.RuntimeSpawn_Common.FX_BASE_Smoke_Column_XXL
mod.RuntimeSpawn_Common.FX_BASE_Smoke_Pillar_Black_L
mod.RuntimeSpawn_Common.FX_BASE_Smoke_Pillar_Black_L_Dist
mod.RuntimeSpawn_Common.FX_BASE_Smoke_Pillar_White_L
mod.RuntimeSpawn_Common.FX_BASE_Smoke_Soft_S_GS
mod.RuntimeSpawn_Common.FX_Smoke_Marker_Custom
```

### Environmental & Ambient
```typescript
mod.RuntimeSpawn_Common.FX_BASE_Dust_Large_Area
mod.RuntimeSpawn_Common.FX_BASE_Birds_Black_Circulating
mod.RuntimeSpawn_Common.FX_BASE_Seagull_Flock
mod.RuntimeSpawn_Common.FX_BASE_Flies_Small
mod.RuntimeSpawn_Common.FX_BASE_DeployClouds_Var_A
mod.RuntimeSpawn_Common.FX_BASE_DeployClouds_Var_B
mod.RuntimeSpawn_Common.FX_AmbWar_UAV_Circling
mod.RuntimeSpawn_Common.fx_ambwar_artillarystrike
```

### Sparks & Effects
```typescript
mod.RuntimeSpawn_Common.FX_Sparks
mod.RuntimeSpawn_Common.FX_BASE_Sparks_Pulse_L
mod.RuntimeSpawn_Common.FX_Defib_Shock_Heal_Full
mod.RuntimeSpawn_Common.FX_Defib_Shock_Heal_Half
mod.RuntimeSpawn_Common.FX_Decoy_Destruction
```

### Vehicle Effects
```typescript
mod.RuntimeSpawn_Common.FX_Airplane_Jetwash_Dirt
mod.RuntimeSpawn_Common.FX_Airplane_Jetwash_Grass
mod.RuntimeSpawn_Common.FX_Airplane_Jetwash_Sand
mod.RuntimeSpawn_Common.FX_Airplane_Jetwash_Snow
mod.RuntimeSpawn_Common.FX_Airplane_Jetwash_Water
mod.RuntimeSpawn_Common.FX_Blackhawk_Rotor_HaloGlow
mod.RuntimeSpawn_Common.FX_Blackhawk_Rotor_Vortex_Vapor
mod.RuntimeSpawn_Common.FX_Vehicle_Wreck_PTV
mod.RuntimeSpawn_Common.FX_Vehicle_Wreck_PTV_Calm
mod.RuntimeSpawn_Common.FX_CivCar_SUV_Explosion
```

### Distant/Backdrop Effects
```typescript
mod.RuntimeSpawn_Common.FX_BD_Huge_Horizon_Exp
mod.RuntimeSpawn_Common.FX_BD_Med_Horizon_Exp
mod.RuntimeSpawn_Common.FX_BD_Med_Horizon_Exp_Multi
mod.RuntimeSpawn_Common.FX_AW_Distant_Cluster_Bomb_Line_Outskirts
mod.RuntimeSpawn_Common.FX_Carrier_Explosion_Dist
```

---

## VFX Lifecycle Best Practices

### 1. Always Enable After Spawning

```typescript
// VFX won't play until enabled!
const vfx = mod.SpawnObject(mod.RuntimeSpawn_Common.FX_BASE_Fire_M, pos, rot);
mod.EnableVFX(vfx, true);  // Required!
```

### 2. Disable Before Unspawning

```typescript
// Clean disable before removal prevents visual glitches
mod.EnableVFX(vfx, false);
await mod.Wait(0.5);  // Brief delay for fade
mod.UnspawnObject(vfx);
```

### 3. Track Spawned VFX for Cleanup

```typescript
class VFXManager {
    private static activeVFX: mod.VFX[] = [];

    static Spawn(type: any, position: mod.Vector): mod.VFX {
        const vfx = mod.SpawnObject(type, position, mod.CreateVector(0,0,0));
        mod.EnableVFX(vfx, true);
        this.activeVFX.push(vfx);
        return vfx;
    }

    static CleanupAll() {
        for (const vfx of this.activeVFX) {
            try {
                mod.EnableVFX(vfx, false);
            } catch {}
        }
        // Delay for visual fade
        setTimeout(() => {
            for (const vfx of this.activeVFX) {
                try {
                    mod.UnspawnObject(vfx);
                } catch {}
            }
            this.activeVFX = [];
        }, 500);
    }
}
```

---

## Constraints & Gotchas

1. **Must Enable After Spawn**: Spawned VFX don't auto-play. Always call `EnableVFX(vfx, true)`.

2. **VFX Limits**: Engine has limits on concurrent VFX. Clean up unused effects.

3. **GetVFX vs SpawnObject**: Pre-placed VFX use `GetVFX(index)`. Runtime-spawned VFX use `GetVFX(GetObjId(spawnedObject))`.

4. **Looping vs One-Shot**: Some VFX loop continuously (fire, smoke), others play once (explosions). Looping VFX need explicit disable.

5. **Performance**: Many simultaneous VFX impact performance. Use sparingly in intense moments.

6. **Map-Specific VFX**: Like other RuntimeSpawn items, some VFX are map-specific (e.g., `RuntimeSpawn_Aftermath.FX_*`).

---

## Related Patterns

- [objects.md](objects.md) - General object spawning
- [math.md](math.md) - Position calculations for VFX placement
- [audio.md](../audio/audio.md) - Often pair VFX with SFX
