# Pattern: MCOM Objectives

> **SDK Version**: 1.1.3.0 (Battlefield 6)
> **Source**: mods/Custom Rush V2.0 (spatial analysis), code/mod/index.d.ts

---

## Overview

MCOMs (M-COM Stations) are destroyable objectives used in Rush and similar game modes. The attacking team must arm and destroy MCOMs while defenders try to defuse them.

**Lifecycle**: Inactive → Armed → (Defused | Destroyed)

Each MCOM:
- Can be armed by attackers (starts fuse timer)
- Can be defused by defenders (stops fuse timer)
- Detonates when fuse timer expires
- Triggers events at each state change

---

## Spatial Structure

MCOMs are placed within Sectors in Godot:

```
Sector1 (ObjId: 101)
├── MCOM (ObjId: 201)
│   └── position, rotation
└── MCOM2 (ObjId: 202)
    └── position, rotation
```

### ObjId Convention

| Sector | MCOM A | MCOM B |
|--------|--------|--------|
| 1 | 201 | 202 |
| 2 | 203 | 204 |
| 3 | 205 | 206 |
| 4 | 207 | 208 |

Formula: `200 + (sectorNum * 2) - 1` for first MCOM, `200 + (sectorNum * 2)` for second.

---

## SDK Types & Functions

### Type

```typescript
type MCOM = { _opaque: typeof MCOMSymbol };
```

### Core Functions

```typescript
// Get MCOM by ObjId
mod.GetMCOM(number: number): MCOM;

// Set the fuse time (seconds from armed to detonation)
mod.SetMCOMFuseTime(mCOM: MCOM, fuseTime: number): void;

// Enable or disable MCOM interaction
mod.EnableGameModeObjective(objective: MCOM, enable: boolean): void;
```

### Events

```typescript
// Fires when attacker arms the MCOM
export function OnMCOMArmed(eventMCOM: mod.MCOM): void;

// Fires when defender defuses the MCOM
export function OnMCOMDefused(eventMCOM: mod.MCOM): void;

// Fires when MCOM detonates (destroyed)
export function OnMCOMDestroyed(eventMCOM: mod.MCOM): void;

// Iterator for all MCOMs
export function OngoingMCOM(eventMCOM: mod.MCOM): void;
```

---

## Implementation Pattern

### State Management

```typescript
class MCOMState {
    // MCOMs per sector: mcoms[sectorIndex][0-1]
    static mcoms: mod.MCOM[][] = [];

    // Track remaining MCOMs in current sector
    static mcomsRemaining: number = 2;

    // Track which MCOM is currently armed (if any)
    static armedMCOM: mod.MCOM | null = null;

    // Default fuse time in seconds
    static readonly FUSE_TIME: number = 30;
}
```

### Initialization

```typescript
export async function OnGameModeStarted() {
    // Load all MCOMs organized by sector
    for (let sector = 1; sector <= 4; sector++) {
        const sectorMcoms: mod.MCOM[] = [];

        // Two MCOMs per sector
        const mcomA = mod.GetMCOM(200 + (sector * 2) - 1);
        const mcomB = mod.GetMCOM(200 + (sector * 2));

        // Set fuse time
        mod.SetMCOMFuseTime(mcomA, MCOMState.FUSE_TIME);
        mod.SetMCOMFuseTime(mcomB, MCOMState.FUSE_TIME);

        // Disable initially (will enable per-sector)
        mod.EnableGameModeObjective(mcomA, false);
        mod.EnableGameModeObjective(mcomB, false);

        sectorMcoms.push(mcomA, mcomB);
        MCOMState.mcoms.push(sectorMcoms);
    }

    // Enable first sector's MCOMs
    EnableSectorMCOMs(1);
}

function EnableSectorMCOMs(sectorNum: number) {
    const idx = sectorNum - 1;
    MCOMState.mcoms[idx].forEach(mcom => {
        mod.EnableGameModeObjective(mcom, true);
    });
    MCOMState.mcomsRemaining = 2;
}
```

