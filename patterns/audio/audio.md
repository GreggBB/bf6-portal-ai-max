# Pattern: Audio (Music, Sound Effects, Voice-Over)

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: mods/AcePursuit/AcePursuit.ts, mods/CustomConquest (Portal Blocks), mods/Custom Breakthrough V1.1 (Portal Blocks), code/mod/index.d.ts

---

## Overview

The Portal SDK provides three audio systems:
1. **Music** - Ambient/event music packages
2. **Sound Effects (SFX)** - One-shot or looping sounds
3. **Voice-Over (VO)** - Announcer callouts with objective flags

---

## Music System

### Loading Music Packages

Before playing music, you must load the appropriate package:

```typescript
// Load the Battle Royale music package
mod.LoadMusic(mod.MusicPackages.BR);

// Load the Core (standard multiplayer) music package
mod.LoadMusic(mod.MusicPackages.Core);
```

### Available Music Packages

```typescript
export enum MusicPackages {
    BR,       // Battle Royale music
    Core,     // Standard multiplayer music
    Gauntlet, // Gauntlet/Operations music
}
```

### Playing Music Events

```typescript
// Play music for everyone
mod.PlayMusic(mod.MusicEvents.BR_InsertionJump);

// Play music for a specific team
mod.PlayMusic(mod.MusicEvents.BR_InsertionLanding, team);

// Play music for a specific squad
mod.PlayMusic(mod.MusicEvents.BR_InsertionCinematic_Loop, squad);

// Play music for a specific player
mod.PlayMusic(mod.MusicEvents.BR_InsertionLanding, player);
```

### Music Events (Selection)

```typescript
export enum MusicEvents {
    // Battle Royale
    BR_InsertionCinematic_Dropzone_Loop,
    BR_InsertionCinematic_Loop,
    BR_InsertionJump,
    BR_InsertionLanding,
    BR_PostLanding,
    BR_RingSteps,
    BR_TopTwo,
    BR_Won,
    BR_Lost,

    // Core Multiplayer
    Core_EOR_Defeat,
    Core_EOR_Draw,
    Core_EOR_Victory,
    Core_LateGame_Losing,
    Core_LateGame_Winning,
    Core_NearEnd_Losing,
    Core_NearEnd_Winning,

    // Gauntlet/Operations
    Gauntlet_LostOperation_Loop,
    Gauntlet_WonOperation_Loop,

    // Overtime
    Core_Overtime_Loop,
}
```

### Unloading Music

```typescript
mod.UnloadMusic(mod.MusicPackages.BR);
```

### Working Example: Race Start Music

From `mods/AcePursuit/AcePursuit.ts:732-244`:

```typescript
export async function OnGameModeStarted() {
    // Load BR music package for race events
    mod.LoadMusic(mod.MusicPackages.BR);

    // ... setup code ...

    // Play cinematic music during countdown
    mod.PlayMusic(mod.MusicEvents.BR_InsertionCinematic_Dropzone_Loop);

    await mod.Wait(3);

    // Play jump music when race starts
    mod.PlayMusic(mod.MusicEvents.BR_InsertionJump);
}
```

---

## Sound Effects (SFX)

### Playing Sounds

Sounds can be played globally, to specific targets, or at world positions:

```typescript
// Play sound to everyone (amplitude 1.0 = full volume)
mod.PlaySound(mod.RuntimeSpawn_Common.SFX_UI_EOR_RoundOutcome_OneShot2D, 1.0);

// Play sound to a team
mod.PlaySound(mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_CaptureObjectives_CaptureLeadinFriendly_OneShot2D, 1.0, team);

// Play sound to a player
mod.PlaySound(mod.RuntimeSpawn_Common.SFX_UI_Deploy_Screen_ActionSuccess_OneShot2D, 1.0, player);

// Play sound at a world position with attenuation
mod.PlaySound(
    mod.RuntimeSpawn_Common.SFX_Destruction_Buildings_HouseCollapse_OneShot3D,
    1.0,
    position,      // mod.Vector
    100            // attenuation range in meters
);

// Play sound by ObjId (for custom sounds placed in Godot)
mod.PlaySound(999, 1.0); // 999 = custom sound ObjId
```

### Capture Point Related SFX

```typescript
// Use these for conquest-style capture feedback
mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_CaptureObjectives_CaptureLeadinFriendly_OneShot2D
mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_CaptureObjectives_CaptureLeadinEnemy_OneShot2D
mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_CaptureObjectives_CaptureLeadinNeutral_OneShot2D
mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_CaptureObjectives_CaptureNeutralize_OneShot2D
mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_CaptureObjectives_CapturingTick_IsFriendly_SimpleLoop2D
mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_CaptureObjectives_CapturingTick_IsEnemy_SimpleLoop2D
```

### UI/Game Event SFX

