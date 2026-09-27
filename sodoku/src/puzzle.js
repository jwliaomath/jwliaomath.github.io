import { candidateMask, countSolutions, values } from './sudoku.js';
import { classifyRating, ratePuzzle } from './rater.js';

function shuffle(items, random = Math.random) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function generateSolution(random = Math.random) {
  const board = Array(81).fill(0);
  function fill() {
    let best = 10;
    let choices = [];
    for (let i = 0; i < 81; i++) {
      if (board[i]) continue;
      const options = values(candidateMask(board, i));
      if (!options.length) return false;
      if (options.length < best) { best = options.length; choices = [[i, options]]; }
      else if (options.length === best) choices.push([i, options]);
    }
    if (!choices.length) return true;
    const [index, options] = choices[Math.floor(random() * choices.length)];
    for (const value of shuffle(options, random)) {
      board[index] = value;
      if (fill()) return true;
    }
    board[index] = 0;
    return false;
  }
  fill();
  return board;
}

export const SETTINGS = {
  easy: { min: 39, max: 46 },
  medium: { min: 32, max: 39 },
  hard: { min: 27, max: 35 },
  expert: { min: 24, max: 32 },
  master: { min: 21, max: 29 }
};

export function generateCandidate(target, random = Math.random) {
  const solution = generateSolution(random);
  const puzzle = solution.slice();
  for (const index of shuffle(Array.from({ length: 81 }, (_, i) => i), random)) {
    if (puzzle.filter(Boolean).length <= target) break;
    const saved = puzzle[index];
    puzzle[index] = 0;
    if (countSolutions(puzzle).count !== 1) puzzle[index] = saved;
  }
  const rating = ratePuzzle(puzzle, solution);
  const clues = puzzle.filter(Boolean).length;
  return { puzzle, solution, rating, id: puzzle.join(''), clues, ratedDifficulty: classifyRating(rating) };
}

export function generatePuzzle(difficulty = 'easy', recent = [], random = Math.random, maxAttempts = 2000) {
  const setting = SETTINGS[difficulty];
  if (!setting) throw new Error(`未知难度：${difficulty}`);
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const target = setting.min + Math.floor(random() * (setting.max - setting.min + 1));
    const candidate = generateCandidate(target, random);
    if (candidate.clues <= setting.max && candidate.ratedDifficulty === difficulty && !recent.includes(candidate.id)) {
      const { puzzle, solution, rating, id, clues } = candidate;
      return { puzzle, solution, difficulty, rating: { level: rating.level, score: rating.score, solved: rating.solved, search: rating.search }, id, clues };
    }
  }
  throw new Error(`暂时无法生成${difficulty}题目，请重试`);
}
