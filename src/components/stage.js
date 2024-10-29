let canvas;
let ctx;
let width = window.innerWidth;
let height = window.innerHeight;

export const scale = [
  (window.innerWidth / width),
  (window.innerHeight / height)
];

export let canvasWidth = width * scale[0];
export let canvasHeight = height * scale[1];

export const stage = {
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

  updateDimensions(newWidth, newHeight) {
    width = newWidth;
    height = newHeight;
    scale[0] = window.innerWidth / width;
    scale[1] = window.innerHeight / height;
    canvasWidth = width * scale[0];
    canvasHeight = height * scale[1];
    this.adjust();
  },

  adjust() {
    if (!canvas) return;

    ctx = canvas.getContext('2d');

    // Store the current transform
    const currentTransform = ctx.getTransform();

    // Reset the canvas width/height (this also clears it)
    ctx.canvas.width = canvasWidth;
    ctx.canvas.height = canvasHeight;

    // Clear any remaining content
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Reset the transform and apply scaling
    ctx.setTransform(scale[0], 0, 0, scale[1], 0, 0);
  },

  getContext() {
    return ctx;
  },

  getDimensions() {
    return { width, height };
  },

  getCanvas() {
    return canvas;
  },

  clear() {
    if (ctx) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }
  }
};

// Add roundRect to CanvasRenderingContext2D prototype if not exists
if (!CanvasRenderingContext2D.prototype.roundRect) {
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
  };
}