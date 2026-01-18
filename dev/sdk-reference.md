# SDK Reference Deep Dive

> **Purpose**: Detailed SDK reference material extracted from original CLAUDE.md
> **Use When**: Need in-depth API details beyond what patterns provide
> **Note**: Don't load this into main context - use patterns instead when possible

---

## Quick Reference: Most Used Functions

```typescript
// Events (export these - game calls them)
export async function OnGameModeStarted() { }
export function OnPlayerJoinGame(eventPlayer: mod.Player): void { }
export function OnPlayerDeployed(eventPlayer: mod.Player): void { }
export function OnPlayerDied(eventPlayer, eventOtherPlayer, eventDeathType, eventWeaponUnlock): void { }
export function OnVehicleSpawned(eventVehicle: mod.Vehicle): void { }

// Vectors
mod.CreateVector(x: number, y: number, z: number): mod.Vector
mod.XComponentOf(vector): number
mod.DistanceBetween(a: mod.Vector, b: mod.Vector): number

// Players & Teams
mod.GetTeam(playerOrIndex: mod.Player | number): mod.Team
mod.GetObjId(object: any): number  // Use for equality checks - see object-equality.md
mod.Teleport(player: mod.Player, position: mod.Vector, facingAngle: number): void
mod.IsPlayerValid(player: mod.Player): boolean  // Check before operations

// Object Equality (CRITICAL - === does not work for SDK objects)
// WRONG: if (team1 === team2)
// RIGHT: if (mod.GetObjId(team1) === mod.GetObjId(team2))

// Timing
await mod.Wait(seconds: number): Promise<void>  // Only in async functions

// Vehicles
mod.SpawnObject(mod.RuntimeSpawn_Common.VehicleSpawner, position, rotation): mod.Object
mod.SetVehicleSpawnerVehicleType(spawner, mod.VehicleList.Vector): void
mod.ForceVehicleSpawnerSpawn(spawner): void
mod.ForcePlayerToSeat(player, vehicle, seatIndex): void

// Input Control
mod.EnableAllInputRestrictions(player, true/false): void  // Lock/unlock all inputs
mod.EnableInputRestriction(player, mod.RestrictedInputs.Sprint, true/false): void

// Messages
mod.Message(key: string, ...args: any[]): mod.Message
mod.DisplayNotificationMessage(message: mod.Message, target?: mod.Player | mod.Team): void

// UI
mod.AddUIText(name, position, size, anchor, message): void
mod.AddUIContainer(name, position, size, anchor): void
mod.FindUIWidgetWithName(name: string): mod.UIWidget
```

---

## Skirmish Mod Deep Dive

Source: `mods/Skirmish/Skirmish.ts` (~81,000 lines)

The Skirmish mod is the most comprehensive example, implementing a 4-team Battle Royale with loot, economy, and Ring of Fire.

### Strike Packages / Call-In Gadgets

The SDK provides call-in gadgets that players can equip and use:

```typescript
// Available CallIn Gadgets (mod.Gadgets enum)
mod.Gadgets.CallIn_Air_Strike       // Air strike
mod.Gadgets.CallIn_Ammo_Drop        // Ammo resupply drop
mod.Gadgets.CallIn_Anti_Vehicle_Drop // Anti-vehicle weapon drop
mod.Gadgets.CallIn_Artillery_Strike  // Artillery bombardment
mod.Gadgets.CallIn_Mobile_Redeploy   // Mobile spawn point
mod.Gadgets.CallIn_Smoke_Screen      // Smoke cover
mod.Gadgets.CallIn_UAV_Overwatch     // Reconnaissance UAV
mod.Gadgets.CallIn_Weapon_Drop       // Weapon supply drop

// Equipping a call-in gadget to a player
mod.AddEquipment(player, mod.Gadgets.CallIn_Air_Strike);
mod.AddEquipment(player, mod.Gadgets.CallIn_Artillery_Strike, mod.InventorySlots.Callins);

// Inventory slot specifically for call-ins
mod.InventorySlots.Callins
```

