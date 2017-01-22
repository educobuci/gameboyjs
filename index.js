$("document").ready(() => {
  function reset() {
    window.memoryMap = new MemoryMap();
    memoryMap.loadRom(biosRom);
    window.cpu = new Cpu(memoryMap);
    printRegs();
  }
  function run() {
    step();
    setTimeout(run, 1000 / 60);
  }
  function step() {
    window.cpu.tick();
    printRegs();
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
    $("#step").click(() => step());
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
  }
  function hex(value, size = 2, prefix) {
    return (prefix ? "0x" : "") + ("00000000" + value.toString(16).toUpperCase()).substr(size * -1);
  }
  reset();
  bindEvents();
});