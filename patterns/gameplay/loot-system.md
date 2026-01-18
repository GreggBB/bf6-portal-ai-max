# Pattern: Loot System

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: mods/Skirmish/Skirmish.ts:2039-2720

---

## Overview

Battle Royale and loot-based modes require spawning pickable items (weapons, ammo, gadgets, armor) at designated locations. Portal provides `LootSpawner` objects and the `SpawnLoot` function to create item pickups that players can collect.

---

## Core Concepts

### LootSpawner Objects

LootSpawners are spatial objects that define where loot can appear. They can be:
1. **Pre-placed in Godot** - Static spawners with assigned IDs
2. **Runtime spawned** - Dynamically created spawners

```typescript
// Get a pre-placed LootSpawner by ID (set in Godot editor)
const spawner = mod.GetLootSpawner(1);  // Returns LootSpawner object

// Or spawn one at runtime
const spawnerObj = mod.SpawnObject(
    mod.RuntimeSpawn_Common.LootSpawner,
    mod.CreateVector(x, y, z),       // Position
    mod.CreateVector(0, 0, 0),       // Rotation
    mod.CreateVector(1, 1, 1)        // Scale
);
const spawnerId = mod.GetObjId(spawnerObj);
const lootSpawner = mod.GetLootSpawner(spawnerId);
```

### Spawnable Item Types

The `SpawnLoot` function accepts four item categories:

| Category | Enum | Examples |
|----------|------|----------|
| Weapons | `mod.Weapons.*` | AssaultRifle_AK4D, Sniper_SV_98 |
| Gadgets | `mod.Gadgets.*` | Throwable_Frag_Grenade, Deployable_EOD_Bot |
| Ammo | `mod.AmmoTypes.*` | AR_Carbine_Ammo, Pistol_SMG_Ammo |
| Armor | `mod.ArmorTypes.*` | SoftArmor, CeramicArmor |

---

## Working Code

### Basic Loot Spawning

```typescript
// Source: mods/Skirmish/Skirmish.ts:2633-2634
// Spawn a weapon at a loot spawner
const lootSpawner = mod.GetLootSpawner(1);
mod.SpawnLoot(lootSpawner, mod.Weapons.AssaultRifle_AK4D);

// Spawn ammo
mod.SpawnLoot(lootSpawner, mod.AmmoTypes.AR_Carbine_Ammo);

// Spawn armor
mod.SpawnLoot(lootSpawner, mod.ArmorTypes.CeramicArmor);

// Spawn gadget
mod.SpawnLoot(lootSpawner, mod.Gadgets.Throwable_Fragmentation_Grenade);
```

### Runtime Spawner with Auto-Cleanup

```typescript
// Source: mods/Skirmish/Skirmish.ts:2613-2669
async function spawnLootAtPosition(x: number, y: number, z: number, item: any): Promise<void> {
    // Create spawner at position
    const spawnerObj = mod.SpawnObject(
        mod.RuntimeSpawn_Common.LootSpawner,
        mod.CreateVector(x, y, z),
        mod.CreateVector(0, Math.random() * 360, 0),  // Random rotation
        mod.CreateVector(1, 1, 1)
    );

    const spawnerId = mod.GetObjId(spawnerObj);

    try {
        const lootSpawner = mod.GetLootSpawner(spawnerId);
        mod.SpawnLoot(lootSpawner, item);
    } catch (error) {
        console.log("Error spawning loot:", error);
    }

    // Clean up spawner after loot is placed
    await mod.Wait(0.7);
    mod.UnspawnObject(spawnerObj);
}
```

### Loot Pool Configuration

