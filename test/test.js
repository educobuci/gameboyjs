import {GameBoy} from '../gameboy.js';
var assert = require('assert');

var gameBoy = new GameBoy();

// Locals
beforeEach(() => {
  gameBoy = new GameBoy();
});

test('Load rom', () => {
  let rom = [];
  runRom(rom);
  assert.equal(gameBoy.cpu.reg.sp, 0);
});

// Instructions test
test('LD SP, nn', () => {
  let rom = [0x31, 0xFE, 0xFF];
  runRom(rom);
  assert.equal(gameBoy.cpu.reg.sp, 0xFFFE);
  assert.equal(gameBoy.cpu.cycles, 12);
});

test('XOR A B C D E H L', () => {
  let regs = ["a", "b", "c", "d", "e", "h", "l"];
  for (var i = 0; i < regs.length; i++) {
    var register = regs[i];
    let opcode = i + 0xA7;
    // Treat AF as special case for reg A.
    if (i == 0) opcode += 8;
    let rom = [opcode];
    gameBoy.cpu.reg[register] = 0x01;
    gameBoy.cpu.reg.f = 0xFF;
    runRom(rom);
    assert.equal(gameBoy.cpu.reg[register], 0x00, "Fail XOR " + register);
    assert.equal(gameBoy.cpu.cycles, 4);
    assert.equal(gameBoy.cpu.reg.f, 0x00);
  }
});

// Helpers
function runRom (rom) {
  gameBoy.loadRom(rom);
  gameBoy.run();
}