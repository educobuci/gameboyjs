export class MemoryMap {
  constructor() { 
    this.memory = new Uint8Array(64 * 1024);
    this.memory.fill(0xFF, 0x8000, 0xA000);
  }
  loadRom(rom) {
    this.memory.set(rom);
  }
  read8(address) {
    return this.memory[address];
  }
  read16(address) {
    return this.read8(address) | this.read8(address + 1) << 8;
  }
  write(address, value) {
    if (address > 0x4000) {
      this.memory[address] = value;
    } else {
      throw ("Attempt to write the ROM at " + address + " = " + value);
    }
  }
  write16(address, value) {
    this.write(address, value & 0xFF);
    this.write(address+1, (value >> 8) & 0xFF);
  }
}