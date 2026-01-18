# Pattern: Strike Packages (Call-In Gadgets)

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: code/mod/index.d.ts:238-245 (Gadgets enum), code/mod/index.d.ts:293-303 (InventorySlots enum)
> Research: mods/Skirmish/Skirmish.ts:3472-3479 (commented-out usage)

---

## Overview

Strike packages are player-equippable call-in gadgets that summon support actions like airstrikes, artillery, supply drops, and UAV overwatch. Players use them like any other gadget - select and deploy to designated locations.

**Status**: SDK-verified. No working mod examples exist (Skirmish had call-ins commented out using wrong enum), but SDK definitions are clear. Basic implementation patterns derived from equipment system.

---

## Available Call-In Gadgets

```typescript
// Source: code/mod/index.d.ts:238-245
mod.Gadgets.CallIn_Air_Strike       // Air strike - bombs a targeted area
mod.Gadgets.CallIn_Ammo_Drop        // Ammo resupply crate drop
mod.Gadgets.CallIn_Anti_Vehicle_Drop // Anti-vehicle weapon supply drop
mod.Gadgets.CallIn_Artillery_Strike  // Artillery bombardment
mod.Gadgets.CallIn_Mobile_Redeploy   // Mobile spawn point (rally point)
mod.Gadgets.CallIn_Smoke_Screen      // Smoke cover deployment
mod.Gadgets.CallIn_UAV_Overwatch     // Reconnaissance UAV
mod.Gadgets.CallIn_Weapon_Drop       // Weapon supply crate drop
```

---

## Inventory Slot

Call-in gadgets have a dedicated inventory slot:

```typescript
// Source: code/mod/index.d.ts:294
mod.InventorySlots.Callins
```

---

## Working Code

### Equipping Call-In Gadgets

```typescript
// Give player a call-in gadget
mod.AddEquipment(player, mod.Gadgets.CallIn_Air_Strike);

// Explicitly specify the Callins slot
mod.AddEquipment(player, mod.Gadgets.CallIn_Artillery_Strike, mod.InventorySlots.Callins);
```

### Loadout Pattern (from equipment system)

```typescript
// Give player a full loadout including call-in
function GivePlayerLoadout(player: mod.Player) {
    // Weapons
    mod.AddEquipment(player, mod.Weapons.AssaultRifle_AK4D);
    mod.AddEquipment(player, mod.Weapons.Sidearm_P18);

    // Gadgets
    mod.AddEquipment(player, mod.Gadgets.Throwable_Mini_Frag_Grenade);
    mod.AddEquipment(player, mod.Gadgets.Melee_Combat_Knife);

    // Call-in
    mod.AddEquipment(player, mod.Gadgets.CallIn_Air_Strike, mod.InventorySlots.Callins);
}
```

### Buy Station Pattern (adapted from Skirmish)

```typescript
// Define call-in items for a buy shop
const callInItems = [
    { nameKey: "WeaponDrop", price: 180, item: mod.Gadgets.CallIn_Weapon_Drop },
    { nameKey: "SmokescreenCallin", price: 200, item: mod.Gadgets.CallIn_Smoke_Screen },
    { nameKey: "UAVOverwatch", price: 250, item: mod.Gadgets.CallIn_UAV_Overwatch },
    { nameKey: "AntiVehicleDrop", price: 300, item: mod.Gadgets.CallIn_Anti_Vehicle_Drop },
    { nameKey: "AirStrike", price: 400, item: mod.Gadgets.CallIn_Air_Strike },
    { nameKey: "AmmoDrop", price: 200, item: mod.Gadgets.CallIn_Ammo_Drop },
    { nameKey: "MobileRedeploy", price: 350, item: mod.Gadgets.CallIn_Mobile_Redeploy },
    { nameKey: "ArtilleryStrike", price: 500, item: mod.Gadgets.CallIn_Artillery_Strike }
];

// Purchase call-in for player
function PurchaseCallIn(player: mod.Player, itemIndex: number) {
    const item = callInItems[itemIndex];
    mod.AddEquipment(player, item.item, mod.InventorySlots.Callins);
}
```

