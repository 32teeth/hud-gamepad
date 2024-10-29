import { JSDOM } from 'jsdom';

// Create a more complete JSDOM environment
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <canvas id="gamepad"></canvas>
      <div class="HudGamePadObserver"></div>
    </body>
  </html>
`, {
  url: 'http://localhost',
  pretendToBeVisual: true,
});

// Set up globals
global.window = dom.window;
global.document = dom.window.document;
global.navigator = {
  userAgent: 'node.js',
};

// Mock window properties
global.window.innerWidth = 1024;
global.window.innerHeight = 768;

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() { this.callback([{ contentRect: { width: 1024, height: 768 } }]); }
  unobserve() {}
  disconnect() {}
};

// Mock fetch
global.fetch = async () => ({
  ok: true,
  text: async () => ''
});

// Mock DOMMatrix
class DOMMatrix {
  constructor() {
    this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
  }
}

// Create mock context
const createMockContext = () => {
  let currentPath = new Path2D();

  return {
    canvas: {
      width: 1024,
      height: 768,
      style: {},
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 1024,
        height: 768
      })
    },
    _transform: new DOMMatrix(),
    _stack: [],
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    textBaseline: 'top',

    clearRect: function() { return true; },
    fillRect: function() { return true; },
    beginPath: function() { currentPath = new Path2D(); return true; },
    closePath: function() { return true; },
    arc: function() { return true; },
    fill: function() { return true; },
    stroke: function() { return true; },
    scale: function(x, y) {
      this._transform.a *= x;
      this._transform.d *= y;
      return true;
    },
    roundRect: function() { return this; },
    fillText: function() { return true; },
    moveTo: function() { return true; },
    lineTo: function() { return true; },
    getImageData: () => ({ data: new Uint8ClampedArray(4) }),
    putImageData: function() { return true; },
    drawImage: function() { return true; },

    save: function() {
      this._stack.push({ ...this._transform });
      return true;
    },

    restore: function() {
      if (this._stack.length) {
        this._transform = this._stack.pop();
      }
      return true;
    },

    getTransform: function() {
      return this._transform;
    },

    setTransform: function(a, b, c, d, e, f) {
      if (arguments.length === 1) {
        Object.assign(this._transform, a);
      } else {
        Object.assign(this._transform, { a, b, c, d, e, f });
      }
      return true;
    }
  };
};

// Mock HTMLCanvasElement
global.window.HTMLCanvasElement.prototype.getContext = function() {
  return createMockContext();
};

// Mock DOMMatrix globally
global.DOMMatrix = DOMMatrix;

// Mock Path2D
global.Path2D = class Path2D {};

// Mock CanvasRenderingContext2D
global.CanvasRenderingContext2D = class CanvasRenderingContext2D {
  constructor() {
    return createMockContext();
  }
};

// Event constructor polyfill
if (!global.Event) {
  global.Event = class Event {
    constructor(type) {
      this.type = type;
      this.pageX = 0;
      this.pageY = 0;
    }
  };
}