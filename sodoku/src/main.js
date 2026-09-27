import { candidateMask, PEERS, values } from './sudoku.js';
import { nextPuzzle, warmAll } from './puzzle-service.js';
import { buildHintPlan, hintMessage } from './hint-plan.js';
import { boardIssues, entryFeedback, MODES } from './game-rules.js';
import { addRecord, cleanNickname, topRecords } from './records.js';

const $ = id => document.getElementById(id);
const labels = { easy: '简单', medium: '中等', hard: '困难', expert: '专家', master: '大师' };
const saveKey = 'soduko-game-v1';
const recentKey = 'soduko-recent-v1';
const recordsKey = 'soduko-records-v1';
const nicknameKey = 'soduko-nickname-v1';
const cells = [];
let game = null;
let busy = false;
let hintState = null;
let confirmResolver = null;

for (let i = 0; i < 81; i++) {
  const cell = document.createElement('button');
  cell.type = 'button';
  cell.className = 'cell';
  cell.setAttribute('role', 'gridcell');
  cell.addEventListener('click', () => selectCell(i));
  $('board').append(cell);
  cells.push(cell);
}
for (let value = 1; value <= 9; value++) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'digit-button';
  button.textContent = value;
  button.setAttribute('aria-label', `填入数字 ${value}`);
  button.addEventListener('click', () => enterNumber(value));
  $('number-pad').append(button);
}
const digitButtons = [...$('number-pad').children];

