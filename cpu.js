export class Cpu {
  constructor(memoryMap) {
    this.mem = memoryMap;
    this.clock = 0;
    this.reg = {
      a:0, b:0, c:0, d:0, e:0, f: 0, h:0, l:0,   // 8-bit registers
      pc:0, sp:0,                                // 16-bit registers
      t:0,		                                   // Clock for last instruction
			pcs:0,																		 // PC size for last instruction
    };
		this.opCodes = this._loadOpCodes();
  }
  tick(codes = this.opCodes) {
    var code = this.mem.read8(this.reg.pc++);
    if (code) {
      var instruction = codes[code];
      if (instruction) {
				console.log("RUNNING ", code);
        instruction();
				this.clock += this.reg.t;
				this.reg.pc += this.reg.pcs;
				// Clean up
				this.reg.t = 0;
				this.reg.pcs = 0;
        return true;
      } else {
				console.log("NOT FOUND");
        throw("Instruction not found: 0x" + ("0" + code.toString(16).toUpperCase()).substr(-2));
      }
    }
    return false;
  }
  _loadWord(address) {
    return this.reg[address[1]] | this.reg[address[0]] << 8
  }
  _writeWord(address, value) {
    let r1 = address[0];
    let r2 = address[1];
    this.reg[r1] = (value >> 8) & 0xFF;
    this.reg[r2] = value & 0xFF;
  }
	_loadOpCodes() {
		let codes = {};
		let i = (opCode, func, pcs, t) => {
			codes[opCode] = () => {
				func();
				this.reg.pcs = pcs;
				this.reg.t = t;
			}
		}
				
		// LD SP, nn
		i(0x31, () => { this.reg.sp=this.mem.read16(this.reg.pc) }, 2, 12);
		
		// XOR n
		// Logical exclusive OR n with register A, result in A.
		i(0xAF, () => { this.reg.a=0; this.reg.f=0 }, 1, 4);
		
		return codes;
	}
}

// BIOS and temp stuff...