### Removing Call-In Equipment

```typescript
// Remove call-in from player
try {
    mod.RemoveEquipment(player, mod.InventorySlots.Callins);
} catch(e) {
    // Slot was empty - this is OK
}
```

### Checking Call-In Equipment

```typescript
// Check if player has a specific call-in
if (mod.HasEquipment(player, mod.Gadgets.CallIn_Air_Strike)) {
    // Player has air strike equipped
}

// Check if call-in slot is active (player is using it)
if (mod.IsInventorySlotActive(player, mod.InventorySlots.Callins)) {
    // Player has call-in gadget selected
}
```

---

## Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `AddEquipment` | `(player: Player, gadget: Gadgets): void` | Give player a call-in gadget |
| `AddEquipment` | `(player: Player, gadget: Gadgets, slot: InventorySlots): void` | Give call-in to specific slot |
| `RemoveEquipment` | `(player: Player, slot: InventorySlots): void` | Remove call-in from slot |
| `HasEquipment` | `(player: Player, gadget: Gadgets): boolean` | Check if player has specific call-in |
| `IsInventorySlotActive` | `(player: Player, slot: InventorySlots): boolean` | Check if call-in is selected |

---

## Call-In Descriptions

| Gadget | Description |
|--------|-------------|
| `CallIn_Air_Strike` | Calls in a bombing run on a targeted location |
| `CallIn_Artillery_Strike` | Calls in artillery bombardment on targeted area |
| `CallIn_Smoke_Screen` | Deploys smoke cover at targeted location |
| `CallIn_UAV_Overwatch` | Deploys reconnaissance UAV for enemy spotting |
| `CallIn_Ammo_Drop` | Drops ammo resupply crate at location |
| `CallIn_Weapon_Drop` | Drops weapon supply crate at location |
| `CallIn_Anti_Vehicle_Drop` | Drops anti-vehicle weapons at location |
| `CallIn_Mobile_Redeploy` | Places a mobile spawn point for squad |

---

## Constraints & Gotchas

1. **Wrong Enum in Skirmish**: The Skirmish mod used `mod.MiscGadgets.*` for call-ins, which is empty. The correct enum is `mod.Gadgets.CallIn_*`.

2. **No Usage Events**: There are no SDK events for when a call-in is used (e.g., no `OnCallInUsed`). You cannot react to or intercept call-in actions.

3. **One Call-In Per Player**: The `Callins` slot holds one call-in at a time. Adding a new call-in replaces the existing one.

4. **Player Must Be Alive**: Like all equipment operations, the player must be alive:
   ```typescript
   if (mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) {
       mod.AddEquipment(player, mod.Gadgets.CallIn_Air_Strike, mod.InventorySlots.Callins);
   }
   ```

5. **No Ammo/Charge Management**: Unlike weapons, there's no documented way to set "uses" or "charges" for call-in gadgets. They may have built-in cooldowns.

6. **RemoveEquipment Can Throw**: If the Callins slot is empty, `RemoveEquipment` may throw. Wrap in try-catch.

---

## Integration with Other Patterns

- **Equipment** (`patterns/player/equipment.md`): Full equipment system details
- **Economy** (`patterns/gameplay/economy.md`): Implement costs for call-ins
- **Rounds** (`patterns/gameplay/rounds.md`): Reset call-ins between rounds
- **UI Widgets** (`patterns/ui/widgets.md`): Display call-in shop UI

---

## Untested Behaviors

The following behaviors are SDK-defined but not verified in working mods:

1. **Target Selection**: How players designate call-in target locations
2. **Visual Effects**: What VFX/audio accompany each call-in type
3. **Damage Values**: Damage dealt by strike call-ins
4. **Cooldowns**: Whether call-ins have cooldowns between uses
5. **Supply Drop Contents**: What specific items appear in supply drops

Testing recommended in `experimental/prototypes/` before production use.
