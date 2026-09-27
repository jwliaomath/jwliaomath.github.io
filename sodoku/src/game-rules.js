import { candidateMask, conflicts } from './sudoku.js';

export const MODES = { relaxed: '宽松模式', strict: '即时判错' };

export function boardIssues(board) {
  const conflicting = new Set();
  const blocked = new Set();
  for (let index = 0; index < 81; index++) {
    if (board[index]) {
      const peers = conflicts(board, index);
      if (peers.length) {
        conflicting.add(index);
        for (const peer of peers) conflicting.add(peer);
      }
    } else if (!candidateMask(board, index)) {
      blocked.add(index);
    }
  }
  return { conflicting, blocked };
}

export function entryFeedback(board, solution, index, mode) {
  const { conflicting, blocked } = boardIssues(board);
  return {
    incorrect: board[index] !== solution[index],
    countMistake: mode === 'strict' && board[index] !== solution[index],
    conflicts: [...conflicting],
    blocked: [...blocked]
  };
}
