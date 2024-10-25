export const HudGamePad = (function(){
  let canvas;
  let ctx;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const scale = [
    (window.innerWidth / width),
    (window.innerHeight / height)
  ];
  const fontSizes = {
    button: 14,
    small: 10,
    medium: 20,
    large: 24,
    huge: 48
  };

  const font = Object.fromEntries(
    Object.entries(fontSizes).map(([key, size]) => [key, `${size}px 'superhelio _regular'`])
  );
  let touches = {};
  let map = {};
  let observerFunction;
  let toggle, ready, hint, debug, trace, hidden = false;
  const Layout = Object.freeze({
    TOP_LEFT: "TOP_LEFT",
    TOP_RIGHT: "TOP_RIGHT",
    BOTTOM_LEFT: "BOTTOM_LEFT",
    BOTTOM_RIGHT: "BOTTOM_RIGHT"
  });

  let layout = Layout.BOTTOM_RIGHT;
  const radius = 25;
  const opacity = 0.75;
  const createRgba = (r, g, b, a = opacity) => `rgba(${r},${g},${b},${a})`;
  const colors = {
    red: createRgba(255, 0, 0),
    green: createRgba(0, 255, 0),
    blue: createRgba(0, 0, 255),
    purple: createRgba(255, 0, 255),
    yellow: createRgba(255, 255, 0),
    cyan: createRgba(0, 255, 255),
    black: createRgba(0, 0, 0),
    white: createRgba(255, 255, 255),
    joystick: {
      base: createRgba(0, 0, 0),
      dust: createRgba(0, 0, 0),
      stick: createRgba(204, 204, 204, 1),
      ball: createRgba(255, 255, 255, 1)
    }
  };
  let buttons = 0;
  const { red, green, blue, purple } = colors;

  let buttonsLayout = [
    [
      { x: 0, y: 0, r: Math.round(radius), color: red, name: "a" }
    ],
    [
      { x: Math.round(-(radius / 4)), y: Math.round(radius + (radius / 2)), r: Math.round(radius), color: red, name: "a" },
      { x: Math.round(radius + (radius / 0.75)), y: Math.round(-radius + (radius / 2)), r: Math.round(radius), color: green, name: "b" }
    ],
    [
      { x: Math.round(-radius * 0.75), y: Math.round(radius * 2), r: Math.round(radius), color: red, name: "a" },
      { x: Math.round(radius * 1.75), y: Math.round(radius), r: Math.round(radius), color: green, name: "b" },
      { x: Math.round(radius * 3.5), y: Math.round(-radius), r: Math.round(radius), color: blue, name: "c" }
    ],
    [
      { x: Math.round(-radius), y: Math.round(radius), r: Math.round(radius), color: red, name: "a" },
      { x: Math.round(radius * 2 - radius), y: Math.round(-(radius * 2) + radius), r: Math.round(radius), color: green, name: "b" },
      { x: Math.round(radius * 2 - radius), y: Math.round((radius * 2) + radius), r: Math.round(radius), color: blue, name: "x" },
      { x: Math.round(radius * 3), y: Math.round(radius), r: Math.round(radius), color: purple, name: "y" }
    ]
  ];
  const button_offset = { x: (radius * 3), y: (radius * 3) };
  let layout_built = false;
  const ButtonType = Object.freeze({
    START: "start",
    SELECT: "select"
  });

  const buttonConfig = new Map([
    [ButtonType.START, { x: width / 2, y: -15, w: 50, h: 15, color: colors.black, name: ButtonType.START }],
    [ButtonType.SELECT, { x: width / 2, y: -15, w: 50, h: 15, color: colors.black, name: ButtonType.SELECT }]
  ]);

  let start = true;
  let select = false;

  let joystick = true;
  // Cache the width and height of the canvas to avoid recalculating them
  let canvasWidth = width * scale[0];
  let canvasHeight = height * scale[1];

  const css = (href) => {
    fetch(new URL(href, import.meta.url))
      .then(response => {
        if (!response.ok) throw new Error(`Failed to load CSS: ${href}`);
        return response.text();
      })
      .then(cssText => {
        const style = document.createElement('style');
        style.innerHTML = cssText;
        document.head.appendChild(style);
      })
      .catch(error => console.error('Error loading CSS:', error));
  };

  // Setup function without eval
  const setup = (config = {}) => {
    css('./index.css');
    document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

    if (Object.keys(config).length > 0) {
      config.canvas ? stage.assign(config.canvas) : stage.create();

      Object.keys(config).forEach((prop) => {
        if (["debug", "trace", "layout", "start", "select", "hidden", "joystick", "hint"].includes(prop)) {
          if (prop === "debug") debug = config[prop];
          if (prop === "trace") trace = config[prop];
          if (prop === "hidden") hidden = config[prop];
          if (prop === "hint") hint = config[prop];
          if (prop === "layout") layout = config[prop];
          if (prop === "start") start = config[prop];
          if (prop === "select") select = config[prop];
          if (prop === "joystick") joystick = config[prop];
        } else if (prop === "buttons") {
          buttons = Math.min(config[prop].length - 1, buttonsLayout.length - 1);
          buttonsLayout = buttonsLayout[buttons];
          config[prop].forEach((button, n) => {
            if (button.name) buttonsLayout[n].name = button.name;
            if (button.color) buttonsLayout[n].color = button.color;
            if (button.key) buttonsLayout[n].key = button.key;
          });
          layout_built = true;
        } else if (prop === "observerFunction") {
          observerFunction = config[prop];
        }
      });
    } else {
      stage.create();
    }

    if (!layout_built) buttonsLayout = buttonsLayout[buttons];
    if (start) buttonsLayout.push(buttonConfig.get(ButtonType.START));
    if (select) buttonsLayout.push(buttonConfig.get(ButtonType.SELECT));

    events.bind();
    controller.init();
    init();
  };

  // Initialization function
  const init = () => {
    ctx.fillStyle = createRgba(0, 0, 0, 0.5);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = font.small;
    ctx.fillText("loading", width / 2, height / 2);
    if (joystick) controller.stick.draw();
    controller.buttons.draw();
    ready = true;
  };

  // Draw function
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!hidden) {
      if (debug) helper.debug();
      if (trace) helper.trace();
      if (joystick) controller.stick.draw();
      controller.buttons.draw();
    }
  };

  const stage = {
    create(id = "HudGamePad") {
      canvas = document.createElement('canvas');
      canvas.id = id;
      canvas.style.imageRendering = "pixelated";
      const touch = document.createElement('div');
      touch.className = "HudGamePadObserver";
      document.body.append(canvas, touch);
      stage.assign(id);
    },
    assign(id) {
      if (!document.getElementById(id)) {
        stage.create(id);
      } else {
        canvas = document.getElementById(id);
        stage.adjust();
      }
    },
    adjust() {
      ctx = canvas.getContext('2d');
      ctx.canvas.width = canvasWidth;
      ctx.canvas.height = canvasHeight;
      ctx.scale(scale[0], scale[1]);
    }
  };
  const controller = {
    init() {
      const layoutString = layout;
      layout = { x: 0, y: 0 };
      const shift = buttonsLayout.reduce((acc, button) => {
        if (button.r) {
          acc += button.r;
          if (layoutString === Layout.TOP_LEFT) {
            button.y -= button.r * 2;
          }
        }
        return acc;
      }, 0);

      const layoutPositions = {
        [Layout.TOP_LEFT]: { x: shift + button_offset.x, y: button_offset.y },
        [Layout.TOP_RIGHT]: { x: width - button_offset.x, y: button_offset.y },
        [Layout.BOTTOM_LEFT]: { x: shift + button_offset.x, y: height - button_offset.y },
        [Layout.BOTTOM_RIGHT]: { x: width - button_offset.x, y: height - button_offset.y }
      };
      layout = layoutPositions[layoutString] || layout;
      controller.buttons.init();
      if (joystick) controller.stick.init();
    },
    buttons: {
      init() {
        buttonsLayout.forEach((button, n) => {
          const x = layout.x - button.x;
          const y = layout.y - button.y;
          if (button.r) {
            const r = button.r;
            buttonsLayout[n].hit = { x: [x - r, x + r * 2], y: [y - r, y + r * 2], active: false };
          } else {
            button.x = width / 2 - button.w;
            if (start && select) {
              button.x = button.name === "select" ? width / 2 - button.w - button.h * 2 : width / 2;
            }
            buttonsLayout[n].hit = { x: [button.x, button.x + button.w], y: [y, y + button.h], active: false };
          }
          map[button.name] = 0;
        });
      },
      draw() {
        buttonsLayout.forEach(button => {
          const { name, color, r, w, h, hit } = button;
          let x = layout.x - button.x;
          let y = layout.y - button.y;
          button.dx = x;
          button.dy = y;

          ctx.fillStyle = color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = font.button;

          if (r) {
            if (hit?.active) {
              ctx.beginPath();
              ctx.arc(x, y, r + 5, 0, 2 * Math.PI);
              ctx.fill();
              ctx.closePath();
            }
            ctx.beginPath();
            ctx.arc(x, y, r, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = createRgba(255, 255, 255);
            ctx.fillText(name, x, y);
          } else {
            const rectX = button.x;
            const rectY = button.dy;
            const rectR = 10;
            if (hit?.active) {
              ctx.roundRect(rectX - 5, rectY - 5, w + 10, h + 10, rectR * 2).fill();
            }
            ctx.roundRect(rectX, rectY, w, h, rectR).fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = createRgba(0, 0, 0, 0.5);
            ctx.fillText(name, rectX + w / 2, rectY + h * 2);
          }

          if (button.key && hint) {
            ctx.fillStyle = createRgba(0, 0, 0, 0.25);
            if (name === "start" || name === "select") {
              x += w / 2;
            }
            ctx.fillText(button.key, x, y - r * 1.5);
          }
        });
      },
      state(id, n, type) {
        if (touches[id].id !== "stick") {
          const touch = { x: touches[id].x, y: touches[id].y };
          const button = buttonsLayout[n];
          const { name, r } = button;
          const dx = touch.x - button.dx;
          const dy = touch.y - button.dy;
          let dist = width;
          if (r) {
            dist = Math.sqrt(dx * dx + dy * dy);
          } else if (touch.x > button.hit.x[0] && touch.x < button.hit.x[1] && touch.y > button.hit.y[0] && touch.y < button.hit.y[1]) {
            dist = 0;
          }
          if (dist < radius && touches[id].id !== "stick") {
            if (!type) {
              touches[id].id = name;
            } else if (type === "mousedown") {
              touches[id].id = name;
            } else if (type === "mouseup") {
              delete touches[id].id;
              controller.buttons.reset(n);
            }
          }
          if (touches[id].id === name) {
            map[name] = 1;
            button.hit.active = true;
            if (dist > radius) {
              button.hit.active = false;
              map[name] = 0;
              delete touches[id].id;
            }
            if (typeof observerFunction === "function") {
              observerFunction();
            }
          }
        }
      },
      reset(n) {
        const button = buttonsLayout[n];
        button.hit.active = false;
        map[button.name] = 0;
      }
    },
    stick: {
      radius: 40,
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      init() {
        Object.assign(this, {
          radius: 40,
          x: width - layout.x,
          y: layout.y,
          dx: width - layout.x,
          dy: layout.y
        });
        ["x-dir", "y-dir", "x-axis", "y-axis"].forEach(key => map[key] = 0);
      },
      draw() {
        const drawCircle = (x, y, radius, color) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fill();
          ctx.closePath();
        };

        drawCircle(this.x, this.y, this.radius, colors.joystick.base);
        drawCircle(this.x, this.y, this.radius - 5, colors.joystick.dust);
        drawCircle(this.x, this.y, 10, colors.joystick.stick);
        drawCircle(this.dx, this.dy, this.radius - 5, createRgba(0, 0, 0, 0.05));
        drawCircle(this.dx, this.dy, this.radius - 10, colors.joystick.ball);
      },
      state(id, type) {
        const touch = { x: touches[id].x, y: touches[id].y };
        const dx = touch.x - this.x;
        const dy = touch.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.radius * 1.5) {
          if (!type || type === "mousedown") {
            touches[id].id = "stick";
          } else if (type === "mouseup") {
            delete touches[id].id;
            controller.stick.reset();
          }
        }
        if (touches[id].id === "stick") {
          const halfRadius = this.radius / 2;
          if (Math.abs(dx) < halfRadius) this.dx = this.x + dx;
          if (Math.abs(dy) < halfRadius) this.dy = this.y + dy;
          map["x-axis"] = (this.dx - this.x) / halfRadius;
          map["y-axis"] = (this.dy - this.y) / halfRadius;
          map["x-dir"] = Math.sign(this.dx - this.x);
          map["y-dir"] = Math.sign(this.dy - this.y);
          if (dist > this.radius * 1.5) {
            controller.stick.reset();
            delete touches[id].id;
          }
          observerFunction?.();
        }
      },
      reset() {
        Object.assign(this, { dx: this.x, dy: this.y });
        ["x-dir", "y-dir", "x-axis", "y-axis"].forEach(key => map[key] = 0);
      }
    }
  }
  const events = {
    bind() {
      const events = document.querySelector('.HudGamePadObserver').style.display === '' ?
      ["touchstart", "touchend", "touchmove"] :
      ["mousedown", "mouseup", "mousemove"];
      events.forEach(event => canvas.addEventListener(event, HudGamePad.events, { passive: false }));
    },
    listen(e) {
      if (e.type) {
        const type = e.type;
        if (type.includes("mouse")) {
          e.identifier = "desktop";
          e = { touches: [e] };
        }
        Array.from(e.touches).slice(0, 5).forEach(touch => {
          const { identifier: id, pageX: x, pageY: y } = touch;
          touches[id] = { x, y };
        });
        Object.keys(touches).forEach(id => {
          switch (type) {
            case "touchstart":
            case "touchmove":
            controller.stick.state(id);
            buttonsLayout.forEach((_, n) => controller.buttons.state(id, n));
            break;
            case "mousedown":
            case "mousemove":
            case "mouseup":
            controller.stick.state(id, type);
            buttonsLayout.forEach((_, n) => controller.buttons.state(id, n, type));
            break;
          }
        });
        if (type === "touchend") {
          const id = e.changedTouches[0].identifier;
          if (touches[id]?.id === "stick") controller.stick.reset();
          buttonsLayout.forEach((button, n) => {
            if (touches[id]?.id === button.name) controller.buttons.reset(n);
          });
          delete touches[id];
          if (e.changedTouches.length > e.touches.length) {
            const delta = e.changedTouches.length - e.touches.length;
            Object.keys(touches).slice(0, delta).forEach(id => delete touches[id]);
          }
          if (e.touches.length === 0) {
            touches = {};
            buttonsLayout.forEach((_, n) => controller.buttons.reset(n));
            controller.stick.reset();
          }
        }
      } else {
        const keys = e;
        let dir = 0;
        for (const prop in keys) {
          switch (prop) {
            case "left":
            if (keys[prop]) dir += 1;
            break;
            case "up":
            if (keys[prop]) dir += 2;
            break;
            case "right":
            if (keys[prop]) dir += 4;
            break;
            case "down":
            if (keys[prop]) dir += 8;
            break;
            default:
            if (keys[prop]) {
              buttonsLayout.forEach((button, n) => {
                if (button.key === prop) {
                  touches[button.name] = {
                    id: button.name,
                    x: button.hit.x[0] + button.w / 2,
                    y: button.hit.y[0] + button.h / 2
                  };
                  controller.buttons.state(button.name, n, "mousedown");
                }
              });
            } else {
              buttonsLayout.forEach((button, n) => {
                if (button.key === prop) {
                  controller.buttons.reset(n);
                  delete touches[button.name];
                }
              });
              delete keys[prop];
            }
            break;
          }
          controller.stick.dx = controller.stick.x;
          controller.stick.dy = controller.stick.y;
          const halfRadius = controller.stick.radius / 2;
          switch (dir) {
            case 1:
            controller.stick.dx = controller.stick.x - halfRadius;
            break;
            case 2:
            controller.stick.dy = controller.stick.y - halfRadius;
            break;
            case 3:
            controller.stick.dx = controller.stick.x - halfRadius;
            controller.stick.dy = controller.stick.y - halfRadius;
            break;
            case 4:
            controller.stick.dx = controller.stick.x + halfRadius;
            break;
            case 6:
            controller.stick.dx = controller.stick.x + halfRadius;
            controller.stick.dy = controller.stick.y - halfRadius;
            break;
            case 8:
            controller.stick.dy = controller.stick.y + halfRadius;
            break;
            case 9:
            controller.stick.dx = controller.stick.x - halfRadius;
            controller.stick.dy = controller.stick.y + halfRadius;
            break;
            case 12:
            controller.stick.dx = controller.stick.x + halfRadius;
            controller.stick.dy = controller.stick.y + halfRadius;
            break;
            default:
            controller.stick.dx = controller.stick.x;
            controller.stick.dy = controller.stick.y;
            break;
          }
          if (dir !== 0) {
            touches["stick"] = { id: "stick" };
            controller.stick.state("stick", "mousemove");
          } else {
            controller.stick.reset();
            delete touches["stick"];
          }
        }
      }
      return events.broadcast();
    },
    broadcast() {
      return map;
    },
    observe() {
      return events.broadcast();
    }
  };
  function invert(color)
  {
  }
  var helper = {
    debug:function()
    {
      var dy = 30;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.font = font.medium;
      ctx.fillText("debug", 10, dy);
      ctx.font = font.small;
      dy += 5;
      Object.entries(touches).forEach(([prop, value]) => {
        dy += 10;
        const text = `${prop} : ${JSON.stringify(value).slice(1, -1)}`;
        ctx.fillText(text, 10, dy);
      });
    },
    trace:function()
    {
      var dy = 30;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.font = font.medium;
      ctx.fillText("trace", width-10, dy);
      ctx.font = font.small;
      dy += 5;
      Object.keys(map).forEach(prop => {
        dy += 10;
        const text = `${prop} : ${map[prop]}`;
        ctx.fillText(text, width - 10, dy);
      });
    }
  };
  (function loop(){
    toggle = !toggle;
    if (toggle) {
      requestAnimationFrame(loop);
      return;
    }
    if (ready) draw();
    requestAnimationFrame(loop);
  })();
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  }
  return {
    setup:function(config){setup(config);},
    draw:function(){draw();},
    events:function(e){return events.listen(e);},
    observe:function(){return events.observe();}
  };
})();

export const GamePad = HudGamePad;