```typescript
// Source: mods/Skirmish/Skirmish.ts:2069-2196
// Weapon pools organized by rarity tier
const LOOT_POOLS = {
    weapons: {
        primary: [
            // Common - Assault Rifles, Carbines, SMGs
            [
                mod.Weapons.Carbine_M4A1, mod.Weapons.AssaultRifle_L85A3, mod.Weapons.Carbine_AK_205,
                mod.Weapons.AssaultRifle_B36A4, mod.Weapons.AssaultRifle_TR_7, mod.Weapons.AssaultRifle_M433,
                mod.Weapons.Carbine_GRT_BC, mod.Weapons.SMG_SCW_10, mod.Weapons.SMG_KV9,
                mod.Weapons.SMG_UMG_40, mod.Weapons.SMG_PW7A2, mod.Weapons.SMG_PW5A3
            ],
            // Uncommon - Advanced assault rifles
            [
                mod.Weapons.AssaultRifle_AK4D, mod.Weapons.AssaultRifle_NVO_228E,
                mod.Weapons.AssaultRifle_SOR_556_Mk2, mod.Weapons.AssaultRifle_KORD_6P67,
                mod.Weapons.Carbine_M417_A2, mod.Weapons.Carbine_QBZ_192,
                mod.Weapons.SMG_USG_90, mod.Weapons.SMG_SGX
            ],
            // Rare - DMRs and LMGs
            [
                mod.Weapons.DMR_M39_EMR, mod.Weapons.DMR_SVDM, mod.Weapons.DMR_LMR27,
                mod.Weapons.DMR_SVK_86, mod.Weapons.LMG_DRS_IAR, mod.Weapons.LMG_KTS100_MK8,
                mod.Weapons.LMG_L110, mod.Weapons.LMG_RPKM
            ],
            // Epic - Heavy LMGs
            [
                mod.Weapons.LMG_M250, mod.Weapons.LMG_M240L, mod.Weapons.LMG_M_60,
                mod.Weapons.LMG_M123K, mod.Weapons.Sniper_PSR
            ],
            // Legendary - Snipers and Shotguns
            [
                mod.Weapons.Sniper_SV_98, mod.Weapons.Sniper_M2010_ESR,
                mod.Weapons.Shotgun_M87A1, mod.Weapons.Shotgun_M1014
            ]
        ],
        secondary: [
            [mod.Weapons.Sidearm_P18, mod.Weapons.Sidearm_M45A1],
            [mod.Weapons.Sidearm_ES_57, mod.Weapons.Sidearm_M45A1],
            [mod.Weapons.Sidearm_M44, mod.Weapons.Sidearm_ES_57],
            [mod.Weapons.Sidearm_M44],
            [mod.Weapons.Sidearm_M44]
        ]
    },
    ammo: [
        // Common - All ammo types including armor plates
        [mod.AmmoTypes.AR_Carbine_Ammo, mod.AmmoTypes.Pistol_SMG_Ammo, mod.AmmoTypes.Sniper_DMR_Ammo, mod.AmmoTypes.LMG_Ammo, mod.AmmoTypes.Armor_Plate],
        // Uncommon
        [mod.AmmoTypes.AR_Carbine_Ammo, mod.AmmoTypes.Pistol_SMG_Ammo, mod.AmmoTypes.Sniper_DMR_Ammo, mod.AmmoTypes.LMG_Ammo],
        // Rare
        [mod.AmmoTypes.AR_Carbine_Ammo, mod.AmmoTypes.Pistol_SMG_Ammo, mod.AmmoTypes.LMG_Ammo],
        // Epic
        [mod.AmmoTypes.AR_Carbine_Ammo, mod.AmmoTypes.Pistol_SMG_Ammo],
        // Legendary
        [mod.AmmoTypes.Pistol_SMG_Ammo]
    ],
    gadgets: {
        throwables: [
            // Common
            [mod.Gadgets.Throwable_Throwing_Knife, mod.Gadgets.Throwable_Flash_Grenade, mod.Gadgets.Throwable_Smoke_Grenade],
            // Uncommon
            [mod.Gadgets.Throwable_Fragmentation_Grenade, mod.Gadgets.Throwable_Stun_Grenade, mod.Gadgets.Throwable_Mini_Frag_Grenade],
            // Rare
            [mod.Gadgets.Throwable_Incendiary_Grenade, mod.Gadgets.Throwable_Proximity_Detector],
            // Epic
            [mod.Gadgets.Throwable_Incendiary_Grenade],
            // Legendary
            [mod.Gadgets.Throwable_Fragmentation_Grenade]
        ],
        equipment: [
            // Common
            [mod.Gadgets.Class_Repair_Tool, mod.Gadgets.Deployable_Cover, mod.Gadgets.Misc_Supply_Pouch,
             mod.Gadgets.Class_Motion_Sensor, mod.Gadgets.Misc_Sniper_Decoy, mod.Gadgets.Class_Adrenaline_Injector],
            // Uncommon
            [mod.Gadgets.Misc_Defibrillator, mod.Gadgets.Misc_Tracer_Dart, mod.Gadgets.Deployable_Recon_Drone,
             mod.Gadgets.Misc_Laser_Designator, mod.Gadgets.Misc_Anti_Personnel_Mine],
            // Rare
            [mod.Gadgets.Launcher_Unguided_Rocket, mod.Gadgets.Launcher_Long_Range,
             mod.Gadgets.Misc_Demolition_Charge, mod.Gadgets.Launcher_Smoke_Grenade],
            // Epic
            [mod.Gadgets.Launcher_Aim_Guided, mod.Gadgets.Deployable_Portable_Mortar,
             mod.Gadgets.Launcher_High_Explosive, mod.Gadgets.Launcher_Auto_Guided],
            // Legendary
            [mod.Gadgets.Deployable_EOD_Bot]
        ]
    },
    armor: [
        [mod.ArmorTypes.SoftArmor],
        [mod.ArmorTypes.CeramicArmor]
    ]
};
```