const biosRom = new Uint8Array([
0x31, 0xFE, 0xFF, 0xAF, 0x21, 0xFF, 0x9F, 0x32, 0xCB, 0x7C, 0x20, 0xFB, 0x21, 0x26, 0xFF, 0x0E,
0x11, 0x3E, 0x80, 0x32, 0xE2, 0x0C, 0x3E, 0xF3, 0xE2, 0x32, 0x3E, 0x77, 0x77, 0x3E, 0xFC, 0xE0,
0x47, 0x11, 0x04, 0x01, 0x21, 0x10, 0x80, 0x1A, 0xCD, 0x95, 0x00, 0xCD, 0x96, 0x00, 0x13, 0x7B,
0xFE, 0x34, 0x20, 0xF3, 0x11, 0xD8, 0x00, 0x06, 0x08, 0x1A, 0x13, 0x22, 0x23, 0x05, 0x20, 0xF9,
0x3E, 0x19, 0xEA, 0x10, 0x99, 0x21, 0x2F, 0x99, 0x0E, 0x0C, 0x3D, 0x28, 0x08, 0x32, 0x0D, 0x20,
0xF9, 0x2E, 0x0F, 0x18, 0xF3, 0x67, 0x3E, 0x64, 0x57, 0xE0, 0x42, 0x3E, 0x91, 0xE0, 0x40, 0x04,
0x1E, 0x02, 0x0E, 0x0C, 0xF0, 0x44, 0xFE, 0x90, 0x20, 0xFA, 0x0D, 0x20, 0xF7, 0x1D, 0x20, 0xF2,
0x0E, 0x13, 0x24, 0x7C, 0x1E, 0x83, 0xFE, 0x62, 0x28, 0x06, 0x1E, 0xC1, 0xFE, 0x64, 0x20, 0x06,
0x7B, 0xE2, 0x0C, 0x3E, 0x87, 0xE2, 0xF0, 0x42, 0x90, 0xE0, 0x42, 0x15, 0x20, 0xD2, 0x05, 0x20,
0x4F, 0x16, 0x20, 0x18, 0xCB, 0x4F, 0x06, 0x04, 0xC5, 0xCB, 0x11, 0x17, 0xC1, 0xCB, 0x11, 0x17,
0x05, 0x20, 0xF5, 0x22, 0x23, 0x22, 0x23, 0xC9, 0xCE, 0xED, 0x66, 0x66, 0xCC, 0x0D, 0x00, 0x0B,
0x03, 0x73, 0x00, 0x83, 0x00, 0x0C, 0x00, 0x0D, 0x00, 0x08, 0x11, 0x1F, 0x88, 0x89, 0x00, 0x0E,
0xDC, 0xCC, 0x6E, 0xE6, 0xDD, 0xDD, 0xD9, 0x99, 0xBB, 0xBB, 0x67, 0x63, 0x6E, 0x0E, 0xEC, 0xCC,
0xDD, 0xDC, 0x99, 0x9F, 0xBB, 0xB9, 0x33, 0x3E, 0x3C, 0x42, 0xB9, 0xA5, 0xB9, 0xA5, 0x42, 0x3C,
0x21, 0x04, 0x01, 0x11, 0xA8, 0x00, 0x1A, 0x13, 0xBE, 0x20, 0xFE, 0x23, 0x7D, 0xFE, 0x34, 0x20,
0xF5, 0x06, 0x19, 0x78, 0x86, 0x23, 0x05, 0x20, 0xFB, 0x86, 0x20, 0xFE, 0x3E, 0x01, 0xE0, 0x50,
0x00, 0xc3, 0x50, 0x01, 0xce, 0xed, 0x66, 0x66, 0xcc, 0x0d, 0x00, 0x0b, 0x03, 0x73, 0x00, 0x83, 
0x00, 0x0c, 0x00, 0x0d, 0x00, 0x08, 0x11, 0x1f, 0x88, 0x89, 0x00, 0x0e, 0xdc, 0xcc, 0x6e, 0xe6, 
0xdd, 0xdd, 0xd9, 0x99, 0xbb, 0xbb, 0x67, 0x63, 0x6e, 0x0e, 0xec, 0xcc, 0xdd, 0xdc, 0x99, 0x9f, 
0xbb, 0xb9, 0x33, 0x3e, 0x54, 0x45, 0x54, 0x52, 0x49, 0x53, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 
]);

