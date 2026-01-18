# Pattern: Equipment System

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: mods/BombSquad/BombSquad.ts:667-705, 822-845, 2464-2870
> Source: mods/Skirmish/Skirmish.ts:1816-1830

---

## Overview

The equipment system manages weapons, gadgets, and ammo for players. This includes adding/removing equipment, checking what players have equipped, managing ammo counts, and creating custom weapon packages with attachments.

---

## Inventory Slots

Players have specific slots for different equipment types:

```typescript
// Source: code/mod/index.d.ts:293-303
export enum InventorySlots {
    Callins,         // Call-in gadgets (airstrikes, supply drops)
    ClassGadget,     // Class-specific gadget
    GadgetOne,       // First gadget slot
    GadgetTwo,       // Second gadget slot
    MeleeWeapon,     // Melee weapon
    MiscGadget,      // Misc gadget slot
    PrimaryWeapon,   // Primary weapon
    SecondaryWeapon, // Secondary weapon
    Throwable,       // Throwable gadgets (grenades)
}
```

---

## Working Code

### Adding Equipment

```typescript
// Basic weapon without attachments
mod.AddEquipment(player, mod.Weapons.Carbine_M4A1);

// Weapon with custom attachment package
mod.AddEquipment(player, mod.Weapons.Carbine_M4A1, myWeaponPackage);

// Gadget (auto-assigns to appropriate slot)
mod.AddEquipment(player, mod.Gadgets.Throwable_Mini_Frag_Grenade);

// Gadget to specific slot
mod.AddEquipment(player, mod.Gadgets.Throwable_Smoke_Grenade, mod.InventorySlots.GadgetOne);

// Melee weapon
mod.AddEquipment(player, mod.Gadgets.Melee_Combat_Knife);

// Armor
mod.AddEquipment(player, mod.ArmorTypes.CeramicArmor);
```

### Removing Equipment

```typescript
// Source: mods/BombSquad/BombSquad.ts:822-845
function ResetPlayerLoadout(player: mod.Player, isOutOfRound: boolean) {
    if (mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) {
        // Remove by slot
        mod.RemoveEquipment(player, mod.InventorySlots.PrimaryWeapon);
        mod.RemoveEquipment(player, mod.InventorySlots.SecondaryWeapon);

        // Remove gadgets with try-catch (may not have equipment in slot)
        try {
            mod.RemoveEquipment(player, mod.InventorySlots.GadgetOne);
        } catch(e) {
            // Slot was empty
        }
        try {
            mod.RemoveEquipment(player, mod.InventorySlots.GadgetTwo);
        } catch(e) {
            // Slot was empty
        }

        // Give default loadout
        mod.AddEquipment(player, mod.Weapons.Sidearm_P18, SidearmPackage_Standard_P18);
        mod.AddEquipment(player, mod.Gadgets.Melee_Combat_Knife);
    }
}
```

### Checking Equipment

```typescript
// Source: mods/BombSquad/BombSquad.ts:675-705
function IsPrimarySlotFilled(player: mod.Player): boolean {
    // Check for specific weapon types
    for (var enumMember in mod.Weapons) {
        var isValueProperty = Number(enumMember) >= 0;
        if (isValueProperty) {
            let em = mod.Weapons[enumMember];
            if (em.includes("AssaultRifle") || em.includes("Carbine") ||
                em.includes("DMR") || em.includes("LMG") ||
                em.includes("Shotgun") || em.includes("SMG") ||
                em.includes("Sniper")) {
                if (mod.HasEquipment(player, Number(enumMember))) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Check if slot is currently active (weapon is equipped in hand)
if (mod.IsInventorySlotActive(player, mod.InventorySlots.MeleeWeapon)) {
    // Player is holding their melee weapon
}
```

### Ammo Management

```typescript
// Source: mods/BombSquad/BombSquad.ts:667-673
function RefillPlayersAmmo(player: mod.Player) {
    mod.SetInventoryAmmo(player, mod.InventorySlots.PrimaryWeapon, 1000);
    mod.SetInventoryMagazineAmmo(player, mod.InventorySlots.PrimaryWeapon, 1000);

    mod.SetInventoryAmmo(player, mod.InventorySlots.SecondaryWeapon, 1000);
    mod.SetInventoryMagazineAmmo(player, mod.InventorySlots.SecondaryWeapon, 1000);
}

// Source: mods/Skirmish/Skirmish.ts:1816-1830
static GiveAmmoToPlayer(player: mod.Player) {
    if (mod.IsInventorySlotActive(player, mod.InventorySlots.PrimaryWeapon)
        && mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)
        && mod.IsPlayerValid(player)) {
        mod.SetInventoryAmmo(player, mod.InventorySlots.PrimaryWeapon, 100);
        mod.SetInventoryMagazineAmmo(player, mod.InventorySlots.PrimaryWeapon, 100);
    }

    if (mod.IsInventorySlotActive(player, mod.InventorySlots.SecondaryWeapon)
        && mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)
        && mod.IsPlayerValid(player)) {
        mod.SetInventoryAmmo(player, mod.InventorySlots.SecondaryWeapon, 100);
        mod.SetInventoryMagazineAmmo(player, mod.InventorySlots.SecondaryWeapon, 100);
    }
}

// Get current ammo counts
let reserveAmmo = mod.GetInventoryAmmo(player, mod.InventorySlots.PrimaryWeapon);
let magAmmo = mod.GetInventoryMagazineAmmo(player, mod.InventorySlots.PrimaryWeapon);
```

