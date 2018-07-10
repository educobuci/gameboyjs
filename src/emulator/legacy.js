
let i = this._addInstruction.bind(this);
let zf = (r) => {
	this.reg.f = r === 0 ? 0x80 : 0x00;
};
i(0x20, "jr nz, n",  () => { if ((this.reg.f & 0x80) === 0) this.reg.pc = (this.reg.pc + this.mem.read8(this.reg.pc)) & 0xFF; }, 8, 1);
i(0x21, "ld hl, nn", () => { this.reg.l = this.mem.read8(this.reg.pc); this.reg.h = this.mem.read8(this.reg.pc+1) }, 12, 2);
i(0x31, "ld sp, nn", () => { this.reg.sp=this.mem.read16(this.reg.pc) }, 12, 2);
i(0x32, "ld hl-, a", () => { let hl = this._loadWord("hl"); this.mem.write(hl, this.reg.a); this._writeWord("hl", hl - 1); }, 8);
i(0xA8, "xor b",     () => { this.reg.a^=this.reg.b; zf(this.reg.a) }, 4);
i(0xAF, "xor a",     () => { this.reg.a=0; this.reg.f=0x80 }, 4);
// CB prefixed
i(0xCB, "prefix",    () => { this.tick(this.prefixInstructions) }, 4);

this.opCodes = {
  // DEC B
  0x05: () => { this.reg.b--; },
  // LD B, n
  0x06: () => { this.reg.b = this.mem.read8(this.reg.pc); this.reg.pc++; },
  // INC C
  0x0C: () => { this.reg.c++; },
  // LD C, n
  0x0E: () => { this.reg.c = this.mem.read8(this.reg.pc); this.reg.pc++; },
  // LD DE, nn
  0x11: () => { this._writeWord("de", this.mem.read16(this.reg.pc)); this.reg.pc += 2; },
  // LD (DE), A
  0x12: () => { this.mem.write(this._loadWord("de"), this.reg.a); },
  // INC DE
  0x13: () => { this._writeWord("de", this._loadWord("de") + 1); },
  // RL A
  0x17: () => {
    var ci = this.reg.z & 0x10 ? 1 : 0;
    var co = this.reg.a & 0x80 ? 0x10:0;
    this.reg.a = (this.reg.a <<1 ) + ci;
    this.reg.a &= 0xFF;
    this.reg.z = (this.reg.z & 0xEF) + co;
  },
  // LD A, (DE)
  0x1A: () => { this.reg.a = this.mem.read8(this._loadWord("de")); },
  //JR NZ,n
  0x20: () => {
    if(this.reg.z !== 0) {
      this.reg.pc -= (0xFF - this.mem.read8(this.reg.pc));
    } else {
      this.reg.pc++;
    }
  },
  // LD HL, nn
  0x21: () => { this.reg.l = this.mem.read8(this.reg.pc); this.reg.h = this.mem.read8(this.reg.pc+1); this.reg.pc += 2 },
  // LD (HL+), A
  0x22: () => { let hl = this._loadWord("hl"); this.mem.write(hl, this.reg.a); this._writeWord("hl", hl + 1); },
  // INC HL
  0x23: () => { this._writeWord("hl", this._loadWord("hl") + 1); },

  // LD SP, nn
  //0x31: () => { this.reg.sp = this.mem.read16(this.reg.pc); this.reg.pcs = 2; this.reg.t = 12; },
	//0x31: this.i(() => { this.reg.sp = this.mem.read16(this.reg.pc) }, 2, 12),

	// LD A, n
  0x3E: () => { this.reg.a = this.mem.read8(this.reg.pc); this.reg.pc++; },
  // LD (HL-), A
  0x32: () => { let hl = this._loadWord("hl"); this.mem.write(hl, this.reg.a); this._writeWord("hl", hl - 1); },
  // DEC A
  0x3D: () => { this.reg.a -= 1; },
  // LD C, A
  0x4F: () => { this.reg.c = this.reg.a; },
  // LD (HL), A
  0x77: () => { this.mem.write(this._loadWord("hl"), this.reg.a); },
  //LD A, E
  0x7B: () => { this.reg.a = this.reg.e },
  // XOR A
  0xAF: () => { this.reg.a = 0; this.cycles += 4; this.reg.f = 0; },
  // POP BC
  0xC1: () => { this._writeWord("bc", this.mem.read16(this.reg.sp)); this.reg.sp += 2; },
  // PUSH BC
  0xC5: () => { this.reg.sp -= 2; this.mem.write16(this.reg.sp, this._loadWord("bc")); },
  // RET
  0xC9: () => { this.reg.pc = this.mem.read16(this.reg.sp); this.reg.sp -= 2; },
  // CB Prefix
  0xCB: () => {
    //console.log("CB Call at: ", this.mem.read16(this.reg.pc).toString(16).toUpperCase().substr(-2));
    this.tick(this.prefixOpCodes);
  },
  // CALL nn
  0xCD: () => {
    this.reg.sp -= 2;
    this.mem.write16(this.reg.sp, this.reg.pc+2);
    this.reg.pc = this.mem.read16(this.reg.pc);
  },
  // LD (0xFF00 + n), A
  0xE0: () => { this.mem.write(0xFF00 + this.mem.read8(this.reg.pc), this.reg.a); this.reg.pc++; },
  // LD (0xFF00 + C), A
  0xE2: () => { this.mem.write(0xFF00 + this.reg.c, this.reg.a); },
  // LD (nn), A
  0xEA: () => { this.mem.write16(this.mem.read16(this.reg.pc), this.reg.a); this.reg.pc += 2; },
  // CP A n
  0xFE: () => {
    var i = this.reg.a;
    var m = this.mem.read8(this.reg.pc);
    i -= m;
    this.reg.pc++;
    this.reg.f = (i < 0) ? 0x50 : 0x40;
    i &= 255;
    if (!i) {
      this.reg.f |= 0x80;
    }
    if((this.reg.a ^ i ^ m) & 0x10) {
      this.reg.f |= 0x20;
    }
  }
}
this.prefixOpCodes = {
  // RL C
  0x11: () => {
    const ci = this.reg.z & 0x10 ? 1 : 0;
    const co = this.reg.c & 0x80 ? 0x10 : 0;
    this.reg.c = (this.reg.c << 1) + ci;
    this.reg.c &= 0xFF;
    this.reg.z = (this.reg.c) ? 0 : 0x80;
    this.reg.z = (this.reg.z & 0xEF) + co;
  },
  // BIT 7, H
  0x7C: () => { this.reg.z = (this.reg.h & 0x80) ? 1 : 0; }
}