**Note**: The Skirmish mod had call-ins commented out using `mod.MiscGadgets.*` (which is empty). The correct enum is `mod.Gadgets.CallIn_*`.

### Equipment System

```typescript
// Adding weapons and gadgets
mod.AddEquipment(player, weapon: mod.Weapons): void
mod.AddEquipment(player, gadget: mod.Gadgets): void
mod.AddEquipment(player, gadget: mod.Gadgets, slot: mod.InventorySlots): void
mod.AddEquipment(player, armor: mod.ArmorTypes): void

// Removing equipment
mod.RemoveEquipment(player, slot: mod.InventorySlots): void
mod.RemoveEquipment(player, weapon: mod.Weapons): void
mod.RemoveEquipment(player, gadget: mod.Gadgets): void

// Checking equipment
mod.HasEquipment(player, weapon: mod.Weapons): boolean
mod.HasEquipment(player, gadget: mod.Gadgets): boolean
mod.IsInventorySlotActive(player, slot: mod.InventorySlots): boolean

// Inventory Slots
mod.InventorySlots.Callins       // Call-in gadgets
mod.InventorySlots.ClassGadget   // Class-specific gadget
mod.InventorySlots.GadgetOne     // First gadget slot
mod.InventorySlots.GadgetTwo     // Second gadget slot
mod.InventorySlots.MeleeWeapon   // Melee weapon
mod.InventorySlots.MiscGadget    // Misc gadget slot
mod.InventorySlots.PrimaryWeapon // Primary weapon
mod.InventorySlots.SecondaryWeapon // Secondary weapon
mod.InventorySlots.Throwable     // Throwable gadgets

// Ammo management
mod.SetInventoryAmmo(player, slot: mod.InventorySlots, ammo: number): void
mod.SetInventoryMagazineAmmo(player, slot: mod.InventorySlots, magAmmo: number): void
mod.GetInventoryAmmo(player, slot: mod.InventorySlots): number
mod.GetInventoryMagazineAmmo(player, slot: mod.InventorySlots): number
```

### Ring of Fire (BR Shrinking Zone)

The Ring of Fire is a built-in Portal object for Battle Royale shrinking zones:

```typescript
// Get the Ring of Fire object (placed in Godot editor)
const ringOfFire = mod.GetRingOfFire(objectId: number): mod.RingOfFire

// Start the ring shrinking sequence
mod.RingOfFireStart(ringOfFire): void

// Configure the ring
mod.SetRingOfFireDamageAmount(ringOfFire, damageAmount: number): void  // Damage to players outside
mod.SetRingOfFireStableTime(ringOfFire, stableTime: number): void      // Time between shrinks

// Remove the ring
mod.UnspawnObject(ringOfFire): void

// Event hook - fires when ring size changes
export function OnRingOfFireZoneSizeChange(eventRingOfFire: mod.RingOfFire, eventNumber: number): void {
    // eventNumber indicates the current ring stage
}
```

