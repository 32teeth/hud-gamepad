import { stage } from '../components/stage.js';
import { scale, canvasWidth, canvasHeight } from '../components/stage.js';

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
    if (this.isBinding) return;
    this.isBinding = true;

    const canvas = stage.getCanvas();
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    const events = document.querySelector('.HudGamePadObserver')?.style.display === '' ?
      ["touchstart", "touchend", "touchmove"] :
      ["mousedown", "mouseup", "mousemove"];

    events.forEach(event => canvas.addEventListener(event, (e) => this.listen(e), { passive: false }));

    document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

    const resizeObserver = new ResizeObserver(() => {
      canvasWidth = window.innerWidth * scale[0];
      canvasHeight = window.innerHeight * scale[1];
      stage.adjust();
      controller.init();
    });

    resizeObserver.observe(document.body);
    this.isBinding = false;
  }

  listen(e) {
    if (!e) return this.controller.getState();

    if (e.type) {
      const type = e.type;
      if (type.includes("mouse")) {
        e.identifier = "desktop";
        e = { touches: [e] };
      }

      Array.from(e.touches).slice(0, 5).forEach(touch => {
        const { identifier: id, pageX: x, pageY: y } = touch;
        this.touches[id] = { x, y };
      });

      Object.keys(this.touches).forEach(id => {
        switch (type) {
          case "touchstart":
          case "touchmove":
            if (this.controller.joystick) this.controller.joystick.state(id);
            this.controller.buttonsLayout.forEach((_, n) => this.controller.buttons.state(id, n));
            break;
          case "mousedown":
          case "mousemove":
          case "mouseup":
            if (this.controller.joystick) this.controller.joystick.state(id, type);
            this.controller.buttonsLayout.forEach((_, n) => this.controller.buttons.state(id, n, type));
            break;
        }
      });

      if (type === "touchend") {
        const id = e.changedTouches[0].identifier;
        if (this.touches[id]?.id === "stick") this.controller.joystick?.reset();
        this.controller.buttonsLayout.forEach((button, n) => {
          if (this.touches[id]?.id === button.name) this.controller.buttons.reset(n);
        });
        delete this.touches[id];
        if (e.changedTouches.length > e.touches.length) {
          const delta = e.changedTouches.length - e.touches.length;
          Object.keys(this.touches).slice(0, delta).forEach(id => delete this.touches[id]);
        }
        if (e.touches.length === 0) {
          this.touches = {};
          this.controller.buttonsLayout.forEach((_, n) => this.controller.buttons.reset(n));
          if (this.controller.joystick) this.controller.joystick.reset();
        }
      }
    } else {
      const keys = e;
      let dir = 0;
      for (const prop in keys) {
        switch (prop) {
          case "left":
            if (keys[prop]) dir |= 1;
            break;
          case "up":
            if (keys[prop]) dir |= 2;
            break;
          case "right":
            if (keys[prop]) dir |= 4;
            break;
          case "down":
            if (keys[prop]) dir |= 8;
            break;
          default:
            this.controller.buttonsLayout.forEach((button, n) => {
              if (button.key === prop) {
                if (keys[prop]) {
                  this.touches[button.name] = {
                    id: button.name,
                    x: button.hit.x[0] + (button.w || button.r * 2) / 2,
                    y: button.hit.y[0] + (button.h || button.r * 2) / 2
                  };
                  this.controller.buttons.state(button.name, n, "mousedown");
                } else {
                  this.controller.buttons.reset(n);
                  delete this.touches[button.name];
                }
              }
            });
            break;
        }

        if (this.controller.joystick) {
          this.controller.joystick.dx = this.controller.joystick.x;
          this.controller.joystick.dy = this.controller.joystick.y;
          const halfRadius = this.controller.joystick.radius / 2;
          const directions = {
            1: [-halfRadius, 0],
            2: [0, -halfRadius],
            3: [-halfRadius, -halfRadius],
            4: [halfRadius, 0],
            6: [halfRadius, -halfRadius],
            8: [0, halfRadius],
            9: [-halfRadius, halfRadius],
            12: [halfRadius, halfRadius]
          };

          const [dx, dy] = directions[dir] ?? [0, 0];
          Object.assign(this.controller.joystick, {
            dx: this.controller.joystick.x + dx,
            dy: this.controller.joystick.y + dy
          });

          if (dir) {
            this.touches.stick = { id: "stick" };
            this.controller.joystick.state("stick", "mousemove");
          } else {
            this.controller.joystick.reset();
            delete this.touches.stick;
          }
        }
      }
    }

    if (this.observerFunction) {
      this.observerFunction();
    }

    return this.controller.getState();
  }
}