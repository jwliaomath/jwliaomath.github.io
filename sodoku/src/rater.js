import { ALL, bit, candidateMask, COLS, PEERS, popcount, ROWS, BOXES, UNITS, values } from './sudoku.js';

const WEIGHTS = [0, 1, 2, 4, 7, 10, 15, 20];
const TECHNIQUES = [
  ['单格唯一候选', 1], ['行列宫唯一位置', 2], ['区块排除', 3],
  ['数对', 4], ['三数组', 5], ['X-Wing', 6], ['Swordfish / XY-Wing', 7]
];

function combinations(items, size, visit, start = 0, chosen = []) {
  if (chosen.length === size) return visit(chosen);
  for (let i = start; i <= items.length - (size - chosen.length); i++) {
    if (combinations(items, size, visit, i + 1, [...chosen, items[i]])) return true;
  }
  return false;
}

function findNakedSingle(board, masks, preferredIndex = -1) {
  if (preferredIndex >= 0 && !board[preferredIndex] && popcount(masks[preferredIndex]) === 1) {
    return { place: [preferredIndex, values(masks[preferredIndex])[0]] };
  }
  for (let i = 0; i < 81; i++) if (!board[i] && popcount(masks[i]) === 1) return { place: [i, values(masks[i])[0]] };
  return null;
}

function findHiddenSingle(board, masks, preferredIndex = -1) {
  if (preferredIndex >= 0 && !board[preferredIndex]) {
    for (const unit of UNITS.filter(cells => cells.includes(preferredIndex))) {
      for (let value = 1; value <= 9; value++) {
        if (unit.some(i => board[i] === value)) continue;
        const spots = unit.filter(i => !board[i] && masks[i] & bit(value));
        if (spots.length === 1 && spots[0] === preferredIndex) return { place: [preferredIndex, value], unit };
      }
    }
  }
  for (const unit of UNITS) for (let value = 1; value <= 9; value++) {
    if (unit.some(i => board[i] === value)) continue;
    const spots = unit.filter(i => !board[i] && masks[i] & bit(value));
    if (spots.length === 1) return { place: [spots[0], value], unit };
  }
  return null;
}

function findLocked(board, masks) {
  for (let b = 0; b < 9; b++) for (let value = 1; value <= 9; value++) {
    const spots = BOXES[b].filter(i => !board[i] && masks[i] & bit(value));
    if (spots.length < 2) continue;
    for (const units of [ROWS, COLS]) {
      const group = units.find(unit => spots.every(i => unit.includes(i)));
      if (!group) continue;
      const removals = group.filter(i => !BOXES[b].includes(i) && !board[i] && masks[i] & bit(value)).map(i => [i, bit(value)]);
      if (removals.length) return { remove: removals };
    }
  }
  for (const unit of [...ROWS, ...COLS]) for (let value = 1; value <= 9; value++) {
    const spots = unit.filter(i => !board[i] && masks[i] & bit(value));
    if (spots.length < 2) continue;
    const box = BOXES.find(cells => spots.every(i => cells.includes(i)));
    if (!box) continue;
    const removals = box.filter(i => !unit.includes(i) && !board[i] && masks[i] & bit(value)).map(i => [i, bit(value)]);
    if (removals.length) return { remove: removals };
  }
  return null;
}

function findNakedSubset(board, masks, size) {
  for (const unit of UNITS) {
    const eligible = unit.filter(i => !board[i] && popcount(masks[i]) >= 2 && popcount(masks[i]) <= size);
    let found = null;
    combinations(eligible, size, cells => {
      const union = cells.reduce((mask, i) => mask | masks[i], 0);
      if (popcount(union) !== size) return false;
      const removals = unit.filter(i => !board[i] && !cells.includes(i) && masks[i] & union).map(i => [i, masks[i] & union]);
      if (!removals.length) return false;
      found = { remove: removals, name: size === 2 ? '显性数对' : '显性三数组' };
      return true;
    });
    if (found) return found;
  }
  return null;
}

