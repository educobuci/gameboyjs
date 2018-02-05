const i = (opCode, label, time, size = 0) => {
  return {opCode, label, time, size};
}
export const opCodes = [
  i(0x20, 'jr nz, n', 8, 1),
	i(0x21, 'ld hl, nn', 12, 2),
	i(0x31, 'ld sp, nn', 12, 2),
	i(0x32, 'ld hld, a', 8),
	i(0xA8, 'xor b', 4),
	i(0xAF, 'xor a', 4),
  i(0xCB, 'prefix', 4)
];

export const prefixOpCodes = [
  i(0x70, 'bit 7, h', 8)
];