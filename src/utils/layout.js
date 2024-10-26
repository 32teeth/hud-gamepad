export const Layout = Object.freeze({
  TOP_LEFT: "TOP_LEFT",
  TOP_RIGHT: "TOP_RIGHT",
  BOTTOM_LEFT: "BOTTOM_LEFT",
  BOTTOM_RIGHT: "BOTTOM_RIGHT"
});

export const ButtonType = Object.freeze({
  START: "start",
  SELECT: "select"
});

export const radius = 25;

export const fontSizes = {
  button: 14,
  small: 10,
  medium: 20,
  large: 24,
  huge: 48
};

export const font = Object.fromEntries(
  Object.entries(fontSizes).map(([key, size]) => [key, `${size}px 'superhelio _regular'`])
);

export const button_offset = { x: (radius * 3), y: (radius * 3) };