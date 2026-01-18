# Pattern: Variable Chasing

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: code/mod/index.d.ts:22706-22712, 23697, 23700, 22226

---

## Overview

Variable chasing provides built-in interpolation for game variables. Instead of manually animating values each tick, you can tell the SDK to gradually change a variable to a target value either at a fixed rate or over a set duration.

This is useful for smooth animations, gradual progress bars, timed countdowns, and any value that should change smoothly over time.

---

## Core Concepts

**Variable**: An SDK-managed value container accessed by index. Use `GlobalVariable(index)` to get a reference.

**Chasing**: Automatic interpolation from current value to target value.

---

## Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `GlobalVariable` | `(variableIndex: number): Variable` | Get a variable by index |
| `GetVariable` | `(variable: Variable): Any` | Get current value |
| `SetVariable` | `(variable: Variable, value: Any): void` | Set value immediately |
| `ChaseVariableAtRate` | `(variable: Variable, limit: number, deltaPerSecond: number): void` | Chase at fixed rate |
| `ChaseVariableOverTime` | `(variable: Variable, limit: number, durationSeconds: number): void` | Chase over duration |
| `StopChasingVariable` | `(variable: Variable): void` | Stop chasing, keep current value |

---

## Working Code

### Basic Variable Setup

```typescript
// Get a global variable reference (index 0-based)
const progressVar = mod.GlobalVariable(0);

// Set initial value
mod.SetVariable(progressVar, 0);

// Read current value
const currentValue = mod.GetVariable(progressVar);
```

### Chase at Fixed Rate

```typescript
// Variable will increase/decrease by deltaPerSecond until it reaches limit
const healthVar = mod.GlobalVariable(1);

// Set initial health
mod.SetVariable(healthVar, 100);

// Drain health at 10 units per second until it reaches 0
mod.ChaseVariableAtRate(healthVar, 0, 10);

// Regenerate health at 5 units per second until it reaches 100
mod.ChaseVariableAtRate(healthVar, 100, 5);
```

### Chase Over Duration

```typescript
// Variable will reach limit after exactly durationSeconds
const timerVar = mod.GlobalVariable(2);

// Set to 60 (seconds)
mod.SetVariable(timerVar, 60);

// Count down to 0 over 60 seconds (real-time countdown)
mod.ChaseVariableOverTime(timerVar, 0, 60);

// Or fill a progress bar from 0 to 100 over 10 seconds
mod.SetVariable(timerVar, 0);
mod.ChaseVariableOverTime(timerVar, 100, 10);
```

### Stop Chasing

```typescript
const animVar = mod.GlobalVariable(3);

// Start animation
mod.ChaseVariableOverTime(animVar, 100, 5);

// Later, stop mid-animation (keeps current value)
mod.StopChasingVariable(animVar);
```

### Progress Bar Animation

```typescript
class ProgressBarSystem {
    private progressVar: mod.Variable;

    constructor(variableIndex: number) {
        this.progressVar = mod.GlobalVariable(variableIndex);
        mod.SetVariable(this.progressVar, 0);
    }

    // Fill to target over duration
    fillTo(targetPercent: number, durationSeconds: number): void {
        mod.ChaseVariableOverTime(this.progressVar, targetPercent, durationSeconds);
    }

    // Fill at fixed rate
    fillAtRate(targetPercent: number, percentPerSecond: number): void {
        mod.ChaseVariableAtRate(this.progressVar, targetPercent, percentPerSecond);
    }

    // Get current progress
    getCurrent(): number {
        return mod.GetVariable(this.progressVar) as number;
    }

    // Reset to 0
    reset(): void {
        mod.StopChasingVariable(this.progressVar);
        mod.SetVariable(this.progressVar, 0);
    }

    // Pause animation
    pause(): void {
        mod.StopChasingVariable(this.progressVar);
    }
}

// Usage
const captureProgress = new ProgressBarSystem(0);
captureProgress.fillTo(100, 30); // Fill to 100% over 30 seconds
```

### Capture Point Progress

```typescript
const CAPTURE_VAR_INDEX = 10;

function startCapture(durationSeconds: number): void {
    const captureVar = mod.GlobalVariable(CAPTURE_VAR_INDEX);
    mod.SetVariable(captureVar, 0);
    mod.ChaseVariableOverTime(captureVar, 100, durationSeconds);
}

function cancelCapture(): void {
    const captureVar = mod.GlobalVariable(CAPTURE_VAR_INDEX);
    mod.StopChasingVariable(captureVar);
    // Optionally decay back to 0
    mod.ChaseVariableAtRate(captureVar, 0, 10); // Decay at 10% per second
}

function getCaptureProgress(): number {
    const captureVar = mod.GlobalVariable(CAPTURE_VAR_INDEX);
    return mod.GetVariable(captureVar) as number;
}
```

