import { stage } from '../components/stage.js';

export class EventHandler {
  constructor(controller, config = {}) {
    if (!controller) throw new Error('Controller is required for EventHandler');

    this.controller = controller;
    this.touches = {};
    this.observerFunction = config.observerFunction;
    this.hint = config.hint;
    this.isBinding = false;
    this.bind();
  }

  bind() {
    const canvas = stage.getCanvas();
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    const events = document.querySelector('.HudGamePadObserver')?.style.display === '' ?
    ["touchstart", "touchend", "touchmove"] :
    ["mousedown", "mouseup", "mousemove"];

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
  }

  listen(e) {
    if (!e) return this.controller.getState();

    if (e.type) {
      this.handlePointerEvent(e);
    } else {
      this.handleKeyboardEvent(e);
    }

    if (this.observerFunction) {
      this.observerFunction(this.controller.getState());
    }

    return this.controller.getState();
  }

  handlePointerEvent(e) {
    const type = e.type;
    if (type.includes("mouse")) {
      e.identifier = "desktop";
      e = { touches: [e] };
    }

    Array.from(e.touches).slice(0, 5).forEach(touch => {
      const { identifier: id, pageX: x, pageY: y } = touch;
      this.touches[id] = { x, y };
    });

    if (type === "touchend") {
      this.handleTouchEnd(e);
    } else {
      this.handleActiveTouches(type);
    }
  }

  handleKeyboardEvent(keys) {
    if (!this.controller.joystick) return;

    let dir = 0;
    if (keys.left) dir |= 1;  // 0001
    if (keys.up) dir |= 2;    // 0010
    if (keys.right) dir |= 4;  // 0100
    if (keys.down) dir |= 8;   // 1000

    const stick = this.controller.joystick;
    const halfRadius = stick.radius / 2;

    // Reset joystick position
    stick.dx = stick.x;
    stick.dy = stick.y;

    const directions = {
      1: [-halfRadius, 0],        // left
      2: [0, -halfRadius],        // up
      3: [-halfRadius, -halfRadius], // up + left
      4: [halfRadius, 0],         // right
      6: [halfRadius, -halfRadius],  // up + right
      8: [0, halfRadius],         // down
      9: [-halfRadius, halfRadius],  // down + left
      12: [halfRadius, halfRadius]   // down + right
    };

    if (dir in directions) {
      const [dx, dy] = directions[dir];
      stick.dx = stick.x + dx;
      stick.dy = stick.y + dy;

      // Update state map with joystick values
      this.controller.updateState({
        "x-axis": (stick.dx - stick.x) / halfRadius,
        "y-axis": (stick.dy - stick.y) / halfRadius,
        "x-dir": Math.sign(stick.dx - stick.x),
        "y-dir": Math.sign(stick.dy - stick.y)
      });

      this.touches.stick = { id: "stick" };
    } else {
      // Reset joystick if no direction
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

  handleTouchEnd(e) {
    const id = e.changedTouches[0].identifier;
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

    if (e.changedTouches.length > e.touches.length) {
      const delta = e.changedTouches.length - e.touches.length;
      Object.keys(this.touches).slice(0, delta).forEach(id => delete this.touches[id]);
    }

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
    const dx = touch.x - stick.x;
    const dy = touch.y - stick.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < stick.radius * 1.5) {
      if (!type || type === "mousedown") {
        this.touches[id].id = "stick";
      } else if (type === "mouseup") {
        delete this.touches[id].id;
        stick.reset();
      }
    }

    if (this.touches[id].id === "stick") {
      const halfRadius = stick.radius / 2;
      if (Math.abs(dx) < halfRadius) stick.dx = stick.x + dx;
      if (Math.abs(dy) < halfRadius) stick.dy = stick.y + dy;

      this.controller.updateState({
        "x-axis": (stick.dx - stick.x) / halfRadius,
        "y-axis": (stick.dy - stick.y) / halfRadius,
        "x-dir": Math.sign(stick.dx - stick.x),
        "y-dir": Math.sign(stick.dy - stick.y)
      });

      if (dist > stick.radius * 1.5) {
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
          if (!type || type === "mousedown") {
            this.touches[id].id = name;
          } else if (type === "mouseup") {
            delete this.touches[id].id;
            button.config.hit.active = false;
            this.controller.updateState({ [name]: 0 });
          }
        }

        if (this.touches[id].id === name) {
          button.config.hit.active = true;
          this.controller.updateState({ [name]: 1 });
        }
      });
    }
  }