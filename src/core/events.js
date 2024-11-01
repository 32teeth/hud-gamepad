import { stage } from '../components/stage.js';

export class EventHandler {
  constructor(controller, config = {}) {
    if (!controller) throw new Error('Controller is required for EventHandler');

    this.controller = controller;
    this.touches = {};
    this.observerFunction = config.observerFunction;
    this.hint = config.hint;
    this.bind();
    this.isBinding = false;
    this.stickPressed = false;

    // Add key repeat handling
    this.keyStates = new Map();
    this.repeatDelay = 300;  // Initial delay before repeat starts
    this.repeatRate = 50;    // How often to repeat (ms)
  }

  bind() {
    document.addEventListener('touchmove', function(e) { e.preventDefault(); }, false);
    const canvas = stage.getCanvas();
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    canvas.oncontextmenu = function(e) { e.preventDefault(); };

    let events = {
      browser:["mousedown", "mouseup", "mousemove"],
      app:["touchstart", "touchend", "touchmove"]
    }
    events = document.querySelector('.HudGamePadObserver').style.display === '' ? events.app : events.browser;
    events.forEach(event => canvas.addEventListener(event, (e) => this.listen(e), { passive: false }));

    // Update the resize observer to properly handle window resizing
    const resizeObserver = new ResizeObserver(() => {
      stage.updateDimensions(
        window.innerWidth,
        window.innerHeight
      );
      this.controller.init(this.controller.config);
    });

    resizeObserver.observe(document.body);

    // Cleanup on page unload
    window.addEventListener('unload', () => {
      this.keyStates.forEach((timer) => {
        clearTimeout(timer.timeout);
        clearInterval(timer.interval);
      });
      this.keyStates.clear();
    });
  }

  listen(e) {
    if (!e) return this.controller.getState();
    if (e.type) {
      this.handlePointerEvent(e);
      this.dispatch(e);
    } else {
      if(!this.stickPressed) {
        this.handleKeyboardEvent(e);
      }
    }

    if (this.observerFunction) {
      this.observerFunction(this.controller.getState());
    }

    return this.controller.getState();
  }

  dispatch(e) {
    const states = this.controller.getState();
    const dispatchKey = (key, code, isActive) => {
      if (isActive) {
        if (!this.keyStates.has(key)) {
          // Initial keydown
          window.dispatchEvent(new KeyboardEvent("keydown", {
            key,
            keyCode: code,
            which: code,
            bubbles: true,
            repeat: false
          }));

          // Setup repeat behavior
          const timeout = setTimeout(() => {
            const interval = setInterval(() => {
              window.dispatchEvent(new KeyboardEvent("keydown", {
                key,
                keyCode: code,
                which: code,
                bubbles: true,
                repeat: true
              }));
            }, this.repeatRate);

            this.keyStates.set(key, { timeout, interval });
          }, this.repeatDelay);

          this.keyStates.set(key, { timeout, interval: null });
        }
      } else if (this.keyStates.has(key)) {
        // Cleanup timers
        const timers = this.keyStates.get(key);
        clearTimeout(timers.timeout);
        if (timers.interval) clearInterval(timers.interval);
        this.keyStates.delete(key);

        // Send keyup
        window.dispatchEvent(new KeyboardEvent("keyup", {
          key,
          keyCode: code,
          which: code,
          bubbles: true
        }));
      }
    };

    const arrows = {
      up: {
        key: "ArrowUp",
        code: 38,
        active: states['y-dir'] === -1
      },
      down: {
        key: "ArrowDown",
        code: 40,
        active: states['y-dir'] === 1
      },
      left: {
        key: "ArrowLeft",
        code: 37,
        active: states['x-dir'] === -1
      },
      right: {
        key: "ArrowRight",
        code: 39,
        active: states['x-dir'] === 1
      }
    };

    const buttons = this.controller.buttons;
    buttons.forEach(button => {
      const { key, name } = button.config;
      const isActive = states[name] === 1;
      button.config.hit.active = isActive;
      dispatchKey(key, key.charCodeAt(0), isActive);
    });

    Object.values(arrows).forEach(({ key, code, active }) => {
      dispatchKey(key, code, active);
    });
  }

  handlePointerEvent(e) {
    const type = e.type;
    if (type.includes("mouse")) {
      e.identifier = "desktop";
      e = { touches: [e] };
    }

    // Track up to 5 touches
    Array.from(e.touches).slice(0, 5).forEach(touch => {
      const { identifier: id, pageX: x, pageY: y } = touch;
      this.touches[id] = { x, y };
    });

    for(let id in this.touches) {
      switch(type)
      {
        case "touchstart":
        case "touchmove":
        case "touchend":
          this.handleJoystickTouch(id, this.touches[id], type);
          this.handleButtonTouch(id, this.touches[id], type);
        break;
        case "mousedown":
        case "mousemove":
        case "mouseup":

        break;
      }
    }

    if (type === "touchend") {
      this.handleTouchEnd(e);
      this.stickPressed = false;
    } else {
      this.handleActiveTouches(type);
    }

    if(type === "mouseup") {
      this.stickPressed = false;
    }
  }

  handleTouchEnd(e) {
    const id = e.changedTouches[0].identifier;
    // Reset joystick if it was being controlled by this touch
    if (this.touches[id]?.id === "stick") {
      this.controller.joystick?.reset();
      this.controller.updateState({
        "x-axis": 0,
        "y-axis": 0,
        "x-dir": 0,
        "y-dir": 0
      });
    }
    delete this.touches[id];

    // Handle multiple touch ends
    if (e.changedTouches.length > e.touches.length) {
      const delta = e.changedTouches.length - e.touches.length;
      Object.keys(this.touches).slice(0, delta).forEach(id => delete this.touches[id]);
    }

    // Reset all states if no touches remain
    if (e.touches.length === 0) {
      this.touches = {};
      this.controller.resetStates();
    }
  }

