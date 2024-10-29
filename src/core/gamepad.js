import { Controller } from './controller.js';
import { EventHandler } from './events.js';
import { stage } from '../components/stage.js';

export class GamePad {
  constructor() {
    this.controller = new Controller();
    this.events = null;
    this.ready = false;
    this.hidden = false;
    this.debug = false;
    this.trace = false;
    this.toggle = false;
    this.animationFrame = null;
  }

  async setup(config = {}) {
    // Load CSS
    if (config.css !== false) {
      await this.loadCSS('../index.css');
    }

    // Setup stage
    if (config.canvas) {
      stage.assign(config.canvas);
    } else {
      stage.create();
    }

    // Initialize configuration
    this.debug = config.debug || false;
    this.trace = config.trace || false;
    this.hidden = config.hidden || false;

    // Initialize controller
    this.controller.init(config);

    // Initialize event handler
    this.events = new EventHandler(this.controller, {
      observerFunction: config.observerFunction,
      hint: config.hint
    });

    // Initialize display
    await this.init().then(() => {
      setTimeout(() => {
        console.log('GamePad ready');
        this.draw();
        this.startLoop();
      },100);
    })
  }

  async loadCSS(href) {
    try {
      const response = await fetch(new URL(href, import.meta.url));
      if (!response.ok) throw new Error(`Failed to load CSS: ${href}`);
      const cssText = await response.text();
      const style = document.createElement('style');
      style.innerHTML = cssText;
      document.head.appendChild(style);
    } catch (error) {
      console.error('Error loading CSS:', error);
    }
  }

  async init() {
    const ctx = stage.getContext();
    const { width, height } = stage.getDimensions();

    // Draw loading state
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "10px 'superhelio _regular'";
    ctx.fillText("loading", width / 2, height / 2);

    this.ready = true;
  }

  draw() {
    if (!this.ready) return;

    const ctx = stage.getContext();
    const { width, height } = stage.getDimensions();

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!this.hidden) {
      // Draw debug information
      if (this.debug) {
        this.drawDebug();
      }

      // Draw trace information
      if (this.trace) {
        this.drawTrace();
      }

      // Draw controller
      this.controller.draw();
    }
  }

  drawDebug() {
    const ctx = stage.getContext();
    let dy = 30;

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "20px 'superhelio _regular'";
    ctx.fillText("debug", 10, dy);

    ctx.font = "10px 'superhelio _regular'";
    dy += 5;

    if (this.events) {
      Object.entries(this.events.touches).forEach(([prop, value]) => {
        dy += 10;
        const text = `${prop} : ${JSON.stringify(value).slice(1, -1)}`;
        ctx.fillText(text, 10, dy);
      });
    }
  }

  drawTrace() {
    const ctx = stage.getContext();
    const { width } = stage.getDimensions();
    let dy = 30;

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = "20px 'superhelio _regular'";
    ctx.fillText("trace", width - 10, dy);

    ctx.font = "10px 'superhelio _regular'";
    dy += 5;

    const state = this.controller.getState();
    Object.keys(state).forEach(prop => {
      dy += 10;
      const text = `${prop} : ${state[prop]}`;
      ctx.fillText(text, width - 10, dy);
    });
  }

  startLoop() {
    const loop = () => {
      this.toggle = !this.toggle;
      if (!this.toggle) {
        this.draw();
      }
      this.animationFrame = requestAnimationFrame(loop);
    };
    loop();
    //this.draw();
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  handleEvent(e) {
    return this.events ? this.events.listen(e) : {};
  }

  observe() {
    return this.controller.getState();
  }
}