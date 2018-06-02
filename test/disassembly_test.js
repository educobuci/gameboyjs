import { GameBoy } from '../src/emulator/gameboy.js';
import assert from 'assert';
import { test } from "mocha";

let gameBoy = new GameBoy();

// Locals
beforeEach(() => {
  gameBoy = new GameBoy();
});

test('Instruction Disassembly', () => {
  const rom = [0x31, 0xFE, 0xFF];
  gameBoy.loadRom(rom);
  const asm = gameBoy.cpu.disassembly();
  assert.equal(asm[0].opCode, 0x31);
});

test('LD RR D16', () => {
  const rom = [
    0x01, 0xFE, 0xFF, // BC
    0x11, 0xFE, 0xFF, // DE
    0x21, 0xFE, 0xFF, // HL
    0x31, 0xFE, 0xFF, // SP
  ];
  gameBoy.loadRom(rom);
  const asm = gameBoy.cpu.disassembly();
  assert(asm[0].func.name.indexOf('ld_rr_d16') > 0);
  assert(asm[3].func.name.indexOf('ld_rr_d16') > 0);
  assert(asm[6].func.name.indexOf('ld_rr_d16') > 0);
  assert(asm[9].func.name.indexOf('ld_rr_d16') > 0);
});