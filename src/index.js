import { GamePad as GamePadCore } from './core/gamepad.js';

/**
 * HudGamePad module provides a customizable on-screen gamepad interface.
 * @module HudGamePad
 */

/**
 * Creates a new instance of HudGamePad
 * @returns {Object} HudGamePad interface
 */
export const HudGamePad = (function() {
  const gamepad = new GamePadCore();

  return {
    /**
     * Initializes the HudGamePad with the given configuration.
     * @param {Object} config - Configuration object for the gamepad.
     * @param {HTMLCanvasElement} [config.canvas] - Canvas element to use for the gamepad.
     * @param {boolean} [config.joystick] - Enable joystick.
     * @param {Array<Object>} [config.buttons] - Custom button configuration.
     * @param {boolean} [config.start] - Enable start button.
     * @param {boolean} [config.select] - Enable select button.
     * @param {boolean} [config.trace] - Enable trace mode.
     * @param {boolean} [config.debug] - Enable debug mode.
     * @param {boolean} [config.hint] - Enable button hints.
     * @param {Function} [config.observerFunction] - Function to call on button state change.
     */
    setup: function(config) {
      return gamepad.setup(config);
    },

    /**
     * Draws the gamepad on the canvas.
     */
    draw: function() {
      gamepad.draw();
    },

    /**
     * Handles events for the gamepad.
     * @param {Event} e - Event object.
     * @returns {Object} - Current state of the gamepad.
     */
    events: function(e) {
      return gamepad.handleEvent(e);
    },

    /**
     * Observes the current state of the gamepad.
     * @returns {Object} - Current state of the gamepad.
     */
    observe: function() {
      return gamepad.observe();
    }
  };
})();

// For backwards compatibility
export const GamePad = HudGamePad;