### Countdown Timer

```typescript
const TIMER_VAR_INDEX = 20;

function startCountdown(seconds: number): void {
    const timerVar = mod.GlobalVariable(TIMER_VAR_INDEX);
    mod.SetVariable(timerVar, seconds);
    mod.ChaseVariableOverTime(timerVar, 0, seconds);
}

function getRemainingTime(): number {
    const timerVar = mod.GlobalVariable(TIMER_VAR_INDEX);
    return mod.GetVariable(timerVar) as number;
}

function pauseCountdown(): void {
    const timerVar = mod.GlobalVariable(TIMER_VAR_INDEX);
    mod.StopChasingVariable(timerVar);
}

function resumeCountdown(): void {
    const timerVar = mod.GlobalVariable(TIMER_VAR_INDEX);
    const remaining = mod.GetVariable(timerVar) as number;
    mod.ChaseVariableOverTime(timerVar, 0, remaining);
}
```

### Smooth Value Transitions

```typescript
// Smoothly transition any numeric value
function smoothTransition(
    variableIndex: number,
    targetValue: number,
    durationSeconds: number
): void {
    const variable = mod.GlobalVariable(variableIndex);
    mod.ChaseVariableOverTime(variable, targetValue, durationSeconds);
}

// Example: Smooth camera FOV change
const FOV_VAR = mod.GlobalVariable(30);
mod.SetVariable(FOV_VAR, 90); // Normal FOV
smoothTransition(30, 60, 0.5); // Zoom to 60 FOV over 0.5 seconds
```

### Ring Shrink Animation (BR Style)

```typescript
const RING_RADIUS_VAR = mod.GlobalVariable(40);

function initializeRing(startRadius: number): void {
    mod.SetVariable(RING_RADIUS_VAR, startRadius);
}

function shrinkRing(targetRadius: number, shrinkDuration: number): void {
    mod.ChaseVariableOverTime(RING_RADIUS_VAR, targetRadius, shrinkDuration);
}

function getCurrentRingRadius(): number {
    return mod.GetVariable(RING_RADIUS_VAR) as number;
}

// Usage
initializeRing(500);
// Later...
shrinkRing(300, 60); // Shrink to 300 over 60 seconds
```

---

## Variable Index Management

Keep track of which variable indices you're using:

```typescript
// Variable index constants
const VAR = {
    CAPTURE_PROGRESS: 0,
    ROUND_TIMER: 1,
    TEAM1_SCORE: 2,
    TEAM2_SCORE: 3,
    RING_RADIUS: 4,
    // ... etc
};

// Usage
const captureVar = mod.GlobalVariable(VAR.CAPTURE_PROGRESS);
```

---

## Constraints & Gotchas

1. **Index-Based Access**: Variables are accessed by numeric index. Keep track of which indices you use.

2. **Single Chase Per Variable**: Starting a new chase on a variable replaces any existing chase.

3. **Linear Interpolation**: Chasing is linear - no easing functions. For eased animations, implement custom logic.

4. **No Completion Callback**: There's no event when chasing completes. Poll the value or calculate expected completion time:
   ```typescript
   // If you need to know when done
   mod.ChaseVariableOverTime(myVar, 100, 10);
   await mod.Wait(10); // Wait for chase to complete
   // Now at 100
   ```

5. **Value Type**: Variables can hold `Any` type, but chasing only works with numbers.

6. **Rate vs Time**:
   - `ChaseVariableAtRate`: Speed is constant, duration varies with distance
   - `ChaseVariableOverTime`: Duration is constant, speed varies with distance

7. **Stopping Preserves Value**: `StopChasingVariable` keeps the current interpolated value, it doesn't reset.

---

## Use Cases

- **Progress bars** - Capture points, loading, objectives
- **Timers** - Countdown displays, round timers
- **Health/damage systems** - Smooth health changes
- **Score animations** - Smooth score increases
- **Zone mechanics** - BR ring shrinking
- **Smooth transitions** - Any value that should animate

---

## Integration with Other Patterns

- [../ui/widgets.md](../ui/widgets.md) - Display variable values in UI
- [../gameplay/capture-points.md](../gameplay/capture-points.md) - Capture progress
- [../gameplay/ring-of-fire.md](../gameplay/ring-of-fire.md) - Ring size animation
- [../gameplay/scoring.md](../gameplay/scoring.md) - Score transitions
