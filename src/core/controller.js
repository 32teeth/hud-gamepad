import { Layout, ButtonType, button_offset } from '../utils/layout.js';
import { colors } from '../utils/colors.js';
import { Button, ButtonsLayout } from '../components/button.js';
import { Joystick } from '../components/joystick.js';
import { stage } from '../components/stage.js';

export class Controller {
  constructor() {
    this.position = {};
    this.buttonsLayout = [];
    this.buttons = [];
    this.joystick = null;
    this.layout = Layout.BOTTOM_RIGHT;
    this.start = false;
    this.select = false;
    this.buttonMap = new Map();
    this.stateMap = {};
    this.config = {};
  }

  init(config) {
    if (!config) return;

    this.config = { ...config };
    this.layout = config.layout || Layout.BOTTOM_RIGHT;
    this.start = config.start || false;
    this.select = config.select || false;

    // Initialize button layout
    if (config.buttons) {
      let index = Math.min(config.buttons.length - 1, Object.keys(ButtonsLayout).length - 1);
      index = index > 4 ? 4 : index;
      this.buttonsLayout = [...ButtonsLayout[Object.keys(ButtonsLayout)[index]]];
      config.buttons.forEach((button, n) => {
        if (button.name) this.buttonsLayout[n].name = button.name;
        if (button.color) this.buttonsLayout[n].color = button.color;
        if (button.key) this.buttonsLayout[n].key = button.key;
      });
    } else {
      this.buttonsLayout = [...ButtonsLayout.FOUR_BUTTONS];
    }

    // Add start/select buttons if configured
    const { width, height } = stage.getDimensions();
    if (this.start || this.select) {
      const buttonConfig = new Map([
        [ButtonType.START, { x: width / 2, y: height - 65, w: 50, h: 15, color: colors.black, name: ButtonType.START }],
        [ButtonType.SELECT, { x: width / 2, y: height - 65, w: 50, h: 15, color: colors.black, name: ButtonType.SELECT }]
      ]);

      if (this.start) this.buttonsLayout.push(buttonConfig.get(ButtonType.START));
      if (this.select) this.buttonsLayout.push(buttonConfig.get(ButtonType.SELECT));
    }

    // Calculate shift for button positioning
    const shift = this.buttonsLayout.reduce((acc, button) => {
      if (button.r) {
        acc += button.r;
        if (this.layout === Layout.TOP_LEFT) {
          button.y -= button.r * 2;
        }
      }
      return acc;
    }, 0);

    this.setPosition(shift);
    this.initButtons();

    // Initialize joystick if configured
    if (config.joystick) {
      this.joystick = new Joystick();
      this.joystick.init(this.position);
      ["x-dir", "y-dir", "x-axis", "y-axis"].forEach(key => this.stateMap[key] = 0);
    }
  }

  setPosition(shift) {
    const { width, height } = stage.getDimensions();
    const positions = {
      [Layout.TOP_LEFT]: { x: shift + button_offset.x, y: button_offset.y },
      [Layout.TOP_RIGHT]: { x: width - button_offset.x, y: button_offset.y },
      [Layout.BOTTOM_LEFT]: { x: shift + button_offset.x, y: height - button_offset.y },
      [Layout.BOTTOM_RIGHT]: { x: width - button_offset.x, y: height - button_offset.y }
    };
    this.position = positions[this.layout];
  }

  initButtons() {
    const ctx = stage.getContext();
    const { width } = stage.getDimensions();

    this.buttonsLayout.forEach(config => {
      const buttonConfig = { ...config };
      if (buttonConfig.r) {
        buttonConfig.x = this.position.x - config.x;
        buttonConfig.y = this.position.y - config.y;
        const r = buttonConfig.r;
        buttonConfig.hit = {
          x: [buttonConfig.x - r, buttonConfig.x + r * 2],
          y: [buttonConfig.y - r, buttonConfig.y + r * 2],
          active: false
        };
      } else {
        buttonConfig.x = buttonConfig.x - buttonConfig.w;
        if (this.start && this.select) {
          buttonConfig.x = buttonConfig.name === "select" ?
            width / 2 - buttonConfig.w - buttonConfig.h * 2 :
            width / 2;
        }
        buttonConfig.hit = {
          x: [buttonConfig.x, buttonConfig.x + buttonConfig.w],
          y: [buttonConfig.y, buttonConfig.y + buttonConfig.h],
          active: false
        };
      }
      this.stateMap[buttonConfig.name] = 0;
      this.buttons.push(new Button(ctx, buttonConfig));
    });
  }

  draw() {
    if (this.buttons.length > 0) {
      this.buttons.forEach(button => button.draw());
    }
    if (this.joystick) {
      this.joystick.draw();
    }
  }

  getState() {
    return this.stateMap;
  }

  updateState(inputState) {
    Object.assign(this.stateMap, inputState);
  }

  updateButtonState(buttonName, isActive) {
    if (this.stateMap.hasOwnProperty(buttonName)) {
      this.stateMap[buttonName] = isActive ? 1 : 0;
    }
  }

  resetStates() {
    Object.keys(this.stateMap).forEach(key => {
      this.stateMap[key] = 0;
    });
  }
}