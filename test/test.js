import {GameBoy} from '../gameboy.js';
var assert = require('assert');

var gameBoy = new GameBoy();

// Locals
beforeEach(() => {
  gameBoy = new GameBoy();
});

test('Load rom', () => {
  let rom = [];
  run(rom);
  assert.equal(gameBoy.cpu.reg.sp, 0);
});

// Instructions test
test('LD SP, nn (0x31)', () => {
  let rom = [0x31, 0xFE, 0xFF];
  run(rom);
	cpu({sp: 0xFFFE, clock: 12});
});

test('XOR a (0xAF)', () => {
	let rom = [0xAF];
	gameBoy.cpu.reg.a = 0x01;
	gameBoy.cpu.reg.f = 0xFF;
	run(rom);
	cpu({ a: 0, clock: 4 });
});

test('XOR b (0xA8)', () => {
	let rom = [0xA8];
	gameBoy.cpu.reg.b = 0x01;
	gameBoy.cpu.reg.f = 0xFF;
	run(rom);
	cpu({ b: 0, clock: 4 });
});

// test('XOR A B C D E H L', () => {
//   let regs = ["a", "b", "c", "d", "e", "h", "l"];
//   for (var i = 0; i < regs.length; i++) {
//     var register = regs[i];
//     let opcode = i + 0xA7;
//     // Treat AF as special case for reg A.
//     if (i == 0) opcode += 8;
//     let rom = [opcode];
//     gameBoy.cpu.reg[register] = 0x01;
//     gameBoy.cpu.reg.f = 0xFF;
//     run(rom);
//     assert.equal(gameBoy.cpu.reg[register], 0x00, "Fail XOR " + register);
//     assert.equal(gameBoy.cpu.clock, 4);
//     assert.equal(gameBoy.cpu.reg.f, 0x00);
//   }
// });

// Helpers
function run (rom) {
  gameBoy.loadRom(rom);
  gameBoy.run();
}

function cpu (values) {
	let regs = ["a", "b", "c", "d", "e", "f", "h", "l", "sp", "pc"];
	for (var i = 0; i < regs.length; i++) {
		let reg = regs[i];
		if (values.hasOwnProperty(reg)) {
			assert.equal(gameBoy.cpu.reg[reg], values[reg]);
		}
	}
	if (values.hasOwnProperty("clock")) {
		assert.equal(gameBoy.cpu.clock, values["clock"]);
	}
}