function findHiddenSubset(board, masks, size) {
  for (const unit of UNITS) {
    const absent = values(ALL).filter(value => !unit.some(i => board[i] === value));
    let found = null;
    combinations(absent, size, digits => {
      const wanted = digits.reduce((mask, value) => mask | bit(value), 0);
      if (digits.some(value => !unit.some(i => !board[i] && masks[i] & bit(value)))) return false;
      const cells = unit.filter(i => !board[i] && masks[i] & wanted);
      if (cells.length !== size) return false;
      const removals = cells.filter(i => masks[i] & ~wanted).map(i => [i, masks[i] & ~wanted]);
      if (!removals.length) return false;
      found = { remove: removals, name: size === 2 ? '隐性数对' : '隐性三数组' };
      return true;
    });
    if (found) return found;
  }
  return null;
}

function findFish(board, masks, size) {
  for (let value = 1; value <= 9; value++) for (const byRows of [true, false]) {
    const index = (base, cover) => byRows ? base * 9 + cover : cover * 9 + base;
    const baseUnits = [];
    for (let base = 0; base < 9; base++) {
      const covers = Array.from({ length: 9 }, (_, cover) => cover).filter(cover => {
        const i = index(base, cover);
        return !board[i] && Boolean(masks[i] & bit(value));
      });
      if (covers.length >= 2 && covers.length <= size) baseUnits.push([base, covers]);
    }
    let found = null;
    combinations(baseUnits, size, selected => {
      const covers = [...new Set(selected.flatMap(item => item[1]))];
      if (covers.length !== size) return false;
      const bases = new Set(selected.map(item => item[0]));
      const removals = [];
      for (const cover of covers) for (let base = 0; base < 9; base++) {
        const i = index(base, cover);
        if (!bases.has(base) && !board[i] && masks[i] & bit(value)) removals.push([i, bit(value)]);
      }
      if (!removals.length) return false;
      found = { remove: removals, name: size === 2 ? 'X-Wing' : 'Swordfish' };
      return true;
    });
    if (found) return found;
  }
  return null;
}

function findXYWing(board, masks) {
  for (let pivot = 0; pivot < 81; pivot++) {
    if (board[pivot] || popcount(masks[pivot]) !== 2) continue;
    const wings = PEERS[pivot].filter(i => !board[i] && popcount(masks[i]) === 2 && popcount(masks[i] & masks[pivot]) === 1);
    for (let a = 0; a < wings.length; a++) for (let b = a + 1; b < wings.length; b++) {
      const first = wings[a], second = wings[b];
      const sharedPivotA = masks[first] & masks[pivot];
      const sharedPivotB = masks[second] & masks[pivot];
      const otherA = masks[first] & ~masks[pivot];
      const otherB = masks[second] & ~masks[pivot];
      if (sharedPivotA === sharedPivotB || otherA !== otherB || popcount(otherA) !== 1) continue;
      const secondPeers = new Set(PEERS[second]);
      const removals = PEERS[first].filter(i => i !== pivot && i !== second && secondPeers.has(i) && !board[i] && masks[i] & otherA).map(i => [i, otherA]);
      if (removals.length) return { remove: removals, name: 'XY-Wing' };
    }
  }
  return null;
}

const DETECTORS = [
  findNakedSingle,
  findHiddenSingle,
  findLocked,
  (board, masks) => findNakedSubset(board, masks, 2) || findHiddenSubset(board, masks, 2),
  (board, masks) => findNakedSubset(board, masks, 3) || findHiddenSubset(board, masks, 3),
  (board, masks) => findFish(board, masks, 2),
  (board, masks) => findFish(board, masks, 3) || findXYWing(board, masks)
];

