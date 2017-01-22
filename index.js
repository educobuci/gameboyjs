$("document").ready(() => {
  function reset() {
    window.memoryMap = new MemoryMap();
    memoryMap.loadRom(biosRom);
    window.cpu = new Cpu(memoryMap);
    printRegs();
  }
  function run() {
    while (true) {
      step();
    }
  }
  function step() {
    try {
      window.cpu.tick();
    } catch (e) {
      printRegs();
      throw(e);
    }
  }
  function bindEvents(){
    $("#memtabs a").click((e) => {
      const $tab = $(e.target);
      switch ($tab.html()) {
        case "ROM":
          printMemory(0x0000, 0x3FFF);
          break;
        case "VRAM":
          printMemory(0x8000, 0x9FFF);
          break;
        case "RAM":
          printMemory(0xC000, 0xDFFF);
          break;
      }
    });
    $("#run").click(() => run());
    $("#step").click(() => { step(); printRegs(); });
    $("#reset").click(() => reset());
  }
  function printMemory(start, end) {
    const chunk = memoryMap.memory.slice(start, end + 1);
    $("#code").html(chunk.reduce((b,i) => b + " " + hex(i), ""));
  }
  function printRegs() {
    const p = (reg) => {
      const value = window.cpu.reg[reg];
      const hexValue = hex(value, reg == "pc" | reg == "sp" ? 4 : 2, true);
      $("#reg_" + reg).html(hexValue);
      $("#reg_dec_" + reg).html(value);
    }
    for(reg in window.cpu.reg) {
      p(reg);
    }
    const opCode = window.memoryMap.read8(window.cpu.reg.pc);
    const nextCode = window.memoryMap.read8(window.cpu.reg.pc+1);
    $("#op_code").html(hex(opCode, 2, true));
    $("#op_code_dec").html(opCode);
    $("#next_op_code").html(hex(nextCode, 2, true));
    $("#next_op_code_dec").html(nextCode);
  }
  function hex(value, size = 2, prefix) {
    return (prefix ? "0x" : "") + ("00000000" + value.toString(16).toUpperCase()).substr(size * -1);
  }
  reset();
  bindEvents();
});