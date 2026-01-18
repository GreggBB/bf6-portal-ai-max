# Pattern: UI Widgets
> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: code/mod/index.d.ts:23094-23534, mods/BombSquad/BombSquad.ts:3427-3657

## What This Does

The UI system allows you to create custom on-screen widgets including containers, text, images, and buttons. Widgets can be nested (parent-child), styled, and shown to specific players or teams.

---

## Core UI Functions

### Creating Widgets

| Function | Purpose |
|----------|---------|
| `mod.AddUIContainer` | Create a container (parent for other widgets) |
| `mod.AddUIText` | Create text display |
| `mod.AddUIImage` | Create an image |
| `mod.AddUIButton` | Create a clickable button |
| `mod.AddUIWeaponImage` | Create weapon image |
| `mod.AddUIGadgetImage` | Create gadget image |

### Managing Widgets

| Function | Signature | Purpose |
|----------|-----------|---------|
| `mod.FindUIWidgetWithName` | `(name: string, parent?: UIWidget): UIWidget` | Find widget by name |
| `mod.SetUIWidgetName` | `(widget: UIWidget, name: string): void` | Rename widget |
| `mod.DeleteUIWidget` | `(widget: UIWidget): void` | Delete a widget |
| `mod.DeleteAllUIWidgets` | `(): void` | Delete all widgets |
| `mod.GetUIWidgetName` | `(widget: UIWidget): string` | Get widget name |

### Styling Widgets

| Function | Signature | Purpose |
|----------|-----------|---------|
| `mod.SetUIWidgetBgColor` | `(widget: UIWidget, color: Vector): void` | Set background color |
| `mod.SetUIWidgetBgAlpha` | `(widget: UIWidget, alpha: number): void` | Set background transparency |
| `mod.SetUIWidgetBgFill` | `(widget: UIWidget, fill: UIBgFill): void` | Set fill mode |
| `mod.SetUITextColor` | `(widget: UIWidget, color: Vector): void` | Set text color |
| `mod.SetUITextSize` | `(widget: UIWidget, size: number): void` | Set text size |
| `mod.SetUITextAnchor` | `(widget: UIWidget, anchor: UIAnchor): void` | Set text alignment |
| `mod.SetUIText` | `(widget: UIWidget, message: Message): void` | Set text content |

---

## Enums

### UIAnchor
Position anchors for widget placement:
```typescript
mod.UIAnchor.TopLeft
mod.UIAnchor.TopCenter
mod.UIAnchor.TopRight
mod.UIAnchor.CenterLeft
mod.UIAnchor.Center
mod.UIAnchor.CenterRight
mod.UIAnchor.BottomLeft
mod.UIAnchor.BottomCenter
mod.UIAnchor.BottomRight
```

### UIBgFill
Background fill modes:
```typescript
mod.UIBgFill.Solid
mod.UIBgFill.None
// Check index.d.ts for full list
```

### UIImageType
Built-in image types:
```typescript
mod.UIImageType.None
mod.UIImageType.Circle
// Check index.d.ts for full list
```

---

## Function Signatures (Most Common Overloads)

### AddUIContainer

```typescript
// Simple - global visibility
mod.AddUIContainer(
    name: string,           // Unique widget name
    position: Vector,       // X, Y, Z position (Z often 0)
    size: Vector,           // Width, Height, Depth (Depth often 1)
    anchor: UIAnchor        // Position anchor
): void;

// With styling - global visibility
mod.AddUIContainer(
    name: string,
    position: Vector,
    size: Vector,
    anchor: UIAnchor,
    parent: UIWidget,       // Parent container (or null for root)
    visible: boolean,       // Initially visible?
    padding: number,        // Internal padding
    bgColor: Vector,        // Background RGB (0-1 range)
    bgAlpha: number,        // Background transparency (0-1)
    bgFill: UIBgFill        // Fill mode
): void;

// With styling - restricted visibility
mod.AddUIContainer(
    name: string,
    position: Vector,
    size: Vector,
    anchor: UIAnchor,
    parent: UIWidget,
    visible: boolean,
    padding: number,
    bgColor: Vector,
    bgAlpha: number,
    bgFill: UIBgFill,
    receiver: Player | Team  // Who can see this widget
): void;
```

### AddUIText

```typescript
// Simple
mod.AddUIText(
    name: string,
    position: Vector,
    size: Vector,
    anchor: UIAnchor,
    message: Message         // Use mod.Message('key')
): void;

// Full styling
mod.AddUIText(
    name: string,
    position: Vector,
    size: Vector,
    anchor: UIAnchor,
    parent: UIWidget,
    visible: boolean,
    padding: number,
    bgColor: Vector,
    bgAlpha: number,
    bgFill: UIBgFill,
    message: Message,
    textSize: number,        // Font size
    textColor: Vector,       // Text RGB (0-1)
    textAlpha: number,       // Text transparency
    textAnchor: UIAnchor     // Text alignment within widget
): void;

// With visibility restriction
mod.AddUIText(
    name: string,
    position: Vector,
    size: Vector,
    anchor: UIAnchor,
    parent: UIWidget,
    visible: boolean,
    padding: number,
    bgColor: Vector,
    bgAlpha: number,
    bgFill: UIBgFill,
    message: Message,
    textSize: number,
    textColor: Vector,
    textAlpha: number,
    textAnchor: UIAnchor,
    receiver: Player | Team
): void;
```