```typescript
// End of round
mod.RuntimeSpawn_Common.SFX_UI_EOR_RoundOutcome_OneShot2D
mod.RuntimeSpawn_Common.SFX_UI_EOR_XP_OneShot2D
mod.RuntimeSpawn_Common.SFX_UI_EOR_RankUp_Normal_OneShot2D
mod.RuntimeSpawn_Common.SFX_UI_EOR_Counting_SimpleLoop2D

// Deploy screen
mod.RuntimeSpawn_Common.SFX_UI_Deploy_Screen_ActionSuccess_OneShot2D
mod.RuntimeSpawn_Common.SFX_UI_Deploy_Screen_VehicleAvailable_OneShot2D

// Alarm
mod.RuntimeSpawn_Common.SFX_Alarm
```

### Sector/Breakthrough Mode SFX

From Custom Breakthrough V1.1:

```typescript
// Voice-over module
mod.RuntimeSpawn_Common.SFX_VOModule_OneShot2D

// Capture tick sounds (for ongoing capture feedback)
mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_CaptureObjectives_CapturingTickFriendly_OneShot2D
mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_CaptureObjectives_CapturingTickEnemy_OneShot2D

// Capture complete
mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_CaptureObjectives_OnCapturedByFriendly_OneShot2D

// Out of bounds warning
mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_OutOfBounds_Countdown_OneShot2D

// Sector/area unlock
mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_CaptureObjectives_AreaUnlock_OneShot2D

// Countdown/intro sounds
mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_Intro_Countdown_Final_OneShot2D
mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_Intro_FinalImpact_OneShot2D

// Gauntlet beacons (calibration tick)
mod.RuntimeSpawn_Common.SFX_UI_Gauntlet_Beacons_CalibrationTick_OneShot2D
```

---

## Voice-Over (VO)

### Playing Voice-Overs

Voice-overs use 2D events (non-positional) with optional objective flags:

```typescript
// Play VO to everyone
mod.PlayVO(
    mod.RuntimeSpawn_Common.VO,  // or a custom VO ObjId
    mod.VoiceOverEvents2D.ObjectiveCaptured,
    mod.VoiceOverFlags.Alpha     // "Alpha captured!"
);

// Play VO to a specific team
mod.PlayVO(
    mod.RuntimeSpawn_Common.VO,
    mod.VoiceOverEvents2D.ObjectiveCapturedEnemy,
    mod.VoiceOverFlags.Bravo,
    enemyTeam
);

// Play VO to a specific player
mod.PlayVO(
    mod.RuntimeSpawn_Common.VO,
    mod.VoiceOverEvents2D.TimeLow,
    mod.VoiceOverFlags.Alpha,    // Flag not used for time VOs
    player
);
```

### Voice-Over Flags (Objective Names)

```typescript
export enum VoiceOverFlags {
    Alpha,    // A
    Bravo,    // B
    Charlie,  // C
    Delta,    // D
    Echo,     // E
    Foxtrot,  // F
    Golf,     // G
}
```

### Voice-Over Events (Selection)

```typescript
export enum VoiceOverEvents2D {
    // Objectives
    ObjectiveCaptured,           // "We captured [Flag]!"
    ObjectiveCapturedEnemy,      // "Enemy captured [Flag]!"
    ObjectiveCapturedGeneric,    // Generic capture announcement
    ObjectiveCapturing,          // "[Flag] is being captured!"
    ObjectiveContested,          // "Objective contested!"
    ObjectiveLost,               // "We lost [Flag]!"
    ObjectiveNeutralised,        // "[Flag] neutralized"

    // Territory (Breakthrough/Sector)
    ObjectiveTerritoryLost,
    ObjectiveTerritoryTaken,

    // Progress/Ticket Status
    ProgressEarlyLosing,
    ProgressEarlyWinning,
    ProgressMidLosing,
    ProgressMidWinning,
    ProgressLateLosing,
    ProgressLateWinning,

    // Time Warnings
    Time120Left,                 // "2 minutes remaining!"
    Time60Left,                  // "1 minute remaining!"
    Time30Left,                  // "30 seconds!"
    TimeLow,                     // General low time warning
    TimeOvertime,                // "Overtime!"

    // Player Count
    PlayerCountEnemyLow,
    PlayerCountFriendlyLow,

    // Round Events
    RoundStartGeneric,
    RoundLastRound,
    RoundSwitchSides,
    RoundSuddenDeath,

    // End of Match
    GlobalEOMVictory,            // "Victory!"
    GlobalEOMDefeat,             // "Defeat!"

    // Spawn/Deploy
    FirstSpawn,
    FirstSpawnDefender,
    GlobalAircraftAvailable,

    // MCOM (Rush mode)
    MComArmFriendly,
    MComArmEnemy,
    MComDefuseFriendly,
    MComDefuseEnemy,
    MComDestroyedFriendly,
    MComDestroyedEnemy,

    // Vehicles
    VehicleArmoredSpawn,
    VehicleTankSpawn,
}
```

---

## CustomConquest VO Integration

The CustomConquest mod uses these VO patterns:

