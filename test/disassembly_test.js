import assert from 'assert';
import { test } from "mocha";
import disassembly from '../src/emulator/disassembler.js';
import { MemoryMap } from "../src/emulator/memoryMap";
let memoryMap;

// Locals
beforeEach(() => {
  memoryMap = new MemoryMap();
});

test('Instruction Disassembly', () => {
  const rom = [0x31, 0xFE, 0xFF];
  memoryMap.loadRom(rom);
  const asm = disassembly(memoryMap);
  assert.equal(asm[0].opCode, 0x31);
});