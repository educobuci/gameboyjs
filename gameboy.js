import {Cpu} from "./cpu.js";
import {MemoryMap} from "./memoryMap.js";

export class GameBoy {
  // Constructor
  constructor() {
    this.memoryMap = new MemoryMap();
  }

  // Rom load
  loadRom(rom) {
    this.rom = rom;
    this.memoryMap.loadRom(this.rom);
    this.cpu = new Cpu(this.memoryMap);
  }

  // Run the loaded rom
  run() {
    while (this.cpu.tick()) { }
  }
}