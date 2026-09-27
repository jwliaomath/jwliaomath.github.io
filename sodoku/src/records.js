const tiers = new Set(['easy', 'medium', 'hard', 'expert', 'master']);
const modes = new Set(['relaxed', 'strict']);

export function cleanNickname(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, 16) || '玩家';
}

export function addRecord(records, result) {
  if (!tiers.has(result.difficulty) || !modes.has(result.mode) || !Number.isInteger(result.elapsed) || result.elapsed < 0) {
    throw new Error('成绩数据无效');
  }
  const record = {
    nickname: cleanNickname(result.nickname),
    difficulty: result.difficulty,
    mode: result.mode,
    elapsed: result.elapsed,
    mistakes: result.mode === 'strict' ? Math.max(0, Number(result.mistakes) || 0) : null,
    hintsUsed: Math.max(0, Number(result.hintsUsed) || 0),
    finishedAt: result.finishedAt || new Date().toISOString(),
    puzzleId: result.puzzleId || ''
  };
  return [...(Array.isArray(records) ? records : []), record].slice(-300);
}

export function topRecords(records, difficulty, mode, limit = 10) {
  return (Array.isArray(records) ? records : [])
    .filter(record => record && record.difficulty === difficulty && record.mode === mode && Number.isInteger(record.elapsed))
    .sort((a, b) => a.elapsed - b.elapsed || (a.mistakes || 0) - (b.mistakes || 0) || String(a.finishedAt).localeCompare(String(b.finishedAt)))
    .slice(0, limit);
}
