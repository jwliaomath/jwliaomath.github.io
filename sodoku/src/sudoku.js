export const ALL = 0x1ff;
export const bit = value => 1 << (value - 1);
export const values = mask => {
  const result = [];
  for (let n = 1; n <= 9; n++) if (mask & bit(n)) result.push(n);
  return result;
};
export const popcount = mask => {
  let count = 0;
  while (mask) { mask &= mask - 1; count++; }
  return count;
};

export const ROWS = Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => r * 9 + c));
export const COLS = Array.from({ length: 9 }, (_, c) => Array.from({ length: 9 }, (_, r) => r * 9 + c));
export const BOXES = Array.from({ length: 9 }, (_, b) => Array.from({ length: 9 }, (_, i) =>
  Math.floor(b / 3) * 27 + b % 3 * 3 + Math.floor(i / 3) * 9 + i % 3));
export const UNITS = [...ROWS, ...COLS, ...BOXES];
export const PEERS = Array.from({ length: 81 }, (_, i) => [...new Set([
  ...ROWS[Math.floor(i / 9)], ...COLS[i % 9], ...BOXES[Math.floor(i / 27) * 3 + Math.floor(i % 9 / 3)]
])].filter(j => j !== i));

export function candidateMask(board, index) {
  if (board[index]) return 0;
  let used = 0;
  for (const peer of PEERS[index]) if (board[peer]) used |= bit(board[peer]);
  return ALL & ~used;
}

export function conflicts(board, index) {
  const value = board[index];
  return value ? PEERS[index].filter(peer => board[peer] === value) : [];
}

export function countSolutions(source, limit = 2) {
  const board = source.slice();
  let count = 0;
  let first = null;
  function visit() {
    if (count >= limit) return;
    let index = -1;
    let best = 10;
    let options = 0;
    for (let i = 0; i < 81; i++) {
      if (board[i]) continue;
      const mask = candidateMask(board, i);
      const size = popcount(mask);
      if (!size) return;
      if (size < best) { best = size; index = i; options = mask; if (size === 1) break; }
    }
    if (index < 0) { count++; if (!first) first = board.slice(); return; }
    for (const value of values(options)) {
      board[index] = value;
      visit();
      board[index] = 0;
      if (count >= limit) return;
    }
  }
  if (source.some((value, i) => value && conflicts(source, i).length)) return { count: 0, solution: null };
  visit();
  return { count, solution: first };
}

