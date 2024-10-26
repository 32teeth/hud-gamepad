import { colors } from '../utils/colors.js';
import { radius, font } from '../utils/layout.js';
const { red, green, blue, purple } = colors;

export const ButtonsLayout = Object.freeze({
  ONE_BUTTON: [
    { x: 0, y: 0, r: Math.round(radius), color: red, name: "a" }
  ],
  TWO_BUTTONS: [
    { x: Math.round(-(radius / 4)), y: Math.round(radius + (radius / 2)), r: Math.round(radius), color: red, name: "a" },
    { x: Math.round(radius + (radius / 0.75)), y: Math.round(-radius + (radius / 2)), r: Math.round(radius), color: green, name: "b" }
  ],
  THREE_BUTTONS: [
    { x: Math.round(-radius * 0.75), y: Math.round(radius * 2), r: Math.round(radius), color: red, name: "a" },
    { x: Math.round(radius * 1.75), y: Math.round(radius), r: Math.round(radius), color: green, name: "b" },
    { x: Math.round(radius * 3.5), y: Math.round(-radius), r: Math.round(radius), color: blue, name: "c" }
  ],
  FOUR_BUTTONS: [
    { x: Math.round(-radius), y: Math.round(radius), r: Math.round(radius), color: red, name: "a" },
    { x: Math.round(radius * 2 - radius), y: Math.round(-(radius * 2) + radius), r: Math.round(radius), color: green, name: "b" },
    { x: Math.round(radius * 2 - radius), y: Math.round((radius * 2) + radius), r: Math.round(radius), color: blue, name: "x" },
    { x: Math.round(radius * 3), y: Math.round(radius), r: Math.round(radius), color: purple, name: "y" }
  ]
});

export class Button {
  constructor(ctx, config) {
    if (!ctx) throw new Error('Context is required for Button');
    if (!config) throw new Error('Config is required for Button');

    this.ctx = ctx;
    this.config = config;
    this.hit = config.hit || { active: false };
  }

  draw() {
    if (!this.ctx || !this.config) return;

    const { name, color, r, w, h, hit, x, y, key } = this.config;
    const ctx = this.ctx;

    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = font.button;

    if (r) {
      // Draw circular button
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
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.fillText(name, x, y);

      if (key) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.fillText(key, x, y - r * 1.5);
      }
    } else {
      // Draw rectangular button
      const rectX = x;
      const rectY = y;
      const rectR = 10;

      if (hit?.active) {
        ctx.beginPath();
        ctx.roundRect(rectX - 5, rectY - 5, w + 10, h + 10, rectR * 2);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.roundRect(rectX, rectY, w, h, rectR);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillText(name, rectX + w / 2, rectY + h * 2);

      if (key) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        let keyX = rectX + w / 2;
        ctx.fillText(key, keyX, rectY + h * 2);
      }
    }
  }
}