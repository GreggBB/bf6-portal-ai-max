/**
 * Random Spawn Demo
 *
 * A simple mod that teleports players to random locations when they spawn.
 *
 * Built using ONLY verified patterns from the SDK pattern library.
 *
 * Pattern sources:
 * - patterns/core/event-hooks.md (OnPlayerDeployed, OnGameModeStarted)
 * - patterns/core/game-lifecycle.md (CreateVector, Teleport, Wait)
 */

// Define spawn locations as vectors
// Pattern: game-lifecycle.md - CreateVector usage
const SPAWN_LOCATIONS: mod.Vector[] = [
    mod.CreateVector(100, 0, 100),
    mod.CreateVector(150, 0, 100),
    mod.CreateVector(100, 0, 150),
    mod.CreateVector(150, 0, 150),
    mod.CreateVector(125, 0, 125),
];

// Pattern: event-hooks.md - OnGameModeStarted
// Game initialization
export async function OnGameModeStarted() {
    // Pattern: game-lifecycle.md - DisplayNotificationMessage
    const welcomeMessage = mod.Message('welcome');
    mod.DisplayNotificationMessage(welcomeMessage);

    // Enable the default HQ for spawning
    // Pattern: game-lifecycle.md - GetHQ, EnableHQ
    const hq = mod.GetHQ(0);
    mod.EnableHQ(hq, true);
}

// Pattern: event-hooks.md - OnPlayerDeployed
// Called when player spawns into the game
export function OnPlayerDeployed(eventPlayer: mod.Player): void {
    // Get a random spawn location
    const randomIndex = Math.floor(Math.random() * SPAWN_LOCATIONS.length);
    const spawnLocation = SPAWN_LOCATIONS[randomIndex];

    // Pattern: game-lifecycle.md - Teleport
    // Teleport to random location, facing forward (0 radians)
    mod.Teleport(eventPlayer, spawnLocation, 0);

    // Pattern: game-lifecycle.md - DisplayNotificationMessage with target
    const spawnMessage = mod.Message('spawned');
    mod.DisplayNotificationMessage(spawnMessage, eventPlayer);
}

// Pattern: event-hooks.md - OnPlayerDied
// Track deaths
export function OnPlayerDied(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
): void {
    // Log death (visible in PortalLog.txt)
    console.log("Player died, will spawn at random location");
}

// Required strings for .strings.json:
// {
//     "welcome": "Random Spawn Mode Active!",
//     "spawned": "Teleported to random location!"
// }