### Event Handlers

```typescript
export function OnMCOMArmed(eventMCOM: mod.MCOM) {
    MCOMState.armedMCOM = eventMCOM;

    // Play armed sound
    mod.PlaySound2D(mod.SFXList.SFX_GameModes_Rush_Armed_OneShot3D);

    // Notify teams
    mod.DisplayNotificationMessage(
        mod.Message("MCOM_ARMED"),
        mod.GetTeam(1)  // Attackers
    );
    mod.DisplayNotificationMessage(
        mod.Message("MCOM_ARMED_DEFEND"),
        mod.GetTeam(2)  // Defenders
    );

    // VO announcements
    mod.PlayVOAnnouncement(mod.VOAnnouncement.MComArmEnemy, mod.GetTeam(2));
    mod.PlayVOAnnouncement(mod.VOAnnouncement.MComArmFriendly, mod.GetTeam(1));

    console.log("MCOM armed!");
}

export function OnMCOMDefused(eventMCOM: mod.MCOM) {
    MCOMState.armedMCOM = null;

    // Play defused sound
    mod.PlaySound2D(mod.SFXList.SFX_GameModes_Rush_Defused_OneShot3D);

    // VO announcements
    mod.PlayVOAnnouncement(mod.VOAnnouncement.MComDefuseEnemy, mod.GetTeam(1));
    mod.PlayVOAnnouncement(mod.VOAnnouncement.MComDefuseFriendly, mod.GetTeam(2));

    console.log("MCOM defused!");
}

export function OnMCOMDestroyed(eventMCOM: mod.MCOM) {
    MCOMState.armedMCOM = null;
    MCOMState.mcomsRemaining--;

    // Play destruction sound
    mod.PlaySound2D(mod.SFXList.SFX_UI_Gauntlet_Wreckage_MCOMDestroyed_OneShot2D);

    // VO announcements
    if (MCOMState.mcomsRemaining === 1) {
        mod.PlayVOAnnouncement(mod.VOAnnouncement.MComDestroyedOneLeftEnemy, mod.GetTeam(2));
        mod.PlayVOAnnouncement(mod.VOAnnouncement.MComDestroyedOneLeftFriendly, mod.GetTeam(1));
    } else {
        mod.PlayVOAnnouncement(mod.VOAnnouncement.MComDestroyedEnemy, mod.GetTeam(2));
        mod.PlayVOAnnouncement(mod.VOAnnouncement.MComDestroyedFriendly, mod.GetTeam(1));
    }

    console.log(`MCOM destroyed! ${MCOMState.mcomsRemaining} remaining`);

    // Check if sector is cleared
    if (MCOMState.mcomsRemaining <= 0) {
        OnSectorCleared();
    }
}

function OnSectorCleared() {
    // Advance to next sector (see sectors.md pattern)
    AdvanceToNextSector();
}
```

---

## Audio Assets

### Sound Effects

```typescript
// Alarm sounds (looping)
mod.SFXList.SFX_GameModes_Rush_Alarm_SimpleLoop3D
mod.SFXList.SFX_GameModes_Rush_Alarm_Leadout_SimpleLoop3D

// Arming/Defusing (looping while in progress)
mod.SFXList.SFX_GameModes_Rush_Arm_SimpleLoop3D
mod.SFXList.SFX_GameModes_Rush_Defusing_SimpleLoop3D

// One-shot events
mod.SFXList.SFX_GameModes_Rush_Armed_OneShot3D
mod.SFXList.SFX_GameModes_Rush_Defused_OneShot3D

// Telemetry beep (looping while armed)
mod.SFXList.SFX_GameModes_Rush_Telemetry_SimpleLoop3D

// Destruction
mod.SFXList.SFX_UI_Gauntlet_Wreckage_MCOMDestroyed_OneShot2D
```

### Voice-Over Announcements

