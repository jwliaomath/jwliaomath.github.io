import { generatePuzzle } from './puzzle.js';

self.onmessage = event => {
  const { difficulty, recent } = event.data;
  try { self.postMessage({ ok: true, game: generatePuzzle(difficulty, recent) }); }
  catch (error) { self.postMessage({ ok: false, error: error.message }); }
};
