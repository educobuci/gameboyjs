import { opCodes } from './opCodes.js';
import { prefixOpCodes } from './opCodes.js';

export class Cpu {
  constructor(memoryMap) {
    this.mem = memoryMap;
    this.cycles = 0;
    this.reg = {
      a:0, b:0, c:0, d:0, e:0, f: 0, h:0, l:0,   // 8-bit registers
      pc:0, sp:0,                                // 16-bit registers
    };
    this.instructions = this._mapInstructions(opCodes);
    this.prefixInstructions = this._mapInstructions(prefixOpCodes);
  }

  tick(instructions = this.instructions) {
    var opCode = this.mem.read8(this.reg.pc);
    if (opCode) {
      const instruction = instructions[opCode];
      if (instruction) {
        this.reg.pc++;
        instruction.execute();
        this.cycles += instruction.cycles;
        this.reg.pc += instruction.size;
        return true;
      } else {
        console.log("NOT FOUND");
        throw("Instruction not found: 0x" + ("0" + opCode.toString(16).toUpperCase()).substr(-2));
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

  // fz: function(i,as) { Z80._r.f=0; if(!(i&255)) Z80._r.f|=128; Z80._r.f|=as?0x40:0; },
  zeroFlag(register){
    this.reg.f = register === 0 ? 0x80 : 0x00;
  }

  static tokenize(label) {
    const name = label.substr(0, label.indexOf(' '));
    const args = label.substr(label.indexOf(' ')).split(',').map((t) => { return t.trim() });
    return { name, args }
  }

	_mapInstructions(opCodes) {
    return opCodes.reduce((buffer, opCode) => {
      let instruction = {};
      let tokens = Cpu.tokenize(opCode.label);
      let execute;
      switch (tokens.name) {
        case 'ld':
          if(tokens.args[1] === 'nn') {
            execute = this['ld_rr_d16'].bind(this, tokens.args[0]);
          } else if(tokens.args[0] === 'hld') {
            execute = this['ld_hld_a'].bind(this);
          }
          break;
        case 'xor':
          execute = this['xor_r'].bind(this, tokens.args[0]);
          break;
        case 'bit':
          execute = this['bit_b_r'].bind(this, tokens.args[0], tokens.args[1]);
          break;
        case 'jr':
          execute = this['jr_cc_n'].bind(this, tokens.args[0], tokens.args[1]);
          break;
        default:
          if(opCode.label === 'prefix') {
            execute = () => { this.tick(this.prefixInstructions) };
          } else {
            // console.log('uk', opCode);
          }
      }
      instruction[opCode.opCode] = { ...opCode, execute };
      return { ...buffer, ...instruction };
    }, {});
  }

  /** INSTRUCTION FUNCTIONS */

  /**
   *  Operand naming conventions for functions:
   * r = 8-bit register
   * lr = low 8-bit register
   * hr = high 8-bit register
   * rr = 16-bit register
   * d8 = 8-bit imm
   * d16 = 16-bit imm
   * d.. = [..]
   * cc = condition code (z, nz, c, nc)
   */

  /**
   * ld_rr_d16
   *
   * Put value d16 into rr.
   *
   * Use with:
   * rr = bc,de,hl,sp
   * nn = 16 bit immediate value
   *
   * @param {string} register      Registry name (bc,de,hl,sp).
   */
  ld_rr_d16(register) {
	  if (register === 'sp') {
      this.reg['sp'] = this.mem.read16(this.reg.pc);
    }
    else {
      this.reg[register[1]] = this.mem.read8(this.reg.pc);
      this.reg[register[0]] = this.mem.read8(this.reg.pc+1);
    }
  }

  /**
   * xor_r
   *
   * Logical exclusive OR r with register A, result in A.
   *
   * Use with:
   * r = a,b,c,d,e,h,l,(hl),#
   *
   * Flags affected:
   * Z - Set if result is zero. 
   * N - Reset.
   * H - Reset.
   * C - Reset.
   *
   * @param {string} register      Register name (a,b,c,d,e,h,l,(hl),#).
   */
  xor_r(register) {
    this.reg.a ^= this.reg[register]; this.zeroFlag(this.reg.a);
  }

  /**
   * ld_hld_a
   * Put A into memory address HL. Decrement H.
   */
  ld_hld_a() {
    let hl = this._loadWord("hl");
    this.mem.write(hl, this.reg.a); this._writeWord("hl", hl - 1);
  }

  /**
   * bit_b_r
   * 
   * Test bit b in register r.
   * 
   * Use with:
   * b = 0 - 7,
   * r = a,b,c,d,e,h,l,(hl)
   * 
   * Flags affected:
   * Z - Set if bit b of register r is 0.
   * N - Reset.
   * H - Set.
   * C - Not affected.
   * 
   * Set bit b in register r
   * 
   * @param {number} bit            Bit 0 - 7
   * @param {string} register       Register name (a,b,c,d,e,h,l,(hl)).
   */
  bit_b_r(bit, register) {
    this.reg.f = ((this.reg[register] & (2**bit)) ? 0x00 : 0x80) + 0x20;
  }

  /**
   * jr_cc_n
   * 
   * If following condition is true then add n to current address and jump to it.
   * 
   * Use with:
   * n = one byte signed immediate value
   * cc = nz, Jump if Z flag is reset.
   * cc = z,  Jump if Z flag is set.
   * cc = nc, Jump if C flag is reset.
   * cc = c, Jump if C flag is set.
   * 
   * @param {string} condition      Condition (nz, z, nc, c)
   */
  jr_cc_n(condition) {
    const value = this.mem.read8(this.reg.pc);
    switch(condition) {
      case 'nz':
        this.reg.pc = this.reg.f & 0x80 ? this.reg.pc : (this.reg.pc - 1 + value) % 0xFF;
        break;
    }
  }
}