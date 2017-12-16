import {GameBoy} from '../gameboy.js';
import assert from "assert";
import {test} from "mocha";

let gameBoy = new GameBoy();

// Locals
beforeEach(() => {
  gameBoy = new GameBoy();
});

test('Load rom', () => {
  let rom = [];
  run(rom);
  cpu({sp: 0, a: 0, b: 0, pc: 0 });
});

// Instructions test
test('LD SP, nn (0x31)', () => {
  let rom = [0x31, 0xFE, 0xFF];
  run(rom);
	cpu({ sp: 0xFFFE, clock: 12, pc: 3 });
});

test('XOR a (0xAF)', () => {
  let rom = [0xAF];
  gameBoy.cpu.reg.a = 0x01;
  gameBoy.cpu.reg.f = 0xFF;
  run(rom);
  cpu({ a: 0x00, f: 0x80, clock: 4, pc: 1 });
});

test('XOR b (0xA8)', () => {
	let rom = [0xA8];
	gameBoy.cpu.reg.a = 0x03;
	gameBoy.cpu.reg.b = 0x0C;
	gameBoy.cpu.reg.f = 0xFF;
	run(rom);
	cpu({ a: 0x0F, f: 0x00, clock: 4 });
});

// test('LD HL, nn', () => {
//   let rom = [0x21, 0xFE, 0xFF];
//   run(rom);
//   cpu({ h: 0xFF, l: 0xFE });
// });

// Helpers
function run (rom) {
  gameBoy.loadRom(rom);
  gameBoy.run();
}

function cpu (values) {
  let regs = ["a", "b", "c", "d", "e", "f", "h", "l", "sp", "pc"];
	for (let i = 0; i < regs.length; i++) {
		let reg = regs[i];
		if (values.hasOwnProperty(reg)) {
			assert.equal(gameBoy.cpu.reg[reg], values[reg]);
		}
	}
	if (values.hasOwnProperty("clock")) {
		assert.equal(gameBoy.cpu.clock, values["clock"]);
	}
}