function announce(message) { $('status').textContent = message; }
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  const rest = seconds % 60;
  return `${hours ? `${String(hours).padStart(2, '0')}:` : ''}${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}
function save() {
  if (!game) return;
  try { localStorage.setItem(saveKey, JSON.stringify(game)); } catch { /* Private browsing may block storage. */ }
}
function restore() {
  try {
    const saved = JSON.parse(localStorage.getItem(saveKey));
    if (!saved || saved.version !== 1 || saved.board?.length !== 81 || saved.puzzle?.length !== 81 || saved.solution?.length !== 81 || saved.notes?.length !== 81) return null;
    saved.history = Array.isArray(saved.history) ? saved.history.slice(-100) : [];
    saved.selected = Number.isInteger(saved.selected) && saved.selected >= 0 && saved.selected < 81 ? saved.selected : null;
    if (!MODES[saved.mode]) { saved.mode = 'relaxed'; saved.mistakes = 0; }
    saved.hintsUsed = Math.max(0, Number(saved.hintsUsed) || 0);
    saved.recorded = Boolean(saved.recorded);
    return saved;
  } catch { return null; }
}
function recentIds() {
  try { const ids = JSON.parse(localStorage.getItem(recentKey)); return Array.isArray(ids) ? ids : []; } catch { return []; }
}
function remember(id) {
  try { localStorage.setItem(recentKey, JSON.stringify([...recentIds().filter(x => x !== id), id].slice(-500))); } catch { /* Optional history. */ }
}
function snapshot() {
  game.history.push({ board: game.board.slice(), notes: game.notes.map(list => list.slice()) });
  if (game.history.length > 100) game.history.shift();
}
function editable(index = game?.selected) { return game && index !== null && !game.puzzle[index] && !game.paused && !game.completed && !busy; }
function hasProgress() {
  return game && (game.board.some((n, i) => !game.puzzle[i] && n) || game.notes.some(list => list.length));
}

function askConfirm(message, acceptLabel) {
  if (confirmResolver) return Promise.resolve(false);
  $('confirm-message').textContent = message;
  $('confirm-accept').textContent = acceptLabel;
  $('confirm-dialog').showModal();
  return new Promise(resolve => { confirmResolver = resolve; });
}
function settleConfirm(accepted) {
  const resolve = confirmResolver;
  confirmResolver = null;
  if ($('confirm-dialog').open) $('confirm-dialog').close();
  resolve?.(accepted);
}

function loadRecords() {
  try { const records = JSON.parse(localStorage.getItem(recordsKey)); return Array.isArray(records) ? records : []; }
  catch { return []; }
}
function renderRecords() {
  const list = $('record-list');
  list.replaceChildren();
  const records = topRecords(loadRecords(), $('records-difficulty').value, $('records-mode').value);
  if (!records.length) {
    const item = document.createElement('li'); item.textContent = '还没有成绩，完成一局就能留下记录。'; list.append(item); return;
  }
  for (const record of records) {
    const item = document.createElement('li');
    const name = document.createElement('strong'); name.textContent = record.nickname;
    const result = document.createElement('span');
    result.textContent = `${formatTime(record.elapsed)}${record.mode === 'strict' ? ` · 错误 ${record.mistakes}` : ''}${record.hintsUsed ? ` · 提示 ${record.hintsUsed}` : ''}`;
    item.append(name, result); list.append(item);
  }
}
function showRecords() {
  if (game) { $('records-difficulty').value = game.difficulty; $('records-mode').value = game.mode; }
  renderRecords(); $('records-dialog').showModal();
}
function celebrate() {
  const container = $('fireworks'); container.replaceChildren();
  for (let i = 0; i < 36; i++) {
    const spark = document.createElement('span');
    const angle = (i % 12) * Math.PI / 6;
    const distance = 55 + (i % 3) * 16;
    spark.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
    spark.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
    spark.style.setProperty('--delay', `${Math.floor(i / 12) * .28}s`);
    spark.style.setProperty('--left', `${30 + Math.floor(i / 12) * 20}%`);
    spark.style.setProperty('--color', ['#2663df', '#ffbe38', '#ef6177', '#36b9a2'][i % 4]);
    container.append(spark);
  }
}
function showWin() {
  $('win-summary').textContent = `${labels[game.difficulty]} · ${MODES[game.mode]} · 用时 ${formatTime(game.elapsed)}${game.mode === 'strict' ? ` · 错误 ${game.mistakes}` : ''}`;
  try { $('nickname').value = localStorage.getItem(nicknameKey) || ''; } catch { $('nickname').value = ''; }
  celebrate();
  if (!$('win-dialog').open) $('win-dialog').showModal();
}
function finish() {
  game.completed = true;
  announce(`恭喜完成${labels[game.difficulty]}数独！用时 ${formatTime(game.elapsed)}。`);
  render(); save(); showWin();
}

function render() {
  if (!game) return;
  $('level-title').textContent = labels[game.difficulty];
  $('mode-badge').textContent = MODES[game.mode];
  $('mistake-stat').hidden = game.mode !== 'strict';
  $('mistakes').textContent = game.mistakes;
  $('timer').textContent = formatTime(game.elapsed);
  $('notes-button').classList.toggle('active', game.notesMode);
  $('notes-button').setAttribute('aria-pressed', String(game.notesMode));
  $('assist-switch').checked = game.assist;
  $('pause-button').textContent = game.paused ? '继续' : '暂停';
  $('undo-button').disabled = !game.history.length || game.paused || game.completed;
  $('erase-button').disabled = !editable();
  $('notes-button').disabled = game.paused || game.completed;
  $('hint-button').disabled = game.paused || game.completed;
  $('pause-button').disabled = game.completed;

  const chosen = game.selected;
  const chosenValue = chosen === null ? 0 : game.board[chosen];
  const peerSet = chosen === null ? null : new Set(PEERS[chosen]);
  const boardForCandidates = game.board.slice();
  if (chosen !== null) boardForCandidates[chosen] = 0;
  const allowed = chosen === null ? 0 : candidateMask(boardForCandidates, chosen);
  const { conflicting } = boardIssues(game.board);
  const hintRegion = hintState?.stage === 2 ? new Set(hintState.plan.region) : null;
  const hintTarget = hintState?.stage === 2 ? hintState.plan.index : -1;
  cells.forEach((cell, i) => {
    const value = game.board[i];
    cell.className = 'cell';
    if (i % 9 === 2 || i % 9 === 5) cell.classList.add('box-right');
    if (Math.floor(i / 9) === 2 || Math.floor(i / 9) === 5) cell.classList.add('box-bottom');
    if (game.puzzle[i]) cell.classList.add('fixed');
    if (peerSet?.has(i)) cell.classList.add('peer');
    if (chosenValue && value === chosenValue) cell.classList.add('same');
    if (i === chosen) cell.classList.add('selected');
    if (game.mode === 'strict' && value && !game.puzzle[i] && value !== game.solution[i]) cell.classList.add('wrong');
    if (conflicting.has(i)) cell.classList.add('conflict');
    if (hintRegion?.has(i)) cell.classList.add('hint-region');
    if (i === hintTarget) cell.classList.add('hint-target');
    cell.replaceChildren();
    if (value) cell.textContent = value;
    else if (game.notes[i].length) {
      const notes = document.createElement('span');
      notes.className = 'notes';
      for (let n = 1; n <= 9; n++) {
        const note = document.createElement('i');
        note.textContent = game.notes[i].includes(n) ? n : '';
        notes.append(note);
      }
      cell.append(notes);
    }
    const desc = value ? `${game.puzzle[i] ? '题目数字' : '已填'} ${value}` : game.notes[i].length ? `笔记 ${game.notes[i].join('、')}` : '空格';
    cell.setAttribute('aria-label', `第${Math.floor(i / 9) + 1}行第${i % 9 + 1}列，${desc}${conflicting.has(i) ? '，数字冲突' : ''}${i === hintTarget ? '，提示位置' : hintRegion?.has(i) ? '，提示相关区域' : ''}`);
    cell.setAttribute('aria-selected', String(i === chosen));
  });

  digitButtons.forEach((button, i) => {
    const possible = Boolean(allowed & (1 << i));
    const canEnter = editable() && (!game.notesMode || !game.board[chosen]);
    const excluded = game.assist && canEnter && !possible;
    button.classList.toggle('excluded', excluded);
    button.disabled = !canEnter || excluded;
    button.title = excluded ? '同行、同列或九宫格已有此数字' : '';
  });
  if (chosen === null) {
    $('candidate-label').textContent = '选择一个空格';
    $('candidate-summary').textContent = '也可以使用键盘上的 1–9。';
  } else if (game.puzzle[chosen]) {
    $('candidate-label').textContent = '题目数字';
    $('candidate-summary').textContent = '这个数字不能修改。';
  } else if (game.assist) {
    const candidates = values(allowed);
    $('candidate-label').textContent = '已开启辅助';
    $('candidate-summary').textContent = candidates.length ? `当前可填：${candidates.join('、')}` : '当前格没有可填数字，请检查已填内容。';
  } else {
    $('candidate-label').textContent = game.notesMode ? '笔记模式' : '选择数字';
    $('candidate-summary').textContent = game.notesMode ? '点击数字，可添加或删除笔记。' : '也可以使用键盘上的 1–9。';
  }
  $('board-cover').hidden = !game.paused && !game.completed && !busy;
  $('cover-title').textContent = busy ? '正在准备题目…' : game.completed ? '完成！' : '已暂停';
  $('resume-button').hidden = busy || game.completed;
  $('resume-button').textContent = '继续游戏';
}

function selectCell(index) {
  if (!game || game.paused || game.completed || busy) return;
  game.selected = index;
  render(); save();
}
function enterNumber(value) {
  if (!editable()) return;
  const index = game.selected;
  const boardForCandidates = game.board.slice();
  boardForCandidates[index] = 0;
  if (game.assist && !(candidateMask(boardForCandidates, index) & (1 << (value - 1)))) return;
  if (game.notesMode) {
    if (game.board[index]) return;
    snapshot();
    hintState = null;
    const notes = game.notes[index];
    game.notes[index] = notes.includes(value) ? notes.filter(n => n !== value) : [...notes, value].sort();
    announce(`笔记 ${value} 已${notes.includes(value) ? '删除' : '添加'}。`);
  } else {
    if (game.board[index] === value) return;
    snapshot();
    hintState = null;
    game.board[index] = value;
    game.notes[index] = [];
    const feedback = entryFeedback(game.board, game.solution, index, game.mode);
    if (feedback.countMistake) game.mistakes++;
    if (value === game.solution[index]) {
      for (const peer of PEERS[index]) game.notes[peer] = game.notes[peer].filter(n => n !== value);
    }
    if (feedback.conflicts.length) announce('当前棋盘有重复数字，可能有步骤填错了；请检查标红位置。');
    else if (feedback.countMistake) announce('这个数字不正确，错误次数加一。');
    else announce('已填入数字。');
    if (game.board.every((n, i) => n === game.solution[i])) {
      finish(); return;
    }
  }
  render(); save();
}
function erase() {
  if (!editable()) return;
  const index = game.selected;
  if (!game.board[index] && !game.notes[index].length) return;
  snapshot(); hintState = null; game.board[index] = 0; game.notes[index] = [];
  announce('已擦除。'); render(); save();
}
function undo() {
  if (!game || !game.history.length || game.paused || game.completed) return;
  hintState = null; Object.assign(game, game.history.pop());
  announce('已撤销上一步。'); render(); save();
}
function hint() {
  if (!game || game.paused || game.completed) return;
  if (!hintState) {
    const plan = buildHintPlan(game.board, game.solution, game.selected);
    if (!plan) return;
    hintState = { plan, stage: 1 };
    announce(hintMessage(plan, 1)); render(); return;
  }
  if (hintState.stage === 1) {
    hintState.stage = 2;
    game.selected = null;
    announce(hintMessage(hintState.plan, 2)); render(); return;
  }
  const plan = hintState.plan;
  const index = plan.index;
  snapshot();
  hintState = null;
  const value = plan.value;
  game.hintsUsed++;
  game.board[index] = value; game.notes[index] = []; game.selected = index;
  for (const peer of PEERS[index]) game.notes[peer] = game.notes[peer].filter(n => n !== value);
  if (game.board.every((n, i) => n === game.solution[i])) { finish(); return; }
  announce(hintMessage(plan, 3));
  render(); save();
}
function togglePause() {
  if (!game || game.completed || busy) return;
  hintState = null;
  game.paused = !game.paused;
  announce(game.paused ? '游戏已暂停。' : '继续游戏。'); render(); save();
}
async function restart() {
  if (!game || busy) return;
  if (hasProgress() && !await askConfirm('重新开始会清除本局已填的数字和笔记，确定吗？', '重新开始')) return;
  hintState = null;
  game.board = game.puzzle.slice(); game.notes = Array.from({ length: 81 }, () => []);
  game.history = []; game.mistakes = 0; game.hintsUsed = 0; game.elapsed = 0; game.paused = false; game.completed = false; game.recorded = false;
  game.selected = game.board.findIndex(n => !n);
  announce('已重新开始本局。'); render(); save();
}
function begin(gameData, mode = 'relaxed') {
  hintState = null;
  const assist = game?.assist || false;
  game = {
    version: 1, puzzle: gameData.puzzle, solution: gameData.solution,
    board: gameData.puzzle.slice(), notes: Array.from({ length: 81 }, () => []),
    difficulty: gameData.difficulty, id: gameData.id, elapsed: 0, mistakes: 0,
    selected: gameData.puzzle.findIndex(n => !n), notesMode: false, assist,
    mode, hintsUsed: 0, recorded: false, paused: false, completed: false, history: []
  };
  $('difficulty').value = game.difficulty;
  $('error-mode').value = game.mode;
  busy = false; remember(game.id);
  announce(`新的${labels[game.difficulty]}数独已准备好。`); render(); save();
}
async function newGame(difficulty = $('difficulty').value) {
  if (busy) return;
  const mode = $('error-mode').value;
  if (game && !game.completed && hasProgress() && !await askConfirm('开始新游戏会覆盖当前进度，确定吗？', '开始新游戏')) {
    $('difficulty').value = game.difficulty; $('error-mode').value = game.mode; return;
  }
  busy = true;
  $('new-button').disabled = true;
  announce('正在准备新题目…');
  if (game) render();
  try { begin(await nextPuzzle(difficulty, recentIds()), mode); }
  catch (error) { busy = false; announce(error.message || '出题失败，请再试一次。'); if (game) render(); }
  finally { $('new-button').disabled = false; }
}

function registerWebMcp() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();
  window.addEventListener('pagehide', () => lifecycle.abort(), { once: true });
  const register = tool => {
    try { Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(console.warn); }
    catch (error) { console.warn(error); }
  };
  register({
    name: 'read_sudoku_game', title: 'Read Sudoku game',
    description: 'Read the visible Sudoku board, current selection, and game status without changing the game.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute() {
      if (!game) throw new Error('No game is ready');
      return { board: game.board, givens: game.puzzle, difficulty: game.difficulty, selected: game.selected, mistakes: game.mistakes, elapsed: game.elapsed, completed: game.completed, paused: game.paused, assist: game.assist };
    }
  });
  register({
    name: 'play_sudoku_digit', title: 'Play a Sudoku digit',
    description: 'Select a row and column, then enter one digit using the same rules as the on-screen number pad.',
    inputSchema: {
      type: 'object', properties: { row: { type: 'integer', minimum: 1, maximum: 9 }, column: { type: 'integer', minimum: 1, maximum: 9 }, digit: { type: 'integer', minimum: 1, maximum: 9 } },
      required: ['row', 'column', 'digit'], additionalProperties: false
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      const { row, column, digit } = input || {};
      if (![row, column, digit].every(n => Number.isInteger(n) && n >= 1 && n <= 9)) throw new Error('row, column and digit must be integers from 1 to 9');
      const index = (row - 1) * 9 + column - 1;
      if (!editable(index)) throw new Error('This cell cannot be edited now');
      if (game.notesMode) throw new Error('Turn off note mode before entering a digit');
      const board = game.board.slice(); board[index] = 0;
      if (game.assist && !(candidateMask(board, index) & (1 << (digit - 1)))) throw new Error('Candidate assist excludes this digit');
      selectCell(index); enterNumber(digit);
      return { row, column, digit, entered: game.board[index] === digit, mistakes: game.mistakes, completed: game.completed };
    }
  });
}

$('new-button').addEventListener('click', () => newGame());
$('undo-button').addEventListener('click', undo);
$('erase-button').addEventListener('click', erase);
$('hint-button').addEventListener('click', hint);
$('notes-button').addEventListener('click', () => { if (!game || game.paused || game.completed) return; game.notesMode = !game.notesMode; render(); save(); });
$('assist-switch').addEventListener('change', event => { if (!game) return; game.assist = event.target.checked; render(); save(); });
$('pause-button').addEventListener('click', togglePause);
$('resume-button').addEventListener('click', togglePause);
$('restart-button').addEventListener('click', restart);
$('confirm-cancel').addEventListener('click', () => settleConfirm(false));
$('confirm-accept').addEventListener('click', () => settleConfirm(true));
$('confirm-dialog').addEventListener('cancel', event => { event.preventDefault(); settleConfirm(false); });
$('records-button').addEventListener('click', showRecords);
$('close-records').addEventListener('click', () => $('records-dialog').close());
for (const id of ['records-difficulty', 'records-mode']) $(id).addEventListener('change', renderRecords);
$('record-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!game?.completed || game.recorded) return;
  const nickname = cleanNickname($('nickname').value);
  const records = addRecord(loadRecords(), { nickname, difficulty: game.difficulty, mode: game.mode, elapsed: game.elapsed, mistakes: game.mistakes, hintsUsed: game.hintsUsed, puzzleId: game.id });
  try { localStorage.setItem(recordsKey, JSON.stringify(records)); localStorage.setItem(nicknameKey, nickname); }
  catch { announce('本机存储不可用，成绩未能保存。'); return; }
  game.recorded = true; save(); $('win-dialog').close(); showRecords();
});
$('skip-record').addEventListener('click', () => { game.recorded = true; save(); $('win-dialog').close(); });
$('rules-button').addEventListener('click', () => $('rules-dialog').showModal());
$('close-rules').addEventListener('click', () => $('rules-dialog').close());
$('rules-dialog').addEventListener('click', event => { if (event.target === $('rules-dialog')) $('rules-dialog').close(); });
document.addEventListener('keydown', event => {
  if (document.querySelector('dialog[open]')) return;
  if (event.ctrlKey && event.key.toLowerCase() === 'z') { event.preventDefault(); undo(); return; }
  if (!game || game.paused || game.completed || busy || event.target.matches('select,input')) return;
  if (/^[1-9]$/.test(event.key)) { event.preventDefault(); enterNumber(Number(event.key)); }
  else if (event.key === 'Backspace' || event.key === 'Delete') { event.preventDefault(); erase(); }
  else if (event.key.toLowerCase() === 'n') { game.notesMode = !game.notesMode; render(); save(); }
  else if (event.key.startsWith('Arrow')) {
    event.preventDefault();
    const current = game.selected ?? 0;
    const row = Math.floor(current / 9), col = current % 9;
    const next = { ArrowUp: [Math.max(0, row - 1), col], ArrowDown: [Math.min(8, row + 1), col], ArrowLeft: [row, Math.max(0, col - 1)], ArrowRight: [row, Math.min(8, col + 1)] }[event.key];
    if (next) { selectCell(next[0] * 9 + next[1]); cells[game.selected].focus(); }
  }
});
setInterval(() => {
  if (!game || game.paused || game.completed || busy) return;
  game.elapsed++;
  $('timer').textContent = formatTime(game.elapsed);
  save();
}, 1000);

game = restore();
if (game) {
  $('difficulty').value = game.difficulty; $('error-mode').value = game.mode;
  announce('已恢复上次的游戏。'); render();
  if (game.completed && !game.recorded) showWin();
}
else newGame('easy');
warmAll(recentIds());
registerWebMcp();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || (location.hostname === 'localhost' && new URLSearchParams(location.search).has('pwa-test')))) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(console.warn));
}
