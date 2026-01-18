# Pattern: World Icons

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: mods/Skirmish/Skirmish.ts:105-117, 3315-3382

---

## Overview

World Icons are 3D markers visible in the game world - objective markers, waypoints, warnings, team indicators. They can be placed in Godot or spawned at runtime, then configured with images, colors, text, and visibility per team/player.

---

## Core Concepts

### Getting World Icons

World Icons can be:
1. **Pre-placed in Godot** - Retrieved by index number
2. **Spawned at runtime** - Created dynamically using `SpawnObject`

```typescript
// Get a pre-placed WorldIcon by index (0-based, set in Godot editor)
const icon = mod.GetWorldIcon(0);

// Spawn a WorldIcon at runtime
const spawnedIcon = mod.SpawnObject(
    mod.RuntimeSpawn_Common.WorldIcon,
    mod.CreateVector(x, y, z),    // Position
    mod.CreateVector(0, 0, 0),    // Rotation
    mod.CreateVector(1, 1, 1)     // Scale
);
// Convert spawned object to WorldIcon reference
const worldIcon = mod.GetWorldIcon(mod.GetObjId(spawnedIcon));
```

---

## Working Code Examples

### Basic Team-Bound Icons
> Source: mods/Skirmish/Skirmish.ts:105-117

```typescript
function EnableBuyWorldIcons(enable: boolean) {
    // Bind world icons to specific teams (only that team sees the icon)
    mod.SetWorldIconOwner(mod.GetWorldIcon(0), mod.GetTeam(1));
    mod.SetWorldIconOwner(mod.GetWorldIcon(1), mod.GetTeam(2));
    mod.SetWorldIconOwner(mod.GetWorldIcon(2), mod.GetTeam(3));
    mod.SetWorldIconOwner(mod.GetWorldIcon(3), mod.GetTeam(4));

    // Show/hide the icons
    mod.EnableWorldIconImage(mod.GetWorldIcon(0), enable);
    mod.EnableWorldIconImage(mod.GetWorldIcon(1), enable);
    mod.EnableWorldIconImage(mod.GetWorldIcon(2), enable);
    mod.EnableWorldIconImage(mod.GetWorldIcon(3), enable);
}
```

### Dynamic Icon Creation (Ring of Fire Example)
> Source: mods/Skirmish/Skirmish.ts:3315-3352

```typescript
class RingIconManager {
    static ringIconObjects: any[] = [];

    static CreateRingIcons(iconCount: number) {
        for (let i = 0; i < iconCount; i++) {
            try {
                // Spawn a WorldIcon dynamically
                const worldIconObj = mod.SpawnObject(
                    mod.RuntimeSpawn_Common.WorldIcon,
                    mod.CreateVector(0, 0, 0), // Initial position
                    mod.CreateVector(0, 0, 0),
                    mod.CreateVector(1, 1, 1)
                );

                // Configure the icon
                const objectId = mod.GetObjId(worldIconObj);
                const worldIcon = mod.GetWorldIcon(objectId);
                mod.SetWorldIconImage(worldIcon, mod.WorldIconImages.Hazard);
                mod.SetWorldIconColor(worldIcon, mod.CreateVector(1, 0.2, 0)); // Orange/red
                mod.EnableWorldIconImage(worldIcon, true);
                mod.EnableWorldIconText(worldIcon, false);

                this.ringIconObjects.push(worldIconObj);
            } catch (error) {
                // Fallback: use pre-placed icons if spawning fails
                const customIconId = 400 + (i % 8);
                const customIconObj = mod.GetWorldIcon(customIconId);
                if (customIconObj) {
                    mod.SetWorldIconImage(customIconObj, mod.WorldIconImages.Hazard);
                    mod.SetWorldIconColor(customIconObj, mod.CreateVector(1, 0.2, 0));
                    mod.EnableWorldIconImage(customIconObj, true);
                    mod.EnableWorldIconText(customIconObj, false);
                    this.ringIconObjects.push(customIconObj);
                }
            }
        }
    }

    static UpdateIconPositions(centerPos: mod.Vector, radius: number) {
        const iconCount = this.ringIconObjects.length;
        for (let i = 0; i < iconCount; i++) {
            const angle = (i / iconCount) * 2 * Math.PI;
            const x = mod.XComponentOf(centerPos) + Math.cos(angle) * radius;
            const y = mod.YComponentOf(centerPos);
            const z = mod.ZComponentOf(centerPos) + Math.sin(angle) * radius;
            const iconPosition = mod.CreateVector(x, y, z);

            try {
                const iconObject = this.ringIconObjects[i];
                // For spawned objects, get WorldIcon from object ID
                const objectId = mod.GetObjId(iconObject);
                const worldIcon = mod.GetWorldIcon(objectId);
                mod.SetWorldIconPosition(worldIcon, iconPosition);
            } catch (error) {
                // For pre-placed icons, update directly
                mod.SetWorldIconPosition(this.ringIconObjects[i], iconPosition);
            }
        }
    }

    static ClearRingIcons() {
        this.ringIconObjects.forEach(iconObject => {
            try {
                // For spawned objects, unspawn them
                mod.UnspawnObject(iconObject);
            } catch (error) {
                // For pre-placed icons, just hide them
                mod.EnableWorldIconImage(iconObject, false);
            }
        });
        this.ringIconObjects = [];
    }
}
```