---

## Weapon Packages (Custom Attachments)

Weapon packages allow you to give players weapons with specific attachments.

### Creating Weapon Packages

```typescript
// Source: mods/BombSquad/BombSquad.ts:2464-2523
// Basic assault rifle (iron sights only)
let assaultRiflePackage_Basic = mod.CreateNewWeaponPackage();
mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Magazine_30rnd_Magazine, assaultRiflePackage_Basic);
mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Scope_Iron_Sights, assaultRiflePackage_Basic);

// Standard assault rifle (optic + grip)
let assaultRiflePackage_Standard = mod.CreateNewWeaponPackage();
mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Magazine_30rnd_Magazine, assaultRiflePackage_Standard);
mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Scope_1p87_150x, assaultRiflePackage_Standard);
mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Bottom_Classic_Grip_Pod, assaultRiflePackage_Standard);
mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Muzzle_Compensated_Brake, assaultRiflePackage_Standard);

// Elite assault rifle (full attachments)
let assaultRiflePackage_Elite = mod.CreateNewWeaponPackage();
mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Magazine_30rnd_Fast_Mag, assaultRiflePackage_Elite);
mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Scope_R4T_200x, assaultRiflePackage_Elite);
mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Bottom_Full_Angled, assaultRiflePackage_Elite);
mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Ammo_Tungsten_Core, assaultRiflePackage_Elite);
mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Muzzle_Standard_Suppressor, assaultRiflePackage_Elite);
```

### Sidearm Package Example

```typescript
// Source: mods/BombSquad/BombSquad.ts:2701-2705
let SidearmPackage_Standard_P18 = mod.CreateNewWeaponPackage();
mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Ammo_FMJ, SidearmPackage_Standard_P18);
mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Magazine_17rnd_Magazine, SidearmPackage_Standard_P18);
mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Barrel_39_Factory, SidearmPackage_Standard_P18);
```

### Using Weapon Packages

```typescript
// Give player weapon with attachments
mod.AddEquipment(player, mod.Weapons.AssaultRifle_KORD_6P67, assaultRiflePackage_Standard);
mod.AddEquipment(player, mod.Weapons.Sidearm_P18, SidearmPackage_Standard_P18);
```

---

## Common Weapons & Gadgets

### Primary Weapons

```typescript
// Assault Rifles
mod.Weapons.AssaultRifle_AK4D
mod.Weapons.AssaultRifle_KORD_6P67
mod.Weapons.AssaultRifle_L85A3
mod.Weapons.AssaultRifle_TR_7

// Carbines
mod.Weapons.Carbine_M4A1
mod.Weapons.Carbine_AK_205

// Snipers
mod.Weapons.Sniper_M2010_ESR
mod.Weapons.Sniper_SV_98

// Shotguns
mod.Weapons.Shotgun_M87A1
mod.Weapons.Shotgun_M1014

// LMGs
mod.Weapons.LMG_L110
mod.Weapons.LMG_KTS100_MK8
```

### Secondary Weapons (Sidearms)

```typescript
mod.Weapons.Sidearm_P18
mod.Weapons.Sidearm_M45A1
mod.Weapons.Sidearm_ES_57
mod.Weapons.Sidearm_M44
```

### Gadgets

```typescript
// Throwables
mod.Gadgets.Throwable_Mini_Frag_Grenade
mod.Gadgets.Throwable_Incendiary_Grenade
mod.Gadgets.Throwable_Smoke_Grenade
mod.Gadgets.Throwable_Flash_Grenade

// Launchers
mod.Gadgets.Launcher_Unguided_Rocket

// Utility
mod.Gadgets.Misc_Defibrillator
mod.Gadgets.Melee_Combat_Knife

// Call-Ins
mod.Gadgets.CallIn_Air_Strike
mod.Gadgets.CallIn_Ammo_Drop
mod.Gadgets.CallIn_Anti_Vehicle_Drop
mod.Gadgets.CallIn_Artillery_Strike
mod.Gadgets.CallIn_Mobile_Redeploy
mod.Gadgets.CallIn_Smoke_Screen
mod.Gadgets.CallIn_UAV_Overwatch
mod.Gadgets.CallIn_Weapon_Drop
```

