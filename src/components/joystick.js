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

    this.radius = 40;
    this.x = width - position.x;
    this.y = position.y;
    this.dx = this.x;
    this.dy = this.y;
  }

  draw() {
    // Base circle
    this.ctx.fillStyle = colors.joystick.base;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    this.ctx.fill();
    this.ctx.closePath();

    // Dust circle
    this.ctx.fillStyle = colors.joystick.dust;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius - 5, 0, 2 * Math.PI, false);
    this.ctx.fill();
    this.ctx.closePath();

    // Center stick
    this.ctx.fillStyle = colors.joystick.stick;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI, false);
    this.ctx.fill();
    this.ctx.closePath();

    // Moving ball
    this.ctx.fillStyle = colors.joystick.ball;
    this.ctx.beginPath();
    this.ctx.arc(this.dx, this.dy, this.radius - 10, 0, 2 * Math.PI, false);
    this.ctx.fill();
    this.ctx.closePath();
  }

  reset() {
    this.dx = this.x;
    this.dy = this.y;
  }
}