### On Capture Events
```typescript
export function OnCapturePointCaptured(eventCapturePoint: mod.CapturePoint): void {
    const pointIndex = mod.GetObjId(eventCapturePoint) - 200; // A=0, B=1, etc.
    const flag = GetVoiceOverFlag(pointIndex);
    const newOwner = mod.GetCurrentOwnerTeam(eventCapturePoint);

    // Announce to capturing team
    mod.PlayVO(
        mod.RuntimeSpawn_Common.VO,
        mod.VoiceOverEvents2D.ObjectiveCaptured,
        flag,
        newOwner
    );

    // Announce to losing team
    const enemyTeam = mod.GetTeam(mod.GetObjId(newOwner) === 1 ? 2 : 1);
    mod.PlayVO(
        mod.RuntimeSpawn_Common.VO,
        mod.VoiceOverEvents2D.ObjectiveCapturedEnemy,
        flag,
        enemyTeam
    );
}

function GetVoiceOverFlag(index: number): mod.VoiceOverFlags {
    switch (index) {
        case 0: return mod.VoiceOverFlags.Alpha;
        case 1: return mod.VoiceOverFlags.Bravo;
        case 2: return mod.VoiceOverFlags.Charlie;
        case 3: return mod.VoiceOverFlags.Delta;
        case 4: return mod.VoiceOverFlags.Echo;
        case 5: return mod.VoiceOverFlags.Foxtrot;
        case 6: return mod.VoiceOverFlags.Golf;
        default: return mod.VoiceOverFlags.Alpha;
    }
}
```

### Low Ticket/Time Warnings
```typescript
// Triggered when tickets fall below threshold
function CheckLowTickets(team: mod.Team, tickets: number): void {
    if (tickets <= 50 && !lowTicketWarningPlayed) {
        mod.PlayVO(
            mod.RuntimeSpawn_Common.VO,
            mod.VoiceOverEvents2D.ProgressLateLosing,
            mod.VoiceOverFlags.Alpha,
            team
        );
        lowTicketWarningPlayed = true;
    }
}

// Triggered when time is running low
function CheckLowTime(): void {
    const remaining = mod.GetMatchTimeRemaining();

    if (remaining <= 120 && remaining > 60) {
        mod.PlayVO(mod.RuntimeSpawn_Common.VO, mod.VoiceOverEvents2D.Time120Left, mod.VoiceOverFlags.Alpha);
    } else if (remaining <= 60 && remaining > 30) {
        mod.PlayVO(mod.RuntimeSpawn_Common.VO, mod.VoiceOverEvents2D.Time60Left, mod.VoiceOverFlags.Alpha);
    } else if (remaining <= 30) {
        mod.PlayVO(mod.RuntimeSpawn_Common.VO, mod.VoiceOverEvents2D.Time30Left, mod.VoiceOverFlags.Alpha);
    }
}
```

### Near-End Music Trigger
```typescript
function CheckNearEndMusic(losingTeamTickets: number): void {
    if (losingTeamTickets <= 100 && !nearEndMusicStarted) {
        mod.PlayMusic(mod.MusicEvents.Core_NearEnd_Losing, losingTeam);
        mod.PlayMusic(mod.MusicEvents.Core_NearEnd_Winning, winningTeam);
        nearEndMusicStarted = true;
    }
}
```

---

## Function Reference

### Music

| Function | Signature | Description |
|----------|-----------|-------------|
| `LoadMusic` | `(package: MusicPackages): void` | Load a music package |
| `PlayMusic` | `(event: MusicEvents): void` | Play music to everyone |
| `PlayMusic` | `(event: MusicEvents, target: Team\|Squad\|Player): void` | Play to target |
| `UnloadMusic` | `(package: MusicPackages): void` | Unload a music package |

### Sound Effects

| Function | Signature | Description |
|----------|-----------|-------------|
| `PlaySound` | `(sfx: SFX\|number, amplitude: number): void` | Play to everyone |
| `PlaySound` | `(sfx: SFX\|number, amplitude: number, target: Team\|Squad\|Player): void` | Play to target |
| `PlaySound` | `(sfx: SFX\|number, amplitude: number, position: Vector, range: number): void` | Play at position |

### Voice-Over

| Function | Signature | Description |
|----------|-----------|-------------|
| `PlayVO` | `(vo: VO\|number, event: VoiceOverEvents2D, flag: VoiceOverFlags): void` | Play to everyone |
| `PlayVO` | `(vo: VO\|number, event: VoiceOverEvents2D, flag: VoiceOverFlags, target: Team\|Squad\|Player): void` | Play to target |

---

## Constraints

1. **Music Package Loading**: Must call `LoadMusic()` before `PlayMusic()` for that package
2. **VO Bug**: In CustomConquest, `ObjectiveCapturing` VO always announces "Alpha" regardless of flag parameter (game bug)
3. **Sound Object Limit**: Playing too many sounds can crash servers due to object limits
4. **Looping Sounds**: `SimpleLoop` sounds require manual stopping or will continue indefinitely
5. **VO Conflicts**: Playing multiple VOs simultaneously may cause audio overlap

---

## Related Patterns

- [Capture Points](capture-points.md) - Triggering audio on capture events
- [Game Lifecycle](../core/game-lifecycle.md) - Loading music on game start
- [Scoring](scoring.md) - Audio feedback for score events
