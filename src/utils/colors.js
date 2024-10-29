const opacity = 0.75;

export const createRgba = (r, g, b, a = opacity) => `rgba(${r},${g},${b},${a})`;

export const colors = {
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
    dust: createRgba(255, 255, 255, 0.1),
    stick: createRgba(204, 204, 204, 1),
    ball: createRgba(255, 255, 255, 1),
    shadow: createRgba(0, 0, 0, 0.1)
  }
};