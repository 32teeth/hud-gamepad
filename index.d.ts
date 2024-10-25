declare module 'hud-gamepad' {
  type ButtonConfig = {
    name: string;
    color: string;
    key: string;
  };

  interface HudGamePadConfig {
    canvas: string;
    start?: ButtonConfig;
    select?: ButtonConfig;
    trace?: boolean;
    debug?: boolean;
    hint?: boolean;
    buttons?: ButtonConfig[];
  }

  export const HudGamePad: {
    setup(config: HudGamePadConfig): void;
    draw(): void;
    events(e: any): any;
    observe(): any;
  };

  export const GamePad = HudGamePad;
}