import { MultiKeyHandler } from 'https://unpkg.com/multi-key-handler/index.js';
//import { GamePad } from './node_modules/hud-gamepad/index.js';
import { GamePad } from '../src/index.js';

const buttons = [
  { name: "a", color: "rgba(255,0,0,0.5)", key: "s" },
  { name: "b", color: "rgba(0,255,0,0.5)", key: "a" },
  { name: "x", color: "rgba(0,0,255,0.5)", key: "w" },
  { name: "y", color: "rgba(255,0,255,0.5)", key: "q" }
];
const start = { name: "start", key: "b" };
const select = { name: "select", key: "v" }

const keys = buttons.map(({ key }) => key).join("") + start.key + select.key;

document.addEventListener('DOMContentLoaded', () => {
  GamePad.setup({
    canvas: "gamepad",
    joystick: true,
    buttons,
    start,
    select,
    trace: true,
    debug: true,
    hint: true,
  });
  const multikey = new MultiKeyHandler(function(keys) {
    GamePad.events(keys);
  }, { keys, arrows: true, debug: true });
});