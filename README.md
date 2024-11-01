[![File Size](https://img.shields.io/github/size/32teeth/hud-gamepad/index.js?style=for-the-badge)](https://github.com/32teeth/hud-gamepad/edit/master/README.md)
[![npm](https://img.shields.io/npm/dw/hud-gamepad?logo=npm&style=for-the-badge)](https://www.npmjs.com/package/hud-gamepad)
[![GitHub stars](https://img.shields.io/github/stars/32teeth/hud-gamepad?color=pink&label=love&logo=github&logoColor=white&style=for-the-badge)](https://github.com/32teeth/hud-gamepad/edit/master/README.md)

# HUD GamePad
> A fully customizable on-screen gamepad interface for HTML5 canvas applications

```bash
npm i hud-gamepad
```

![HUD Game Pad](https://raw.githubusercontent.com/npm-packages-collection/hud-gamepad/refs/heads/main/assets/hud-gamepad.gif)

### Quick Start
```javascript
import { GamePad } from 'hud-gamepad';

// Basic setup with joystick and default buttons
GamePad.setup({
  joystick: true
});

// Listen for state changes
setInterval(() => {
  const state = GamePad.observe();
  console.log(state);
}, 16);
```

[Try the Live Demo](https://npm-packages-collection.github.io/hud-gamepad/example/)

## Configuration Options

The GamePad is highly customizable with various options for buttons, layout, and behavior.

| Property | Type | Values | Description | Example |
|----------|------|--------|-------------|---------|
| canvas | string | Canvas ID | Target canvas element (creates new if omitted) | `canvas: "gamepad"` |
| joystick | boolean | true/false | Enable joystick (default: false) | `joystick: true` |
| buttons | array | [{name, color, key}] | Button configurations | `buttons: [{name: "a", color: "rgba(255,0,0,0.75)"}]` |
| layout | string | TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT | Controller position (default: BOTTOM_RIGHT) | `layout: "BOTTOM_LEFT"` |
| start | boolean | true/false | Show start button (default: false) | `start: true` |
| select | boolean | true/false | Show select button (default: false) | `select: true` |
| debug | boolean | true/false | Show debug info (default: false) | `debug: true` |
| trace | boolean | true/false | Show state trace (default: false) | `trace: true` |
| hint | boolean | true/false | Show keyboard hints (default: false) | `hint: true` |
| hidden | boolean | true/false | Hide gamepad (default: false) | `hidden: true` |

### Button Configuration
Each button can be customized with:
```javascript
{
  name: "a",                    // Button label
  color: "rgba(255,0,0,0.75)", // Button color
  key: "x"                     // Keyboard binding
}
```

### Example Configurations

#### Basic Setup
```javascript
GamePad.setup();
```

#### Custom Button Configuration
```javascript
GamePad.setup({
  buttons: [
    { name: "jump", color: "rgba(255,0,0,0.75)", key: "space" },
    { name: "shoot", color: "rgba(0,255,0,0.75)", key: "x" }
  ],
  joystick: true,
  hint: true
});
```

#### Full Configuration
```javascript
GamePad.setup({
  canvas: "gamepad",
  joystick: true,
  start: true,
  select: true,
  debug: true,
  trace: true,
  hint: true,
  layout: "BOTTOM_RIGHT",
  buttons: [
    { name: "a", color: "rgba(255,0,0,0.75)", key: "x" },
    { name: "b", color: "rgba(0,255,0,0.75)", key: "z" },
    { name: "x", color: "rgba(0,0,255,0.75)", key: "a" },
    { name: "y", color: "rgba(255,255,0,0.75)", key: "s" }
  ]
});
```

### State Observation
The GamePad provides real-time state information through the observe method:

```javascript
// Get current state
const state = GamePad.observe();

// State includes:
// - Button states (0 or 1)
// - Joystick axes (-1 to 1)
// - Joystick directions (-1, 0, 1)

// Example state object:
{
  "a": 0,          // Button a state
  "b": 1,          // Button b state
  "x-axis": 0.5,   // Joystick X position
  "y-axis": -0.25, // Joystick Y position
  "x-dir": 1,      // Joystick X direction
  "y-dir": -1      // Joystick Y direction
}
```

### Integration Example
```javascript
// Game loop integration
function gameLoop() {
  const state = GamePad.observe();

  // Handle joystick
  if (state["x-axis"] !== 0 || state["y-axis"] !== 0) {
    player.move(state["x-axis"], state["y-axis"]);
  }

  // Handle buttons
  if (state.a) {
    player.jump();
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
```

### Example with Keyboard Support
```javascript
GamePad.setup({
  canvas: "controller",
  start: true,
  select: true,
  trace: true,
  debug: true,
  hint: true,
  buttons: [
    { name: "a", key: "s" },
    { name: "b", key: "a" },
    { name: "x", key: "w" },
    { name: "y", key: "q" }
  ]
});
```

## Browser Support
- Modern browsers with Canvas support
- Touch events for mobile devices
- Keyboard support for desktop

## License
ISC License