---

## Buy Shop Pattern

BombSquad implements a full purchase system. Here's the data structure:

```typescript
// Source: mods/BombSquad/BombSquad.ts:2709-2870
const cStoreData = [
    {
        tabName: mod.stringkeys.store.riflestab,
        tabRandomized: false,
        itemDatas: [
            {
                id: "gun_M4A1",
                name: mod.stringkeys.store.rifle1_1,
                cost: 2400,
                weapon: mod.Weapons.Carbine_M4A1,
                weaponPackage: carbinePackage_Basic_M4A1
            },
            // ... more weapons
        ]
    },
    {
        tabName: mod.stringkeys.store.grenadestab,
        tabRandomized: false,
        itemDatas: [
            {
                id: "grenade_explosive",
                name: mod.stringkeys.store.grenade1,
                cost: 1000,
                weapon: mod.Gadgets.Throwable_Mini_Frag_Grenade
                // No weaponPackage for gadgets
            }
        ]
    }
];

// Purchase function
function PurchaseItem(player: mod.Player, itemData: any) {
    if (itemData.weaponPackage != null) {
        mod.AddEquipment(player, itemData.weapon, itemData.weaponPackage);
    } else {
        mod.AddEquipment(player, itemData.weapon);
    }
}
```

---

## Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `AddEquipment` | `(player: Player, weapon: Weapons): void` | Give player a weapon |
| `AddEquipment` | `(player: Player, gadget: Gadgets): void` | Give player a gadget |
| `AddEquipment` | `(player: Player, weapon: Weapons, package: WeaponPackage): void` | Give weapon with attachments |
| `AddEquipment` | `(player: Player, gadget: Gadgets, slot: InventorySlots): void` | Give gadget to specific slot |
| `AddEquipment` | `(player: Player, armor: ArmorTypes): void` | Give player armor |
| `RemoveEquipment` | `(player: Player, slot: InventorySlots): void` | Remove equipment from slot |
| `RemoveEquipment` | `(player: Player, weapon: Weapons): void` | Remove specific weapon |
| `RemoveEquipment` | `(player: Player, gadget: Gadgets): void` | Remove specific gadget |
| `HasEquipment` | `(player: Player, weapon: Weapons): boolean` | Check if player has weapon |
| `HasEquipment` | `(player: Player, gadget: Gadgets): boolean` | Check if player has gadget |
| `IsInventorySlotActive` | `(player: Player, slot: InventorySlots): boolean` | Check if slot's item is equipped/in-hand |
| `SetInventoryAmmo` | `(player: Player, slot: InventorySlots, ammo: number): void` | Set reserve ammo |
| `SetInventoryMagazineAmmo` | `(player: Player, slot: InventorySlots, magAmmo: number): void` | Set magazine ammo |
| `GetInventoryAmmo` | `(player: Player, slot: InventorySlots): number` | Get reserve ammo |
| `GetInventoryMagazineAmmo` | `(player: Player, slot: InventorySlots): number` | Get magazine ammo |
| `CreateNewWeaponPackage` | `(): WeaponPackage` | Create empty weapon package |
| `AddAttachmentToWeaponPackage` | `(attachment: WeaponAttachments, package: WeaponPackage): void` | Add attachment to package |

---

## Constraints & Gotchas

1. **No Slot Check for Gadgets**: There's no SDK function to check which slot a gadget is in. You can only check if a player has the gadget at all.

2. **RemoveEquipment Can Throw**: If the slot is empty, `RemoveEquipment` may throw. Wrap in try-catch:
   ```typescript
   try {
       mod.RemoveEquipment(player, mod.InventorySlots.GadgetOne);
   } catch(e) {
       // Slot was empty - this is OK
   }
   ```

3. **Weapon Packages Are Global**: Create packages once at mod startup, not per-player. They persist for the session.

4. **Player Must Be Alive**: Equipment operations require the player to be alive:
   ```typescript
   if (mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) {
       mod.AddEquipment(player, weapon);
   }
   ```

5. **Attachment Replacement**: `AddAttachmentToWeaponPackage` replaces existing attachments of the same type (e.g., adding a new scope replaces the old one).

6. **Call-In Slot**: Call-in gadgets should use `mod.InventorySlots.Callins`:
   ```typescript
   mod.AddEquipment(player, mod.Gadgets.CallIn_Air_Strike, mod.InventorySlots.Callins);
   ```

---

## Integration with Other Patterns

- **Economy** (`patterns/gameplay/economy.md`): Check player cash before purchases
- **Rounds** (`patterns/gameplay/rounds.md`): Reset loadouts between rounds
- **UI Widgets** (`patterns/ui/widgets.md`): Display shop UI, ammo counts