```typescript
// Armed
mod.VOAnnouncement.MComArmEnemy        // "Enemy has armed the objective"
mod.VOAnnouncement.MComArmFriendly     // "We've armed the objective"

// Defused
mod.VOAnnouncement.MComDefuseEnemy     // "Enemy defused the objective"
mod.VOAnnouncement.MComDefuseFriendly  // "Objective defused"

// Destroyed
mod.VOAnnouncement.MComDestroyedEnemy           // "Enemy destroyed objective"
mod.VOAnnouncement.MComDestroyedFriendly        // "Objective destroyed"
mod.VOAnnouncement.MComDestroyedOneLeftEnemy    // "One objective remaining"
mod.VOAnnouncement.MComDestroyedOneLeftFriendly // "One more to go"
```

---

## Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `GetMCOM` | `(number): MCOM` | Get MCOM by ObjId |
| `SetMCOMFuseTime` | `(mCOM, fuseTime): void` | Set seconds from armed to detonation |
| `EnableGameModeObjective` | `(MCOM, enable): void` | Enable/disable MCOM interaction |
| `PlaySound2D` | `(sfx): void` | Play 2D sound effect |
| `PlayVOAnnouncement` | `(announcement, team): void` | Play team-specific VO |

---

## Constraints & Gotchas

1. **No EventPlayer on arm/defuse**: The game does not provide the player who armed/defused in the event callback. This is a known limitation noted in the Custom Rush README: *"Armed/Disarmed score not tracking. This is down to the game not tracking EventPlayer on MCOM Armed/Defused."*

2. **Fuse time must be set**: Call `SetMCOMFuseTime()` before the MCOM can be used, or it may use a default value.

3. **Enable before interaction**: MCOMs must be enabled with `EnableGameModeObjective()` before players can interact.

4. **Object equality**: Use `mod.GetObjId()` to compare MCOMs:
   ```typescript
   if (mod.GetObjId(eventMCOM) === mod.GetObjId(targetMCOM)) { ... }
   ```

5. **Destroyed is permanent**: Once destroyed, an MCOM cannot be reset. Plan for sector progression.

6. **Two MCOMs per sector**: The standard Rush format uses 2 MCOMs per sector. Both must be destroyed to advance.

---

## Complete Example: Rush MCOM Handler

```typescript
class RushMCOMHandler {
    static mcoms: Map<number, mod.MCOM[]> = new Map();
    static mcomsRemaining: number = 2;
    static currentSector: number = 1;

    static readonly FUSE_TIME = 30;  // seconds

    static Initialize() {
        // Load MCOMs for 4 sectors
        for (let sector = 1; sector <= 4; sector++) {
            const mcomA = mod.GetMCOM(200 + (sector * 2) - 1);
            const mcomB = mod.GetMCOM(200 + (sector * 2));

            mod.SetMCOMFuseTime(mcomA, this.FUSE_TIME);
            mod.SetMCOMFuseTime(mcomB, this.FUSE_TIME);

            mod.EnableGameModeObjective(mcomA, false);
            mod.EnableGameModeObjective(mcomB, false);

            this.mcoms.set(sector, [mcomA, mcomB]);
        }
    }

    static ActivateSector(sectorNum: number) {
        // Disable previous sector's MCOMs (if any remain)
        if (this.mcoms.has(this.currentSector)) {
            this.mcoms.get(this.currentSector)!.forEach(mcom => {
                mod.EnableGameModeObjective(mcom, false);
            });
        }

        // Enable new sector's MCOMs
        this.currentSector = sectorNum;
        this.mcomsRemaining = 2;

        if (this.mcoms.has(sectorNum)) {
            this.mcoms.get(sectorNum)!.forEach(mcom => {
                mod.EnableGameModeObjective(mcom, true);
            });
        }
    }

    static OnDestroyed() {
        this.mcomsRemaining--;

        if (this.mcomsRemaining <= 0) {
            return true;  // Sector cleared
        }
        return false;
    }
}
```

---

## Related Patterns

- [Sectors](sectors.md) - Sector progression containing MCOMs
- [Scoring](scoring.md) - Ticket drain on attacker deaths
- [Audio](../audio/audio.md) - Playing SFX and VO
