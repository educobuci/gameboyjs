import {GameBoy} from '../gameboy.js';

var assert = require('assert');
let gameBoy = new GameBoy();

test('load', () => {
  let rom = [];
  runRom(rom);
  assert.equal(gameBoy.cpu.reg.pc, 1);
});

// Helpers
function runRom (rom) {
  gameBoy.loadRom(rom);
  gameBoy.run();
}