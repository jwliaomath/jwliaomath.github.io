import { PUZZLE_BANK } from './puzzle-bank.js';
import { generatePuzzle } from './puzzle.js';

const tiers = ['easy', 'medium', 'hard', 'expert', 'master'];
const pool = new Map(tiers.map(tier => [tier, []]));
const warming = new Set();
const queue = [];
let worker = null;
let active = null;

function unpack(tier, entry) {
  const [id, solution, level, score, nodes] = entry;
  return {
    puzzle: [...id].map(Number), solution: [...solution].map(Number),
    difficulty: tier, id, clues: [...id].filter(n => n !== '0').length,
    rating: { level, score, solved: nodes === 0, search: { nodes } }
  };
}

function finish(error, game) {
  const job = active;
  active = null;
  if (error) job.reject(error);
  else job.resolve(game);
  pump();
}

function pump() {
  if (active || !queue.length) return;
  active = queue.shift();
  if (typeof Worker === 'undefined' || globalThis.__SODUKO_MOBILE__) {
    setTimeout(() => {
      try { finish(null, generatePuzzle(active.difficulty, active.recent)); }
      catch (error) { finish(error); }
    }, 0);
    return;
  }
  if (!worker) {
    worker = new Worker(new URL('./puzzle-worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = event => {
      if (event.data.ok) finish(null, event.data.game);
      else finish(new Error(event.data.error));
    };
    worker.onerror = () => {
      worker.terminate();
      worker = null;
      finish(new Error('出题失败，请再试一次。'));
    };
  }
  worker.postMessage({ difficulty: active.difficulty, recent: active.recent });
}

function generate(difficulty, recent, priority = false) {
  return new Promise((resolve, reject) => {
    const job = { difficulty, recent, resolve, reject };
    if (priority) queue.unshift(job);
    else queue.push(job);
    pump();
  });
}

export async function nextPuzzle(difficulty, recent = []) {
  if (!pool.has(difficulty)) throw new Error('未知难度');
  const recentSet = new Set(recent);
  const ready = pool.get(difficulty);
  const readyIndex = ready.findIndex(game => !recentSet.has(game.id));
  if (readyIndex >= 0) {
    const game = ready.splice(readyIndex, 1)[0];
    warm(difficulty, [...recent, game.id]);
    return game;
  }
  const available = PUZZLE_BANK[difficulty].filter(entry => !recentSet.has(entry[0]));
  if (available.length) {
    const game = unpack(difficulty, available[Math.floor(Math.random() * available.length)]);
    warm(difficulty, [...recent, game.id]);
    return game;
  }
  const game = await generate(difficulty, recent, true);
  warm(difficulty, [...recent, game.id]);
  return game;
}

function warm(difficulty, recent = []) {
  if (warming.has(difficulty) || pool.get(difficulty).length) return;
  warming.add(difficulty);
  generate(difficulty, recent).then(game => {
    pool.get(difficulty).push(game);
  }).catch(() => {
    // The stored bank remains available; the next request can retry generation.
  }).finally(() => warming.delete(difficulty));
}

export function warmAll(recent = []) {
  if (globalThis.__SODUKO_MOBILE__) return;
  for (const tier of tiers) warm(tier, recent);
}
