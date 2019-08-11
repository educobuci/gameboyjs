const i = (opCode, label, cycles, size = 0) => {
  return { opCode, label, cycles, size };
};

export const opCodes = [
  i(0x01, 'ld bc, nn',  12, 2),
  i(0x0C, 'inc c',      4),
  i(0x0E, 'ld b, n',    8, 1),
  i(0x0E, 'ld c, n',    8, 1),
  i(0x11, 'ld de, nn',  12, 2),
  i(0x16, 'ld d, n',    8, 1),
  i(0x1E, 'ld e, n',    8, 1),
  i(0x20, 'jr nz, n',   8, 1),
  i(0x21, 'ld hl, nn',  12, 2),
  i(0x26, 'ld h, n',    8, 1),
  i(0x2E, 'ld l, n',    8, 1),
	i(0x31, 'ld sp, nn',  12, 2),
  i(0x32, 'ld (hld), a',8),
  i(0x3E, 'ld a, n',    8, 1),
  i(0x77, 'ld (hl), a', 8, 4),
	i(0xA8, 'xor b',      4),
	i(0xAF, 'xor a',      4),
  i(0xCB, 'prefix',     4),
  i(0xE2, 'ld (c), a',  8),
];

export const prefixOpCodes = [
  i(0x7C, 'bit 7, h', 8)
];