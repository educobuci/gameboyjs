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
test('LD SP,NN (0x31)', () => {
  let rom = [0x31, 0xFE, 0xFF];
  run(rom);
	cpu({ sp: 0xFFFE, clock: 12, pc: 3 });
});

test('XOR A (0xAF)', () => {
  let rom = [0xAF];
  gameBoy.cpu.reg.a = 0x01;
  gameBoy.cpu.reg.f = 0xFF;
  run(rom);
  cpu({ a: 0x00, f: 0x80, clock: 4, pc: 1 });
});

test('XOR B (0xA8)', () => {
	let rom = [0xA8];
	gameBoy.cpu.reg.a = 0x03;
	gameBoy.cpu.reg.b = 0x0C;
	gameBoy.cpu.reg.f = 0xFF;
	run(rom);
	cpu({ a: 0x0F, f: 0x00, clock: 4, pc: 1 });
});

test('LD HL,NN (0x21)', () => {
  let rom = [0x21, 0xFE, 0xFF];
  run(rom);
  cpu({ h: 0xFF, l: 0xFE, clock: 12, pc: 3 });
});

test('LD (HL-),A (0x32)', () => {
  let rom = [0x32];
  gameBoy.cpu.reg.a = 0xAA;
  gameBoy.cpu.reg.h = 0x9F;
  gameBoy.cpu.reg.l = 0xFF;
  run(rom);
  cpu({ h: 0x9F, l: 0xFE, clock: 8, pc: 1 });
  assert.equal(gameBoy.memoryMap.read8(0x9FFF), 0xAA);
});

// Set zero flag (F/Z) if the 7th bit of the register H is 0. Always set flag half carry (F/H).
test('BIT 7,H (0xCB 0x7C)', () => {
  let rom = [0xCB, 0x7C];
  gameBoy.cpu.reg.h = 0x80;
  run(rom);
  cpu({ f: 0x20, clock:12, pc: 2 });
});

test('BIT 7,H (0xCB 0x7C) - Zero', () => {
  let rom = [0xCB, 0x7C];
  gameBoy.cpu.reg.h = 0x7F;
  run(rom);
  cpu({ f: 0xA0, clock:12, pc: 2 });
});

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