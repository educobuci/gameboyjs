import { GameBoy } from '../src/emulator/gameboy.js';
import assert from "assert";
import { test } from "mocha";
import { BIOS_ROM } from "../src/emulator/bios.js";

let gameBoy = new GameBoy();

// Locals
beforeEach(() => {
  gameBoy = new GameBoy();
});

test('boot rom', () => {
  gameBoy.loadRom(BIOS_ROM);
  while(gameBoy.cpu.tick());
});