  handleActiveTouches(type) {
    Object.keys(this.touches).forEach(id => {
      const touch = this.touches[id];
      if (this.controller.joystick && !touch.id) {
        this.handleJoystickTouch(id, touch, type);
      }
      this.handleButtonTouch(id, touch, type);
    });
  }

  handleJoystickTouch(id, touch, type) {
    const stick = this.controller.joystick;
    // Convert touch coordinates to integers for consistent behavior
    const dx = parseInt(touch.x - stick.x);
    const dy = parseInt(touch.y - stick.y);
    const dist = parseInt(Math.sqrt(dx * dx + dy * dy));

    // Check if touch is within joystick area
    if (dist < stick.radius * 1.5) {
      if (!type || type === "mousedown" || type === "touchstart") {
        this.touches[id].id = "stick";
        this.stickPressed = true;
      }
    }

    if (this.touches[id].id === "stick" || this.stickPressed) {
      // Update joystick position with integer values and radius constraints
      if (Math.abs(parseInt(dx)) < (stick.radius / 2)) {
        stick.dx = stick.x + dx;
      }
      if (Math.abs(parseInt(dy)) < (stick.radius / 2)) {
        stick.dy = stick.y + dy;
      }

      // Update state map with normalized values
      const newState = {
        "x-axis": (stick.dx - stick.x) / (stick.radius / 2),
        "y-axis": (stick.dy - stick.y) / (stick.radius / 2)
      };

      // Add rounded directions
      newState["x-dir"] = Math.round(newState["x-axis"]);
      newState["y-dir"] = Math.round(newState["y-axis"]);

      this.controller.updateState(newState);
    }
    if (type === "mouseup" || type === "touchend") {
      stick.reset();
      this.controller.updateState({
        "x-axis": 0,
        "y-axis": 0,
        "x-dir": 0,
        "y-dir": 0
      });
      delete this.touches[id].id;
    }
  }

  handleButtonTouch(id, touch, type) {
    if (this.touches[id].id === "stick") return;

    this.controller.buttons.forEach((button, index) => {
      const { hit, name, r } = button.config;
      const dx = touch.x - button.config.x;
      const dy = touch.y - button.config.y;
      let dist = Infinity;

      if (r) {
        dist = Math.sqrt(dx * dx + dy * dy);
      } else if (touch.x > hit.x[0] && touch.x < hit.x[1] &&
                 touch.y > hit.y[0] && touch.y < hit.y[1]) {
        dist = 0;
      }
      if (dist < (r || 25)) {
        if (!type || type === "mousedown" || type === "touchstart") {
          this.touches[id].id = name;
        }
      }

      if (this.touches[id].id === name) {
        button.config.hit.active = true;
        this.controller.updateState({ [name]: 1 });
      }

      if (type === "mouseup" || type === "touchend") {
        delete this.touches[id].id;
        button.config.hit.active = false;
        this.controller.updateState({ [name]: 0 });
      }
    });
  }

  handleKeyboardEvent(keys) {
    if (!this.controller.joystick) return;

    let dir = 0;
    if (keys.left) dir |= 1;   // 0001
    if (keys.up) dir |= 2;     // 0010
    if (keys.right) dir |= 4;  // 0100
    if (keys.down) dir |= 8;   // 1000

    const stick = this.controller.joystick;
    const halfRadius = stick.radius / 2;

    // Reset joystick position
    stick.dx = stick.x;
    stick.dy = stick.y;

    const directions = {
      1: [-halfRadius, 0],          // left
      2: [0, -halfRadius],          // up
      3: [-halfRadius, -halfRadius], // up + left
      4: [halfRadius, 0],           // right
      6: [halfRadius, -halfRadius],  // up + right
      8: [0, halfRadius],           // down
      9: [-halfRadius, halfRadius],  // down + left
      12: [halfRadius, halfRadius]   // down + right
    };

    if (dir in directions) {
      const [dx, dy] = directions[dir];
      stick.dx = stick.x + dx;
      stick.dy = stick.y + dy;

      this.controller.updateState({
        "x-axis": (stick.dx - stick.x) / halfRadius,
        "y-axis": (stick.dy - stick.y) / halfRadius,
        "x-dir": Math.sign(stick.dx - stick.x),
        "y-dir": Math.sign(stick.dy - stick.y)
      });

      this.touches.stick = { id: "stick" };
    } else {
      stick.reset();
      delete this.touches.stick;
      this.controller.updateState({
        "x-axis": 0,
        "y-axis": 0,
        "x-dir": 0,
        "y-dir": 0
      });
    }

    // Handle button keys
    Object.entries(keys).forEach(([key, value]) => {
      if (!["left", "right", "up", "down"].includes(key)) {
        this.handleButtonKey(key, value);
      }
    });
  }

  handleButtonKey(key, isPressed) {
    const buttons = this.controller.buttons;
    buttons.forEach((button, index) => {
      if (button.config.key === key) {
        if (isPressed) {
          this.touches[button.config.name] = {
            id: button.config.name,
            x: button.config.hit.x[0] + (button.config.w || button.config.r * 2) / 2,
            y: button.config.hit.y[0] + (button.config.h || button.config.r * 2) / 2
          };
          button.config.hit.active = true;
          this.controller.updateState({ [button.config.name]: 1 });
        } else {
          button.config.hit.active = false;
          this.controller.updateState({ [button.config.name]: 0 });
          delete this.touches[button.config.name];
        }
      }
    });
  }
}