// this.opCodes = {
//   // DEC B
//   0x05: () => { this.reg.b--; },
//   // LD B, n
//   0x06: () => { this.reg.b = this.mem.read8(this.reg.pc); this.reg.pc++; },
//   // INC C
//   0x0C: () => { this.reg.c++; },
//   // LD C, n
//   0x0E: () => { this.reg.c = this.mem.read8(this.reg.pc); this.reg.pc++; },
//   // LD DE, nn
//   0x11: () => { this._writeWord("de", this.mem.read16(this.reg.pc)); this.reg.pc += 2; },
//   // LD (DE), A
//   0x12: () => { this.mem.write(this._loadWord("de"), this.reg.a); },
//   // INC DE
//   0x13: () => { this._writeWord("de", this._loadWord("de") + 1); },
//   // RL A
//   0x17: () => {
//     var ci = this.reg.z & 0x10 ? 1 : 0;
//     var co = this.reg.a & 0x80 ? 0x10:0;
//     this.reg.a = (this.reg.a <<1 ) + ci;
//     this.reg.a &= 0xFF;
//     this.reg.z = (this.reg.z & 0xEF) + co;
//   },
//   // LD A, (DE)
//   0x1A: () => { this.reg.a = this.mem.read8(this._loadWord("de")); },
//   //JR NZ,n
//   0x20: () => {
//     if(this.reg.z !== 0) {
//       this.reg.pc -= (0xFF - this.mem.read8(this.reg.pc));
//     } else {
//       this.reg.pc++;
//     }
//   },
//   // LD HL, nn
//   0x21: () => { this.reg.l = this.mem.read8(this.reg.pc); this.reg.h = this.mem.read8(this.reg.pc+1); this.reg.pc += 2 },
//   // LD (HL+), A
//   0x22: () => { let hl = this._loadWord("hl"); this.mem.write(hl, this.reg.a); this._writeWord("hl", hl + 1); },
//   // INC HL
//   0x23: () => { this._writeWord("hl", this._loadWord("hl") + 1); },
//
//   // LD SP, nn
//   //0x31: () => { this.reg.sp = this.mem.read16(this.reg.pc); this.reg.pcs = 2; this.reg.t = 12; },
// 	//0x31: this.i(() => { this.reg.sp = this.mem.read16(this.reg.pc) }, 2, 12),
//
// 	// LD A, n
//   0x3E: () => { this.reg.a = this.mem.read8(this.reg.pc); this.reg.pc++; },
//   // LD (HL-), A
//   0x32: () => { let hl = this._loadWord("hl"); this.mem.write(hl, this.reg.a); this._writeWord("hl", hl - 1); },
//   // DEC A
//   0x3D: () => { this.reg.a -= 1; },
//   // LD C, A
//   0x4F: () => { this.reg.c = this.reg.a; },
//   // LD (HL), A
//   0x77: () => { this.mem.write(this._loadWord("hl"), this.reg.a); },
//   //LD A, E
//   0x7B: () => { this.reg.a = this.reg.e },
//   // XOR A
//   0xAF: () => { this.reg.a = 0; this.cycles += 4; this.reg.f = 0; },
//   // POP BC
//   0xC1: () => { this._writeWord("bc", this.mem.read16(this.reg.sp)); this.reg.sp += 2; },
//   // PUSH BC
//   0xC5: () => { this.reg.sp -= 2; this.mem.write16(this.reg.sp, this._loadWord("bc")); },
//   // RET
//   0xC9: () => { this.reg.pc = this.mem.read16(this.reg.sp); this.reg.sp -= 2; },
//   // CB Prefix
//   0xCB: () => {
//     //console.log("CB Call at: ", this.mem.read16(this.reg.pc).toString(16).toUpperCase().substr(-2));
//     this.tick(this.prefixOpCodes);
//   },
//   // CALL nn
//   0xCD: () => {
//     this.reg.sp -= 2;
//     this.mem.write16(this.reg.sp, this.reg.pc+2);
//     this.reg.pc = this.mem.read16(this.reg.pc);
//   },
//   // LD (0xFF00 + n), A
//   0xE0: () => { this.mem.write(0xFF00 + this.mem.read8(this.reg.pc), this.reg.a); this.reg.pc++; },
//   // LD (0xFF00 + C), A
//   0xE2: () => { this.mem.write(0xFF00 + this.reg.c, this.reg.a); },
//   // LD (nn), A
//   0xEA: () => { this.mem.write16(this.mem.read16(this.reg.pc), this.reg.a); this.reg.pc += 2; },
//   // CP A n
//   0xFE: () => {
//     var i = this.reg.a;
//     var m = this.mem.read8(this.reg.pc);
//     i -= m;
//     this.reg.pc++;
//     this.reg.f = (i < 0) ? 0x50 : 0x40;
//     i &= 255;
//     if (!i) {
//       this.reg.f |= 0x80;
//     }
//     if((this.reg.a ^ i ^ m) & 0x10) {
//       this.reg.f |= 0x20;
//     }
//   }
// }
// this.prefixOpCodes = {
//   // RL C
//   0x11: () => {
//     const ci = this.reg.z & 0x10 ? 1 : 0;
//     const co = this.reg.c & 0x80 ? 0x10 : 0;
//     this.reg.c = (this.reg.c << 1) + ci;
//     this.reg.c &= 0xFF;
//     this.reg.z = (this.reg.c) ? 0 : 0x80;
//     this.reg.z = (this.reg.z & 0xEF) + co;
//   },
//   // BIT 7, H
//   0x7C: () => { this.reg.z = (this.reg.h & 0x80) ? 1 : 0; }
// }