**Custom Ring Implementation** (from Skirmish's `RingOfFireAnalogue`):
```typescript
// Custom damage checking for players outside ring
const playerPosition = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);
const distanceFromRing = mod.DistanceBetween(playerPosition, ringCenterPosition);
if (distanceFromRing > currentRingRadius) {
    mod.DealDamage(player, damageAmount);
}
```

### Loot System

The loot system uses `LootSpawner` objects and rarity pools:

```typescript
// Get a loot spawner (placed in Godot editor)
const spawner = mod.GetLootSpawner(spawnerIndex: number): mod.LootSpawner

// Spawn loot at a spawner
mod.SpawnLoot(spawner, weapon: mod.Weapons): void
mod.SpawnLoot(spawner, gadget: mod.Gadgets): void
mod.SpawnLoot(spawner, ammo: mod.AmmoTypes): void
mod.SpawnLoot(spawner, armor: mod.ArmorTypes): void

// Ammo types for loot
mod.AmmoTypes.AR_Carbine_Ammo
mod.AmmoTypes.Pistol_SMG_Ammo
mod.AmmoTypes.Sniper_DMR_Ammo
mod.AmmoTypes.LMG_Ammo
mod.AmmoTypes.Armor_Plate

// Armor types
mod.ArmorTypes.SoftArmor
mod.ArmorTypes.CeramicArmor
```

**Loot Pool Configuration Pattern** (from Skirmish):
```typescript
const LOOT_POOLS = {
    weapons: {
        primary: [
            // Common tier
            [mod.Weapons.Carbine_M4A1, mod.Weapons.AssaultRifle_L85A3, ...],
            // Uncommon tier
            [mod.Weapons.AssaultRifle_AK4D, mod.Weapons.AssaultRifle_NVO_228E, ...],
            // Rare tier
            [mod.Weapons.DMR_M39_EMR, mod.Weapons.LMG_DRS_IAR, ...],
            // Epic tier
            [mod.Weapons.LMG_M250, mod.Weapons.Sniper_PSR, ...],
            // Legendary tier
            [mod.Weapons.Sniper_SV_98, mod.Weapons.Shotgun_M87A1, ...]
        ]
    }
};
// Roll rarity, then pick random item from that tier
```

### Multi-Team Management (4 Teams)

```typescript
// Initialize 4 teams
TeamData.Initialize([mod.GetTeam(1), mod.GetTeam(2), mod.GetTeam(3), mod.GetTeam(4)]);

// Assign player to team with lowest member count (auto-balancing)
const teamMemberCount = [0, 0, 0, 0];  // Track counts for teams 1-4
const lowestCount = Math.min(...teamMemberCount);
const teamsWithLowestCount = [0,1,2,3].filter(i => teamMemberCount[i] === lowestCount);
const selectedTeam = teamsWithLowestCount[Math.floor(Math.random() * teamsWithLowestCount.length)] + 1;
mod.SetTeam(player, mod.GetTeam(selectedTeam));

// Get team number from player (using GetObjId for comparison)
function GetTeamNumber(player: mod.Player): number {
    const teamId = mod.GetTeam(player);
    for (let i = 1; i <= 4; i++) {
        if (mod.GetObjId(teamId) === mod.GetObjId(mod.GetTeam(i))) {
            return i;
        }
    }
    return -1;
}
```

### Player Spawning System

```typescript
// Enable/disable player deployment
mod.EnableAllPlayerDeploy(enable: boolean): void
mod.EnablePlayerDeploy(player, enable: boolean): void

// Spawn player from a numbered spawn point (placed in Godot)
mod.SpawnPlayerFromSpawnPoint(player, spawnPointId: number): void
mod.SpawnPlayerFromSpawnPoint(player, spawnPoint: mod.SpawnPoint): void

// Check if player is alive
mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive): boolean
mod.GetSoldierState(player, mod.SoldierStateBool.IsManDown): boolean
mod.GetSoldierState(player, mod.SoldierStateBool.IsDead): boolean

// Get player position
mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition): mod.Vector
```

### World Icons

```typescript
// Get a world icon (placed in Godot editor)
const icon = mod.GetWorldIcon(iconNumber: number): mod.WorldIcon

// Configure world icon
mod.SetWorldIconImage(icon, mod.WorldIconImages.Hazard): void
mod.SetWorldIconColor(icon, mod.CreateVector(r, g, b)): void
mod.SetWorldIconPosition(icon, position: mod.Vector): void
mod.SetWorldIconText(icon, message: mod.Message): void
mod.SetWorldIconOwner(icon, team: mod.Team): void  // Only visible to team
mod.SetWorldIconOwner(icon, player: mod.Player): void  // Only visible to player

// Enable/disable icon elements
mod.EnableWorldIconImage(icon, enable: boolean): void
mod.EnableWorldIconText(icon, enable: boolean): void

// Available icon images
mod.WorldIconImages.Alert
mod.WorldIconImages.Bomb
mod.WorldIconImages.BombArmed
mod.WorldIconImages.Cross
mod.WorldIconImages.DangerPing
mod.WorldIconImages.Eye
mod.WorldIconImages.Flag
mod.WorldIconImages.Hazard
mod.WorldIconImages.Skull
mod.WorldIconImages.Triangle
```

### InteractPoints (Buy Stations)

```typescript
// Get and enable interact points (placed in Godot editor)
mod.GetInteractPoint(index: number): mod.InteractPoint
mod.EnableInteractPoint(interactPoint, enable: boolean): void

// Event hook when player interacts
export function OnPlayerInteract(eventPlayer: mod.Player): void {
    // Triggered when player uses interact point
}
```

### Helper Utilities (from Skirmish's H class)

```typescript
// Safe array conversion
function toArray<T>(value: T | T[] | undefined): T[] {
    if (value === undefined) return [];
    return Array.isArray(value) ? value : [value];
}

// Format seconds to [minutes, secondsTens, secondsOnes]
function FormatTime(sec: number): [number, number, number] {
    if (sec < 0) sec = 0;
    const minutes = Math.floor(sec / 60);
    const remainingSeconds = Math.floor(sec % 60);
    return [minutes, Math.floor(remainingSeconds / 10), remainingSeconds % 10];
}

// Vector lerp
function LerpVector(a: mod.Vector, b: mod.Vector, t: number): mod.Vector {
    return mod.CreateVector(
        Lerp(mod.XComponentOf(a), mod.XComponentOf(b), t),
        Lerp(mod.YComponentOf(a), mod.YComponentOf(b), t),
        Lerp(mod.ZComponentOf(a), mod.ZComponentOf(b), t)
    );
}

// Get all players grouped by team
function GetPlayersOnTeam(): Record<string, mod.Player[]> {
    const players = mod.AllPlayers();
    const teams: Record<string, mod.Player[]> = {};
    const n = mod.CountOf(players);
    for (let i = 0; i < n; i++) {
        const player = mod.ValueInArray(players, i);
        const teamId = mod.GetObjId(mod.GetTeam(player));
        if (!teams[teamId]) teams[teamId] = [];
        teams[teamId].push(player);
    }
    return teams;
}
```

---

## GC/GD/GS Architecture

The recommended state management pattern separates:
- **GC** (Game Config) - Static settings
- **GD** (Game Data) - Runtime state
- **GS** (Game State) - State machine methods

```typescript
// GC - Game Configuration (static settings)
class GC {
    static maxPlayers = 16;
    static maxRounds = 1;
    static teamAmount = 4;
    static startingCurrency = 500;
    static currencyGainOnKill = 100;
    static teamColors: mod.Vector[] = [...];
    static availableSpawnPoints: mod.Vector[] = [...];
}

// GD - Game Data (runtime state)
class GD {
    static currentRound = 0;
    static roundActive = false;
    static teamDataArray: TeamData[] = [];
}

// GS - Game State (state machine methods)
class GS {
    static StartPreRound() { ... }
    static StartRound() { ... }
    static EndRound() { ... }
}
```

---

## Validation Checklist

Before delivering mod code:

- [ ] Every `mod.*` call exists in SDK types (search `bf6-portal-mod-types` or `code/mod/index.d.ts`)
- [ ] Event hook signatures match exactly (parameter names and types)
- [ ] `mod.Message('key')` keys are documented for `.strings.json`
- [ ] Spatial objects (HQ, CapturePoint, AreaTrigger) note Godot requirements
- [ ] No functions invented from general TypeScript knowledge
- [ ] No code sourced from BF2042 web documentation
- [ ] **Object equality uses `mod.GetObjId()`** - never `===` for teams/players/objects
- [ ] Player arrays use try-catch or validity checks (players can become invalid)

---

## Debugging

Portal logs output to:
```
C:\Users\{username}\AppData\Local\Temp\Battlefield 6\PortalLog.txt
```

Use `console.log()` in mod code to write here.

---

## Adding New Patterns

When extracting new patterns from example mods:

1. Read the source mod file
2. Extract working code
3. Verify every `mod.*` call exists in SDK types
4. Create pattern document with header:
```markdown
# Pattern: [Name]
> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: mods/[ModName]/[File].ts:[LineNumbers]
```
5. Include: What it does, working code, function table, constraints
6. Update `patterns/_index.md`
