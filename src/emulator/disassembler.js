import { opCodes, prefixOpCodes } from './opCodes.js';

const map = (codes) => codes.reduce((buffer, opCode) => {
  return { ...buffer, [opCode.opCode]: opCode };
}, {});

const instructions = map(opCodes);
const prefixInstructions = map(prefixOpCodes);

const disassembly = (mem) => {
  let disassembledRom = {};
  let pc = 0;
  while(true) {
    let set;
    const code = mem.read8(pc);
    if (code === 0xCB) {
      set = prefixInstructions;
      pc++;
    } else {
      set = instructions;
    }
    const instruction = set[code];
    if (!code || !instruction) break;
    disassembledRom[pc.toString(10)] = instruction;
    pc += set[code].size + 1;
  }
  return disassembledRom;
};

const parseLabel = (instruction, pc) => {
  let tokens = instruction.label.split(",").map((t) => { return t.trim() });
  let wordIndex = tokens.indexOf("nn");
  if (wordIndex > 0) {
    tokens[wordIndex] = "$" + this.mem.read16(pc + 1).toString(16).toUpperCase()
  }
  return tokens.join(", ");
};

export default disassembly