export function nextLogicalPlacement(source, preferredIndex = -1) {
  const board = source.slice();
  const masks = board.map((value, i) => value ? 0 : candidateMask(board, i));
  const preparations = [];
  for (let turn = 0; turn < 1000; turn++) {
    if (board.every(Boolean) || masks.some((mask, i) => !board[i] && !mask)) return null;
    let action = null, technique = 0;
    for (let i = 0; i < DETECTORS.length; i++) {
      action = DETECTORS[i](board, masks, preferredIndex);
      if (action) { technique = i + 1; break; }
    }
    if (!action) return null;
    if (action.place) {
      const [index, value] = action.place;
      return { index, value, technique: action.name || TECHNIQUES[technique - 1][0], level: technique, preparations: [...new Set(preparations)], unit: action.unit || null };
    }
    preparations.push(action.name || TECHNIQUES[technique - 1][0]);
    for (const [index, removed] of action.remove) masks[index] &= ~removed;
  }
  return null;
}

function searchWork(sourceBoard, sourceMasks, cap = 5000) {
  let nodes = 0, maxDepth = 0, capped = false;
  function visit(board, masks, depth) {
    if (nodes >= cap) { capped = true; return; }
    nodes++;
    maxDepth = Math.max(maxDepth, depth);
    while (true) {
      let single = -1;
      for (let i = 0; i < 81; i++) {
        if (!board[i] && !masks[i]) return;
        if (!board[i] && popcount(masks[i]) === 1) { single = i; break; }
      }
      if (single < 0) break;
      const value = values(masks[single])[0];
      board[single] = value;
      masks[single] = 0;
      for (const peer of PEERS[single]) if (!board[peer]) masks[peer] &= ~bit(value);
    }
    let selected = -1, least = 10;
    for (let i = 0; i < 81; i++) if (!board[i] && popcount(masks[i]) < least) {
      selected = i; least = popcount(masks[i]);
    }
    if (selected < 0) return;
    for (const value of values(masks[selected])) {
      const nextBoard = board.slice(), nextMasks = masks.slice();
      nextBoard[selected] = value;
      nextMasks[selected] = 0;
      for (const peer of PEERS[selected]) if (!nextBoard[peer]) nextMasks[peer] &= ~bit(value);
      visit(nextBoard, nextMasks, depth + 1);
      if (capped) return;
    }
  }
  visit(sourceBoard.slice(), sourceMasks.slice(), 0);
  return { nodes, maxDepth, capped };
}

export function ratePuzzle(source, knownSolution = null) {
  const board = source.slice();
  const masks = board.map((value, i) => value ? 0 : candidateMask(board, i));
  let level = 0, score = 0;
  const steps = [];
  for (let turn = 0; turn < 1000; turn++) {
    if (board.every(Boolean)) return { level, score: Math.round(score), steps, solved: true, search: { nodes: 0, maxDepth: 0, capped: false } };
    if (masks.some((mask, i) => !board[i] && !mask)) throw new Error('Logical solver reached a contradiction');
    let action = null, technique = 0;
    for (let i = 0; i < DETECTORS.length; i++) {
      action = DETECTORS[i](board, masks);
      if (action) { technique = i + 1; break; }
    }
    if (!action) break;
    level = Math.max(level, technique);
    score += WEIGHTS[technique] * (1 + 0.15 * ((action.remove?.length || 1) - 1));
    if (action.place) {
      const [index, value] = action.place;
      if (knownSolution && knownSolution[index] !== value) throw new Error('A logical placement disagrees with the solution');
      board[index] = value;
      masks[index] = 0;
      for (const peer of PEERS[index]) if (!board[peer]) masks[peer] &= ~bit(value);
    } else {
      for (const [index, removed] of action.remove) {
        if (knownSolution && removed & bit(knownSolution[index])) throw new Error('A logical elimination removes the solution');
        masks[index] &= ~removed;
      }
    }
    steps.push({ technique: action.name || TECHNIQUES[technique - 1][0], level: technique, placements: action.place ? 1 : 0, eliminations: action.remove?.length || 0 });
  }
  const search = searchWork(board, masks);
  return { level, score: Math.round(score), steps, solved: false, search };
}

export function classifyRating(rating) {
  if (rating.solved) {
    if (rating.level <= 1) return 'easy';
    if (rating.level <= 3) return 'medium';
    if (rating.level <= 5) return 'hard';
    return 'expert';
  }
  return rating.search.capped || rating.search.nodes >= 80 ? 'master' : 'expert';
}