### Rarity Roll System

```typescript
// Source: mods/Skirmish/Skirmish.ts:2040-2066
const LOOT_CONFIG = {
    baseSpawnChance: 100,
    spawnerDensity: 1.0,
    minSpawnersPerZone: 6,
    maxSpawnersPerZone: 6,

    // Rarity thresholds (0-100): Common, Uncommon, Rare, Epic, Legendary
    rarityRolls: [35, 60, 75, 90],

    // Item type distribution (0-100): Primary, Secondary, Gadgets, Ammo
    typeRolls: [10, 20, 55],

    maxSpawnersPerTick: 10,
    spawnDelay: 0.1,
    spawnerSelfDestructDelay: 0.7
};

// Source: mods/Skirmish/Skirmish.ts:2683-2719
function rollLootItem(config: { rarityBonus: number, weaponBias: number }): any {
    // Roll rarity with zone bonus
    let rarityRoll = Math.random() * 100 + config.rarityBonus;
    const rarity = LOOT_CONFIG.rarityRolls.findIndex(threshold => rarityRoll < threshold);
    const rarityIndex = rarity === -1 ? LOOT_CONFIG.rarityRolls.length - 1 : rarity;

    // Roll item type with weapon bias
    let typeRoll = Math.random() * 100 + config.weaponBias;

    let selectedPool: any[] | null = null;

    if (typeRoll < LOOT_CONFIG.typeRolls[0]) {
        // Primary weapons
        selectedPool = LOOT_POOLS.weapons.primary;
    } else if (typeRoll < LOOT_CONFIG.typeRolls[1]) {
        // Secondary weapons
        selectedPool = LOOT_POOLS.weapons.secondary;
    } else if (typeRoll < LOOT_CONFIG.typeRolls[2]) {
        // Gadgets
        selectedPool = Math.random() < 0.5
            ? LOOT_POOLS.gadgets.throwables
            : LOOT_POOLS.gadgets.equipment;
    } else {
        // Ammo
        selectedPool = LOOT_POOLS.ammo;
    }

    // Get item from rarity tier
    const tierPool = selectedPool[rarityIndex] || selectedPool[selectedPool.length - 1];
    return tierPool[Math.floor(Math.random() * tierPool.length)];
}
```

### Zone-Based Loot Distribution