### Player-Specific Icon Visibility

```typescript
// Show icon only to a specific player
function ShowIconToPlayer(iconIndex: number, player: mod.Player) {
    const icon = mod.GetWorldIcon(iconIndex);
    mod.SetWorldIconOwner(icon, player);
    mod.EnableWorldIconImage(icon, true);
}

// Show icon only to a specific team
function ShowIconToTeam(iconIndex: number, teamIndex: number) {
    const icon = mod.GetWorldIcon(iconIndex);
    mod.SetWorldIconOwner(icon, mod.GetTeam(teamIndex));
    mod.EnableWorldIconImage(icon, true);
}
```

### Icon with Text Label

```typescript
function CreateLabeledIcon(iconIndex: number, position: mod.Vector, labelKey: string) {
    const icon = mod.GetWorldIcon(iconIndex);
    mod.SetWorldIconPosition(icon, position);
    mod.SetWorldIconImage(icon, mod.WorldIconImages.Flag);
    mod.SetWorldIconText(icon, mod.Message(labelKey));
    mod.SetWorldIconColor(icon, mod.CreateVector(0, 1, 0)); // Green
    mod.EnableWorldIconImage(icon, true);
    mod.EnableWorldIconText(icon, true);
}
```

---

## Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `GetWorldIcon` | `(worldIconNumber: number): WorldIcon` | Get a WorldIcon by index |
| `SetWorldIconImage` | `(worldIcon: WorldIcon, newImage: WorldIconImages): void` | Set the icon graphic |
| `SetWorldIconColor` | `(worldIcon: WorldIcon, newColor: Vector): void` | Set icon color (RGB 0-1) |
| `SetWorldIconPosition` | `(worldIcon: WorldIcon, newPosition: Vector): void` | Move icon in 3D space |
| `SetWorldIconText` | `(worldIcon: WorldIcon, newText: Message): void` | Set text label |
| `SetWorldIconOwner` | `(worldIcon: WorldIcon, newTeamOwner: Team): void` | Visible only to team |
| `SetWorldIconOwner` | `(worldIcon: WorldIcon, newPlayerOwner: Player): void` | Visible only to player |
| `EnableWorldIconImage` | `(worldIcon: WorldIcon, enableImage: boolean): void` | Show/hide icon graphic |
| `EnableWorldIconText` | `(worldIcon: WorldIcon, enableText: boolean): void` | Show/hide text label |

---

## Available Icon Images

```typescript
mod.WorldIconImages.Alert        // Warning/attention
mod.WorldIconImages.Assist       // Assist marker
mod.WorldIconImages.Bomb         // Bomb icon
mod.WorldIconImages.BombArmed    // Armed bomb
mod.WorldIconImages.Cross        // X mark
mod.WorldIconImages.DangerPing   // Danger indicator
mod.WorldIconImages.Diffuse      // Defuse marker
mod.WorldIconImages.EMP          // EMP indicator
mod.WorldIconImages.Explosion    // Explosion marker
mod.WorldIconImages.Eye          // Vision/watch marker
mod.WorldIconImages.FilledPing   // Filled ping marker
mod.WorldIconImages.Flag         // Flag/objective
mod.WorldIconImages.Hazard       // Hazard warning
mod.WorldIconImages.Skull        // Death/danger
mod.WorldIconImages.SquadPing    // Squad ping
mod.WorldIconImages.Triangle     // Triangle marker
```

---

## Icon Color Examples

Colors use RGB vectors with values from 0-1:

```typescript
// Common colors
const RED = mod.CreateVector(1, 0, 0);
const GREEN = mod.CreateVector(0, 1, 0);
const BLUE = mod.CreateVector(0, 0, 1);
const YELLOW = mod.CreateVector(1, 1, 0);
const ORANGE = mod.CreateVector(1, 0.5, 0);
const PURPLE = mod.CreateVector(0.5, 0, 1);
const WHITE = mod.CreateVector(1, 1, 1);
const CYAN = mod.CreateVector(0, 1, 1);

mod.SetWorldIconColor(icon, ORANGE);
```

---

## Constraints & Gotchas

1. **Godot Placement Required for Pre-placed Icons**: To use `GetWorldIcon(index)`, the WorldIcon must be placed in the Godot editor first. The index corresponds to the order/ID assigned in Godot.

2. **Runtime Spawning Returns Object, Not WorldIcon**: When using `SpawnObject(RuntimeSpawn_Common.WorldIcon, ...)`, you get a generic object. Convert it with `GetWorldIcon(GetObjId(object))`.

3. **Owner Determines Visibility**: If you set an owner (team or player), only that team/player sees the icon. To make it visible to everyone, don't set an owner.

4. **Text Requires .strings.json**: The text label uses `mod.Message(key)` which requires the key in your `.strings.json` file.

5. **Icon Limits**: There may be engine limits on total active WorldIcons. The Skirmish mod handles this with fallback logic.

---

## Godot Setup

To use pre-placed WorldIcons:

1. In Godot, add `WorldIcon.tscn` from `res://objects/Gameplay/Common/`
2. Position it in your scene
3. Note the index number (order in scene tree)
4. Reference with `mod.GetWorldIcon(index)` in code

---

## Related Patterns

- [area-triggers.md](area-triggers.md) - Often used with area triggers for objective markers
- [objects.md](objects.md) - General object spawning (WorldIcon is one spawnable type)
