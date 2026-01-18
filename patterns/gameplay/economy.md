# Pattern: Economy System
> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: mods/BombSquad/BombSquad.ts:22, 80-85, 534-536, 770-773, 905, 1177-1185, 2267-2290, 2364-2429

## What This Does

An economy system tracks currency (cash/money) per player, awards it for gameplay actions, and allows spending on items. This pattern is commonly used in round-based modes like Counter-Strike style bomb defusal.

**Key insight**: The Portal SDK does not have built-in economy functions. You must implement economy as JavaScript/TypeScript state tracking in your mod code.

---

## Core Pattern

### 1. Define Economy Constants

```typescript
// Starting cash for each player
let initialCash = 800;

// Rewards for various actions
const roundWinReward: number = 2400;
const roundLoseReward: number = 1200;
const killReward: number = 300;
const defuseReward: number = 1000;
const plantReward: number = 800;
```

### 2. Track Cash Per Player

Use a custom player class to store per-player state:

```typescript
class JsPlayer {
    player: mod.Player;
    playerId: number;
    cash: number = initialCash;

    // Stats tracking
    kills: number = 0;
    deaths: number = 0;
    totalCashEarned: number = 0;

    // Map of mod.Player to JsPlayer
    static playerInstances: mod.Player[] = [];
    static jsPlayerMap: Map<number, JsPlayer> = new Map();

    constructor(player: mod.Player) {
        this.player = player;
        this.playerId = mod.GetObjId(player);
        JsPlayer.playerInstances.push(this.player);
        JsPlayer.jsPlayerMap.set(this.playerId, this);
    }

    // Get JsPlayer from mod.Player
    static get(player: mod.Player): JsPlayer | undefined {
        return JsPlayer.jsPlayerMap.get(mod.GetObjId(player));
    }
}
```

### 3. Initialize Player Economy on Join

```typescript
export function OnPlayerJoinGame(eventPlayer: mod.Player): void {
    // Create tracking object for this player
    new JsPlayer(eventPlayer);
}
```

### 4. Award Kill Rewards

```typescript
export function OnPlayerEarnedKill(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
): void {
    let jsPlayer = JsPlayer.get(eventPlayer);
    if (jsPlayer) {
        jsPlayer.cash += killReward;
        jsPlayer.kills++;
        jsPlayer.totalCashEarned += killReward;

        // Update UI to show new cash amount
        updateWalletUI(jsPlayer);
    }
}
```

### 5. Award Round End Rewards

```typescript
function awardRoundEndMoney(winningTeam: mod.Team): void {
    JsPlayer.playerInstances.forEach(player => {
        let jsPlayer = JsPlayer.get(player);
        if (!jsPlayer) return;

        let playerTeam = mod.GetTeam(player);
        let isWinner = mod.GetObjId(playerTeam) === mod.GetObjId(winningTeam);

        if (isWinner) {
            jsPlayer.cash += roundWinReward;
            jsPlayer.totalCashEarned += roundWinReward;
        } else {
            jsPlayer.cash += roundLoseReward;
            jsPlayer.totalCashEarned += roundLoseReward;
        }
    });
}
```

### 6. Reset Cash on Match Start/New Half

```typescript
function resetAllPlayerCash(): void {
    JsPlayer.playerInstances.forEach(player => {
        let jsPlayer = JsPlayer.get(player);
        if (jsPlayer) {
            jsPlayer.cash = initialCash;
        }
    });
}
```

### 7. Purchase Validation

```typescript
function canAfford(player: mod.Player, itemCost: number): boolean {
    let jsPlayer = JsPlayer.get(player);
    return jsPlayer ? jsPlayer.cash >= itemCost : false;
}

function purchaseItem(player: mod.Player, itemCost: number): boolean {
    let jsPlayer = JsPlayer.get(player);
    if (!jsPlayer || jsPlayer.cash < itemCost) {
        return false;
    }

    jsPlayer.cash -= itemCost;
    updateWalletUI(jsPlayer);
    return true;
}
```

---

## Display Wallet UI

```typescript
function updateWalletUI(jsPlayer: JsPlayer): void {
    if (jsPlayer.playerwalletWidget) {
        // Update existing widget
        mod.SetUITextLabel(
            jsPlayer.playerwalletWidget,
            mod.Message('playerwallet', jsPlayer.cash)  // Uses string formatting
        );
    }
}

// String in .strings.json:
// "playerwallet": "${0}"
// This formats the cash value into the display
```

---

## Full Working Example: Player Class with Economy

From BombSquad.ts:1173-1220 (simplified):

```typescript
class JsPlayer {
    player: mod.Player;
    playerId: number;
    cash: number = initialCash;

    kills: number = 0;
    deaths: number = 0;
    totalCashEarned: number = 0;

    isDeployed: boolean = false;
    hasDeployed: boolean = false;

    playerwalletWidget: mod.UIWidget | undefined;

    static playerInstances: mod.Player[] = [];

    constructor(player: mod.Player) {
        this.player = player;
        this.playerId = mod.GetObjId(player);
        JsPlayer.playerInstances.push(this.player);

        // Only create UI for human players
        if (!mod.GetSoldierState(player, mod.SoldierStateBool.IsAISoldier)) {
            this.createWalletUI();
        }
    }

    static get(player: mod.Player): JsPlayer | undefined {
        let playerId = mod.GetObjId(player);
        // Find matching player in instances
        for (let p of JsPlayer.playerInstances) {
            if (mod.GetObjId(p) === playerId) {
                // Return the JsPlayer for this player
                // Implementation depends on your tracking method
            }
        }
        return undefined;
    }

    createWalletUI(): void {
        // Create wallet display widget
        mod.AddUIText(
            "wallet_" + this.playerId,
            mod.CreateVector(10, -50, 0),
            mod.CreateVector(200, 40, 1),
            mod.UIAnchor.BottomLeft,
            mod.Message('playerwallet', this.cash),
            this.player
        );
        this.playerwalletWidget = mod.FindUIWidgetWithName("wallet_" + this.playerId);
    }

    updateWalletUI(): void {
        if (this.playerwalletWidget) {
            mod.SetUITextLabel(
                this.playerwalletWidget,
                mod.Message('playerwallet', this.cash)
            );
        }
    }
}
```

---

## Constraints

1. **No built-in economy**: All currency tracking is custom code
2. **Persistent tracking**: Use a class or Map to track player state across events
3. **AI check**: Don't create UI for AI soldiers - `mod.GetSoldierState(player, mod.SoldierStateBool.IsAISoldier)`
4. **Player ID**: Use `mod.GetObjId(player)` as unique identifier
5. **String formatting**: Use `mod.Message('key', value1, value2)` to format currency displays
6. **Round boundaries**: Decide when to reset/preserve cash (new rounds, halves, matches)

---

## Related Patterns

- [rounds.md](rounds.md) - Round-based game flow
- [../ui/widgets.md](../ui/widgets.md) - Creating wallet display UI
- [../core/event-hooks.md](../core/event-hooks.md) - Kill event for rewards