### AddUIButton

```typescript
// Full styling
mod.AddUIButton(
    name: string,
    position: Vector,
    size: Vector,
    anchor: UIAnchor,
    parent: UIWidget,
    visible: boolean,
    padding: number,
    bgColor: Vector,
    bgAlpha: number,
    bgFill: UIBgFill,
    buttonEnabled: boolean,
    baseColor: Vector,        // Normal state color
    baseAlpha: number,
    disabledColor: Vector,    // Disabled state color
    disabledAlpha: number,
    pressedColor: Vector,     // Pressed state color
    pressedAlpha: number,
    hoverColor: Vector,       // Hover state color
    hoverAlpha: number,
    focusedColor: Vector,     // Focused state color
    focusedAlpha: number
): void;
```

### AddUIImage

```typescript
mod.AddUIImage(
    name: string,
    position: Vector,
    size: Vector,
    anchor: UIAnchor,
    parent: UIWidget,
    visible: boolean,
    padding: number,
    bgColor: Vector,
    bgAlpha: number,
    bgFill: UIBgFill,
    imageType: UIImageType,
    imageColor: Vector,
    imageAlpha: number
): void;
```

---

## Working Code: Wrapper Pattern from BombSquad

BombSquad uses a wrapper pattern to simplify widget creation (BombSquad.ts:3427-3657):

```typescript
// Type definition for UI parameters
type UIParams = {
    name: string;
    type: "Container" | "Text" | "Image" | "Button";
    position?: number[];
    size?: number[];
    anchor?: mod.UIAnchor;
    parent?: mod.UIWidget;
    visible?: boolean;
    padding?: number;
    bgColor?: number[];
    bgAlpha?: number;
    bgFill?: mod.UIBgFill;
    textLabel?: string;
    textSize?: number;
    textColor?: mod.Vector;
    textAlpha?: number;
    textAnchor?: mod.UIAnchor;
    playerId?: mod.Player;
    teamId?: mod.Team;
    children?: UIParams[];
};

// Helper to convert array to Vector
function __asModVector(arr: number[] | mod.Vector | undefined): mod.Vector {
    if (!arr) return mod.CreateVector(0, 0, 0);
    if (Array.isArray(arr)) {
        return mod.CreateVector(arr[0] || 0, arr[1] || 0, arr[2] || 0);
    }
    return arr;
}

// Unique name trick: Create widget with temp name, then rename
const __cUniqueName = "----uniquename----";

function __addUIContainer(params: UIParams): mod.UIWidget {
    // Fill in defaults
    if (!params.position) params.position = [0, 0, 0];
    if (!params.size) params.size = [100, 100, 1];
    if (!params.anchor) params.anchor = mod.UIAnchor.TopLeft;
    if (params.visible === undefined) params.visible = true;
    if (!params.padding) params.padding = 0;
    if (!params.bgColor) params.bgColor = [0, 0, 0];
    if (params.bgAlpha === undefined) params.bgAlpha = 0;
    if (!params.bgFill) params.bgFill = mod.UIBgFill.Solid;

    // Create with temp unique name
    mod.AddUIContainer(
        __cUniqueName,
        __asModVector(params.position),
        __asModVector(params.size),
        params.anchor,
        params.parent!,
        params.visible,
        params.padding,
        __asModVector(params.bgColor),
        params.bgAlpha,
        params.bgFill
    );

    // Find and rename
    let widget = mod.FindUIWidgetWithName(__cUniqueName);
    mod.SetUIWidgetName(widget, params.name);

    return widget;
}
```

---

## Working Code: Button Event Handling

From BombSquad - buttons use a single global event handler:

```typescript
// All button clicks come through this single handler
export function OnPlayerUIButtonEvent(
    eventPlayer: mod.Player,
    eventUIWidget: mod.UIWidget,
    eventUIButtonState: mod.UIButtonState
): void {
    // Get the widget name to determine which button was clicked
    let widgetName = mod.GetUIWidgetName(eventUIWidget);

    // Check for specific button
    if (widgetName === "myButtonName") {
        // Handle this button click
    }
}
```

---

## Constraints

1. **Unique names required**: Each widget needs a unique name for `FindUIWidgetWithName` to work
2. **Single button handler**: All button events go through `OnPlayerUIButtonEvent` - use widget names to differentiate
3. **Colors are RGB 0-1**: Not 0-255. Use `mod.CreateVector(1, 0, 0)` for red
4. **Position is relative**: To parent widget if nested, or to screen anchor if root
5. **Parent must exist**: Create parent containers before children
6. **Message required for text**: Use `mod.Message('key')` with string key from your `.strings.json`

---

## Related Patterns

- [notifications.md](notifications.md) - Simple notification messages
- [../core/event-hooks.md](../core/event-hooks.md) - OnPlayerUIButtonEvent handler
