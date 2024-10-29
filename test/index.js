import { expect } from 'chai';
import sinon from 'sinon';
import { GamePad } from '../src/index.js';

describe('GamePad', () => {
  let mockContext, spies;

  beforeEach(() => {
    // Get the canvas and context
    const canvas = document.getElementById('gamepad');
    mockContext = canvas.getContext('2d');

    // Create and store spies
    spies = {
      clearRect: sinon.replace(mockContext, 'clearRect', sinon.fake()),
      beginPath: sinon.replace(mockContext, 'beginPath', sinon.fake()),
      arc: sinon.replace(mockContext, 'arc', sinon.fake()),
      fill: sinon.replace(mockContext, 'fill', sinon.fake()),
      stroke: sinon.replace(mockContext, 'stroke', sinon.fake()),
      closePath: sinon.replace(mockContext, 'closePath', sinon.fake()),
      fillText: sinon.replace(mockContext, 'fillText', sinon.fake()),
      setTransform: sinon.replace(mockContext, 'setTransform', sinon.fake())
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it.skip('should initialize GamePad with the given configuration', async () => {
    const config = {
      canvas: 'gamepad',
      joystick: true,
      buttons: [{ name: 'A', color: 'red', key: 'KeyA' }]
    };

    await GamePad.setup(config);

    // Wait for any post-setup operations
    await new Promise(resolve => setTimeout(resolve, 0));

    // Verify that at least some canvas operations occurred
    const anyCanvasOperation = Object.values(spies).some(spy => spy.called);
    expect(anyCanvasOperation, 'Expected at least one canvas operation').to.be.true;
  });

  it.skip('should draw the gamepad on the canvas', async () => {
    await GamePad.setup({
      canvas: 'gamepad',
      joystick: true
    });

    // Wait for any post-setup operations
    await new Promise(resolve => setTimeout(resolve, 0));

    GamePad.draw();

    // Verify canvas operations occurred
    const drawOperations = [
      spies.clearRect,
      spies.beginPath,
      spies.arc,
      spies.fill,
      spies.closePath
    ];

    const anyDrawOperation = drawOperations.some(spy => spy.called);
    expect(anyDrawOperation, 'Expected at least one draw operation').to.be.true;
  });

  it('should handle events and return the current state of the gamepad', async () => {
    await GamePad.setup({
      canvas: 'gamepad',
      joystick: true
    });

    const state = GamePad.events({
      left: true
    });

    expect(state).to.be.an('object');
  });

  it('should observe and return the current state of the gamepad', async () => {
    await GamePad.setup({
      canvas: 'gamepad',
      joystick: true
    });

    const state = GamePad.observe();
    expect(state).to.be.an('object');
  });

  it('should call observer function when state changes', async () => {
    const observer = sinon.spy();

    await GamePad.setup({
      canvas: 'gamepad',
      joystick: true,
      observerFunction: observer
    });

    GamePad.events({ left: true });
    expect(observer.called).to.be.true;
  });

  it('should handle joystick movement', async () => {
    await GamePad.setup({
      canvas: 'gamepad',
      joystick: true
    });

    const touchEvent = new Event('touchstart');
    touchEvent.touches = [{
      identifier: 1,
      pageX: 100,
      pageY: 100
    }];

    GamePad.events(touchEvent);
    const state = GamePad.observe();
    expect(state).to.have.any.keys('x-axis', 'y-axis', 'x-dir', 'y-dir');
  });

  it('should handle button presses', async () => {
    await GamePad.setup({
      canvas: 'gamepad',
      buttons: [{ name: 'a', key: 'x' }]
    });

    GamePad.events({ x: true });
    const state = GamePad.observe();
    expect(state).to.have.property('a');
  });
});