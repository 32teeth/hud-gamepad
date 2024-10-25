import { expect } from 'chai';
import sinon from 'sinon';
import { JSDOM } from 'jsdom';
import { GamePad } from '../index.js';

describe('GamePad', () => {
  let handler, callbackSpy, window;

  // Setup the JSDOM environment and the callback spy before each test
  beforeEach(() => {
    const dom = new JSDOM();
    window = dom.window;
    global.window = window;

    callbackSpy = sinon.spy();
  })

  afterEach(() => {
    sinon.restore();
  });

  it('should create a new GamePad instance', () => {
    const gamePad = new GamePad();
    expect(gamePad).to.be.an.instanceof(GamePad);
  });
});