```typescript
// Source: mods/Skirmish/Skirmish.ts:2198-2230 (coordinates structure)
// Source: mods/Skirmish/Skirmish.ts:2582-2658 (spawning logic)

// Loot zones define spawn areas
interface LootZone {
    x: number;
    y: number;
    z: number;
    radius: number;
}

const LOOT_ZONES: LootZone[] = [
    { x: -342.26, y: 189.8, z: -555.58, radius: 1.65 },
    { x: -331.45, y: 190.9, z: -563.91, radius: 1.65 },
    // ... more zones
];

async function setupSpawnersAndSpawnLoot(): Promise<void> {
    let totalSpawners = 0;

    for (const zone of LOOT_ZONES) {
        // Calculate spawners based on zone size
        const spawnerCount = Math.min(
            Math.max(Math.floor(zone.radius * LOOT_CONFIG.spawnerDensity), LOOT_CONFIG.minSpawnersPerZone),
            LOOT_CONFIG.maxSpawnersPerZone
        );

        for (let i = 0; i < spawnerCount; i++) {
            // Generate random position within zone
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * zone.radius;
            const x = zone.x + Math.cos(angle) * distance;
            const z = zone.z + Math.sin(angle) * distance;

            // Spawn the loot spawner
            const spawnerObj = mod.SpawnObject(
                mod.RuntimeSpawn_Common.LootSpawner,
                mod.CreateVector(x, zone.y, z),
                mod.CreateVector(0, Math.random() * 360, 0),
                mod.CreateVector(1, 1, 1)
            );

            const spawnerId = mod.GetObjId(spawnerObj);
            totalSpawners++;

            // Roll and spawn loot
            const item = rollLootItem({ rarityBonus: 0, weaponBias: 0 });
            if (item) {
                try {
                    const lootSpawner = mod.GetLootSpawner(spawnerId);
                    mod.SpawnLoot(lootSpawner, item);
                } catch (error) {
                    console.log("Error spawning loot:", error);
                }
            }

            // Cleanup spawner after delay
            cleanupSpawnerAsync(spawnerObj);

            // Rate limiting
            if (totalSpawners % LOOT_CONFIG.maxSpawnersPerTick === 0) {
                await mod.Wait(LOOT_CONFIG.spawnDelay);
            }
        }
    }

    console.log(`Loot system initialized: ${totalSpawners} spawners created`);
}

async function cleanupSpawnerAsync(spawnerObj: mod.Object): Promise<void> {
    await mod.Wait(LOOT_CONFIG.spawnerSelfDestructDelay);
    try {
        mod.UnspawnObject(spawnerObj);
    } catch (error) {
        console.log("Error unspawning spawner:", error);
    }
}
```

---

## Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `GetLootSpawner` | `(number: number): LootSpawner` | Get spawner by ID |
| `SpawnLoot` | `(spawner: LootSpawner, weapon: Weapons): void` | Spawn weapon pickup |
| `SpawnLoot` | `(spawner: LootSpawner, gadget: Gadgets): void` | Spawn gadget pickup |
| `SpawnLoot` | `(spawner: LootSpawner, ammo: AmmoTypes): void` | Spawn ammo pickup |
| `SpawnLoot` | `(spawner: LootSpawner, armor: ArmorTypes): void` | Spawn armor pickup |
| `SpawnObject` | `(type: RuntimeSpawn, pos: Vector, rot: Vector, scale: Vector): Object` | Create runtime object |
| `UnspawnObject` | `(object: Object): void` | Remove object from world |
| `GetObjId` | `(object: Object): number` | Get object's unique ID |

### AmmoTypes Enum

```typescript
export enum AmmoTypes {
    AR_Carbine_Ammo,   // Assault rifles, carbines
    Armor_Plate,       // Armor repair plates
    LMG_Ammo,          // Light machine guns
    Pistol_SMG_Ammo,   // Pistols, SMGs
    Shotgun_Ammo,      // Shotguns
    Sniper_DMR_Ammo,   // Snipers, DMRs
}
```

### ArmorTypes Enum

```typescript
export enum ArmorTypes {
    CeramicArmor,  // Heavy armor (better protection)
    NoArmor,       // Remove armor
    SoftArmor,     // Light armor
}
```

---

## Constraints & Gotchas

1. **Spawner Cleanup**: LootSpawners should be cleaned up after loot is placed to prevent object limit issues:
   ```typescript
   await mod.Wait(0.7);  // Allow time for loot to spawn
   mod.UnspawnObject(spawnerObj);
   ```

2. **Rate Limiting**: Spawning many loot items at once can cause performance issues. Use delays:
   ```typescript
   if (totalSpawners % 10 === 0) {
       await mod.Wait(0.1);
   }
   ```

3. **Error Handling**: Wrap SpawnLoot calls in try-catch as spawner IDs can become invalid:
   ```typescript
   try {
       mod.SpawnLoot(lootSpawner, item);
   } catch (error) {
       console.log("Error spawning loot:", error);
   }
   ```

4. **Godot Spawners**: Pre-placed spawners in Godot use sequential IDs starting from 1. Use `mod.GetLootSpawner(1)`, `mod.GetLootSpawner(2)`, etc.

5. **Item Stacking**: Multiple items can be spawned at the same spawner, but they will overlap visually.

---

## Integration with Other Patterns

- **Ring of Fire** (`patterns/gameplay/ring-of-fire.md`): Coordinate loot zones with ring positions
- **Economy** (`patterns/gameplay/economy.md`): Price-based loot at buy stations
- **Equipment** (`patterns/player/equipment.md`): Alternative to loot for loadout management
- **Objects** (`patterns/spatial/objects.md`): RuntimeSpawn_Common for spawner creation
