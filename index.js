$("document").ready(() => {
  $( "body" ).append( "<h1>Test</h1>" );
  function reset() {
    window.memoryMap = new MemoryMap();
    memoryMap.loadRom(biosRom);
    window.cpu = new Cpu(memoryMap);
    printRegs();
  }
  function run() {
    while (window.cpu.reg.pc <= 0x009B) {
      step();
    }
    printRegs();
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
        case "ZRAM":
          printMemory(0xE000, 0xFFFF);
          break;
      }
    });
    $("#run").click(() => run());
    $("#step").click(() => { step(); printRegs(); });
    $("#reset").click(() => reset());
  }
  function printMemory(start, end) {    
    const chunk = memoryMap.memory.slice(start, end + 1);
    // const lines = new Uint8Array(end + 1 - start + 32);
    // lines.set([...Array(32).keys()])
    // lines.set(chunk, 32);
    const lines = "00 01 02 03 04 05 06 07&nbsp;&nbsp;08 09 0A 0B 0C 0D 0E 0F&nbsp;&nbsp;10 11 12 13 14 15 16 17&nbsp;&nbsp;18 19 1A 1B 1C 1D 1E 1F<br/><br/>"
    $("#code").html(lines + chunk.reduce((b,n,i) => {
      return b + " " + hex(n) +
        ((i + 1) % 8 == 0 ? "&nbsp;" : "") +
        ((i + 1) % 32 == 0 ? "<br />" : "")
      ;
    },""));
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