import { MultiKeyHandler } from 'https://unpkg.com/multi-key-handler/index.js';
import { GamePad } from 'https://unpkg.com/hud-gamepad/src/index.js';

const buttons = [
  { name: "🔍", color: "rgba(255,255,0,0.5)", key: "z" },
  { name: "✥", color: "rgba(255,255,0,0.5)", key: "x" },
];
const start = { name: "start", key: "b" };
const select = { name: "select", key: "v" }

const keys = buttons.map(({ key }) => key).join("") + start.key + select.key;
const section = document.querySelector("section");
const cb = (keys) => {
  GamePad.events(keys);
  const degrees = 10;
  const px = 10;
  if (keys) {
    const updateProperty = (element, property, value, unit = '') => {
      let currentValue = element.style.getPropertyValue(property);
      if (!currentValue) currentValue = 0;
      element.style.setProperty(property, `${parseFloat(currentValue) + value}${unit}`);
    };

    if (keys.up || keys.down) {
      const dir = keys.up ? 1 : -1;
      if(keys.x) {
        updateProperty(section, "--ty", dir * px, "px");
        return;
      }
      if(keys.z) {
        updateProperty(section, "--tz", dir * px, "px");
        return;
      }
      updateProperty(section, "--x", dir * degrees, "deg");
    }
    if (keys.left || keys.right) {
      const dir = keys.left ? 1 : -1;
      if(keys.x) {
        updateProperty(section, "--tx", dir * px, "px");
        return;
      }
      updateProperty(section, "--y", dir * degrees, "deg");
    }
  }
};
document.addEventListener('DOMContentLoaded', () => {
  GamePad.setup({
    canvas: "gamepad",
    joystick: true,
    buttons,
    trace: true,
    debug: true,
  });
  const multikey = new MultiKeyHandler((keys) => {
    cb(keys);
  }, { keys, arrows: true });

});

