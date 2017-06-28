import {Cpu} from "./cpu.js";
import {MemoryMap} from "./memoryMap.js";

export class GameBoy {
  // Constructor
  constructor() {
    this.memoryMap = new MemoryMap();
    this.cpu = new Cpu(this.memoryMap);
  }

  // Rom load
  loadRom(rom) {
    this.memoryMap.loadRom(rom);
  }

  // Run the loaded rom
  run() {
    while (this.cpu.tick()) { }
  }
}