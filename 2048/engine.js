export const SIZE = 4;
export const GOAL = 2048;

export function emptyCells(board) {
  return board.flatMap((value, index) => (value === 0 ? [index] : []));
}

export function spawnTile(board, random = Math.random) {
  const next = [...board];
  const free = emptyCells(next);
  if (free.length === 0) return next;
  const choice = Math.min(free.length - 1, Math.floor(random() * free.length));
  next[free[choice]] = random() < 0.9 ? 2 : 4;
  return next;
}

export function newBoard(random = Math.random) {
  return spawnTile(spawnTile(Array(SIZE * SIZE).fill(0), random), random);
}

function lineIndices(direction, line) {
  return Array.from({ length: SIZE }, (_, step) => {
    if (direction === "left") return line * SIZE + step;
    if (direction === "right") return line * SIZE + (SIZE - 1 - step);
    if (direction === "up") return step * SIZE + line;
    return (SIZE - 1 - step) * SIZE + line;
  });
}

export function moveBoard(board, direction) {
  if (!["left", "right", "up", "down"].includes(direction)) {
    throw new Error(`Unknown direction: ${direction}`);
  }
  if (!Array.isArray(board) || board.length !== SIZE * SIZE) {
    throw new Error("The board must contain 16 cells.");
  }

  const next = [...board];
  let gained = 0;
  const mergedValues = [];

  for (let line = 0; line < SIZE; line += 1) {
    const indices = lineIndices(direction, line);
    const values = indices.map((index) => board[index]).filter((value) => value !== 0);
    const packed = [];
    for (let index = 0; index < values.length; index += 1) {
      if (values[index] === values[index + 1]) {
        const merged = values[index] * 2;
        packed.push(merged);
        gained += merged;
        mergedValues.push(merged);
        index += 1;
      } else {
        packed.push(values[index]);
      }
    }
    indices.forEach((cell, index) => {
      next[cell] = packed[index] || 0;
    });
  }

  return {
    board: next,
    gained,
    mergedValues,
    moved: next.some((value, index) => value !== board[index]),
  };
}

export function hasMoves(board) {
  if (board.includes(0)) return true;
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const value = board[row * SIZE + col];
      if (col < SIZE - 1 && value === board[row * SIZE + col + 1]) return true;
      if (row < SIZE - 1 && value === board[(row + 1) * SIZE + col]) return true;
    }
  }
  return false;
}

export function isValidBoard(board) {
  return (
    Array.isArray(board) &&
    board.length === SIZE * SIZE &&
    board.every((value) =>
      Number.isSafeInteger(value) && (value === 0 || (value >= 2 && Number.isInteger(Math.log2(value)))),
    )
  );
}
