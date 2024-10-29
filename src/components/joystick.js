import { colors } from '../utils/colors.js';
import { stage } from './stage.js';

export class Joystick {
  constructor() {
    this.radius = 40;
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.ctx = stage.getContext();
  }

  init(position) {
    const { width } = stage.getDimensions();
    Object.assign(this, {
      radius: 40,
      x: width - position.x,
      y: position.y,
      dx: width - position.x,
      dy: position.y
    });
  }

  draw() {
    const drawCircle = (x, y, radius, color) => {
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.closePath();
    };

    drawCircle(this.x, this.y, this.radius, colors.joystick.base);
    drawCircle(this.x, this.y, this.radius - 5, colors.joystick.dust);
    drawCircle(this.x, this.y, 10, colors.joystick.stick);
    drawCircle(this.dx, this.dy, this.radius - 5, colors.joystick.shadow);
    drawCircle(this.dx, this.dy, this.radius - 10, colors.joystick.ball);
  }

  updatePosition(dx, dy) {
    const halfRadius = this.radius / 2;
    if (Math.abs(dx) < halfRadius) this.dx = this.x + dx;
    if (Math.abs(dy) < halfRadius) this.dy = this.y + dy;
    return {
      x: (this.dx - this.x) / halfRadius,
      y: (this.dy - this.y) / halfRadius,
      xDir: Math.sign(this.dx - this.x),
      yDir: Math.sign(this.dy - this.y)
    };
  }

  reset() {
    Object.assign(this, { dx: this.x, dy: this.y });
  }
}