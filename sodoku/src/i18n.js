const storageKey = 'jwliaomath-games-language';
let current = 'zh';
try { current = localStorage.getItem(storageKey) === 'en' ? 'en' : 'zh'; } catch { /* Storage is optional. */ }

const messages = {
  zh: {
    difficulty_easy: '简单', difficulty_medium: '中等', difficulty_hard: '困难', difficulty_expert: '专家', difficulty_master: '大师',
    mode_relaxed: '宽松模式', mode_strict: '严格模式',
    fillDigit: ({ value }) => `填入数字 ${value}`, fillTentative: ({ value }) => `待定填入 ${value}`, fixedDigit: ({ value }) => `题目数字 ${value}`, enteredDigit: ({ value }) => `已填 ${value}`, tentativeDigit: ({ value }) => `待定数字 ${value}`,
    notes: ({ values }) => `笔记 ${values}`, emptyCell: '空格', cellDescription: ({ row, col, desc, conflict, target, region }) => `第${row}行第${col}列，${desc}${conflict ? '，数字冲突' : ''}${target ? '，提示位置' : region ? '，提示相关区域' : ''}`,
    digitExcluded: '同行、同列或九宫格已有此数字', selectEmpty: '选择一个空格', keyboard: '也可以使用键盘上的 1–9。',
    fixedCell: '题目数字', fixedCannotEdit: '这个数字不能修改。', assistOn: '已开启辅助', candidates: ({ values }) => `当前可填：${values}`, noCandidates: '当前格没有可填数字，请检查已填内容。',
    notesMode: '笔记模式', selectDigit: '选择数字', notesInstructions: '点击数字，可添加或删除笔记。', tentativeMode: '待定模式', tentativeInstructions: '点击数字会以琥珀色填入；选中琥珀色数字可点“确认”。', tentativeCell: '待定数字', confirmInstruction: '点击“确认”将这个数字转为蓝色。', assistTentativeOn: '待定 · 辅助已开启',
    preparing: '正在准备题目…', completed: '完成！', paused: '已暂停', resumeGame: '继续游戏', resume: '继续', pause: '暂停',
    noRecords: '还没有成绩，完成一局就能留下记录。', mistakes: ({ count }) => `错误 ${count}`, hints: ({ count }) => `提示 ${count}`,
    winSummary: ({ difficulty, mode, time, mistakes }) => `${difficulty} · ${mode} · 用时 ${time}${mistakes === null ? '' : ` · 错误 ${mistakes}`}`,
    finished: ({ difficulty, time }) => `恭喜完成${difficulty}数独！用时 ${time}。`,
    noteChanged: ({ value, added }) => `笔记 ${value} 已${added ? '添加' : '删除'}。`,
    allNotesFilled: ({ count }) => `已按当前棋盘重算 ${count} 个空格的候选笔记；可撤销。`, allNotesCurrent: '候选笔记已与当前棋盘一致。',
    conflicts: '当前棋盘有重复数字，可能有步骤填错了；请检查标红位置。', wrongDigit: '这个数字不正确，错误次数加一。', digitEntered: '已填入数字。',
    erased: '已擦除。', undone: '已撤销上一步。', gamePaused: '游戏已暂停。', gameResumed: '继续游戏。',
    tentativeOn: '待定已开启，新填入的数字将显示为琥珀色。', tentativeOff: '待定已关闭，新填入的数字将显示为蓝色。', tentativeEntered: '已填入待定数字。', confirmed: '已确认这个数字。',
    restartConfirm: '重新开始会清除本局已填的数字和笔记，确定吗？', restart: '重新开始', restarted: '已重新开始本局。',
    newConfirm: '开始新游戏会覆盖当前进度，确定吗？', newGame: '开始新游戏',
    newReady: ({ difficulty }) => `新的${difficulty}数独已准备好。`, preparingNew: '正在准备新题目…', puzzleFailed: '出题失败，请再试一次。',
    storageFailed: '本机存储不可用，成绩未能保存。', restored: '已恢复上次的游戏。', player: '玩家',
  },
  en: {
    difficulty_easy: 'Easy', difficulty_medium: 'Medium', difficulty_hard: 'Hard', difficulty_expert: 'Expert', difficulty_master: 'Master',
    mode_relaxed: 'Relaxed mode', mode_strict: 'Strict mode',
    fillDigit: ({ value }) => `Enter ${value}`, fillTentative: ({ value }) => `Enter ${value} tentatively`, fixedDigit: ({ value }) => `Given ${value}`, enteredDigit: ({ value }) => `Entered ${value}`, tentativeDigit: ({ value }) => `Tentative ${value}`,
    notes: ({ values }) => `Notes ${values}`, emptyCell: 'Empty cell', cellDescription: ({ row, col, desc, conflict, target, region }) => `Row ${row}, column ${col}: ${desc}${conflict ? ', conflict' : ''}${target ? ', hint target' : region ? ', hint area' : ''}`,
    digitExcluded: 'This number is already in the row, column, or box', selectEmpty: 'Select an empty cell', keyboard: 'You can also use keys 1–9.',
    fixedCell: 'Given number', fixedCannotEdit: 'This number cannot be changed.', assistOn: 'Candidate aid is on', candidates: ({ values }) => `Available: ${values}`, noCandidates: 'No number fits this cell. Check your entries.',
    notesMode: 'Notes mode', selectDigit: 'Choose a number', notesInstructions: 'Tap a number to add or remove a note.', tentativeMode: 'Tentative mode', tentativeInstructions: 'Numbers entered now appear amber. Select one and tap Confirm to make it blue.', tentativeCell: 'Tentative number', confirmInstruction: 'Tap Confirm to turn this number blue.', assistTentativeOn: 'Tentative · aid is on',
    preparing: 'Preparing a puzzle…', completed: 'Complete!', paused: 'Paused', resumeGame: 'Resume game', resume: 'Resume', pause: 'Pause',
    noRecords: 'No records yet. Finish a game to add one.', mistakes: ({ count }) => `Mistakes ${count}`, hints: ({ count }) => `Hints ${count}`,
    winSummary: ({ difficulty, mode, time, mistakes }) => `${difficulty} · ${mode} · Time ${time}${mistakes === null ? '' : ` · Mistakes ${mistakes}`}`,
    finished: ({ difficulty, time }) => `Congratulations! You completed ${difficulty} Sudoku in ${time}.`,
    noteChanged: ({ value, added }) => `Note ${value} ${added ? 'added' : 'removed'}.`,
    allNotesFilled: ({ count }) => `Candidate notes updated for ${count} empty cells from the current board. You can undo this.`, allNotesCurrent: 'Candidate notes already match the current board.',
    conflicts: 'A number repeats in a row, column, or box. Check the highlighted cells.', wrongDigit: 'That number is incorrect. One mistake added.', digitEntered: 'Number entered.',
    erased: 'Cell cleared.', undone: 'Last move undone.', gamePaused: 'Game paused.', gameResumed: 'Game resumed.',
    tentativeOn: 'Tentative mode is on. New entries will appear amber.', tentativeOff: 'Tentative mode is off. New entries will appear blue.', tentativeEntered: 'Tentative number entered.', confirmed: 'This number is confirmed.',
    restartConfirm: 'Restarting clears all numbers and notes entered in this game. Continue?', restart: 'Restart', restarted: 'Game restarted.',
    newConfirm: 'Starting a new game will replace your current progress. Continue?', newGame: 'Start new game',
    newReady: ({ difficulty }) => `A new ${difficulty} Sudoku is ready.`, preparingNew: 'Preparing a new puzzle…', puzzleFailed: 'Could not prepare a puzzle. Please try again.',
    storageFailed: 'Local storage is unavailable. Your record was not saved.', restored: 'Your last game was restored.', player: 'Player',
  }
};

export const language = () => current;
export function setLanguage(next) {
  current = next === 'en' ? 'en' : 'zh';
  try { localStorage.setItem(storageKey, current); } catch { /* Keep the current page translated. */ }
}
export function t(key, params = {}) {
  const message = messages[current][key] ?? messages.zh[key] ?? key;
  return typeof message === 'function' ? message(params) : message;
}
export const difficultyLabel = code => t(`difficulty_${code}`);
export const modeLabel = code => t(`mode_${code}`);

const staticEnglish = {
  '.brand > span:nth-child(2)': 'Sudoku', '.brand-caption': 'Classic game', '#records-button': 'Records', '#rules-button': 'Rules & tips',
  '.game-heading .eyebrow': 'Current level', '#mistake-stat span': 'Mistakes', '.stats > div:last-child > span': 'Time',
  '.setup-card h2': 'New game', '.new-game-row label': 'Choose difficulty', '#new-button': 'New game', '.mode-row > span': 'Mistake rules for new game',
  '.quiet-note': 'Every puzzle has a verified unique solution.', '.number-card h2': 'Enter a number', '.tools-card h2': 'Tools',
  '.desktop-auto-notes small': 'Fill candidates in every empty cell from the current board. Undo is available.',
  '#all-notes-desktop': 'Fill candidate notes', '#all-notes-mobile': 'Fill candidate notes',
  '#undo-button .tool-label': 'Undo', '#erase-button .tool-label': 'Erase', '#notes-button .tool-label': 'Notes', '#tentative-button .tool-label': 'Maybe', '#confirm-button .tool-label': 'Confirm', '#hint-button .tool-label': 'Hint',
  '.assist-toggle strong': 'Candidate number aid', '.assist-toggle small': 'Exclude numbers already in the selected cell’s row, column, or box',
  '#restart-button': 'Restart', '#rules-dialog .dialog-head h2': 'How to play & tips',
  '#rules-dialog > p:nth-of-type(1)': 'Fill each row, column, and 3×3 box with the numbers 1–9, without repeats.',
  '#rules-dialog > p:nth-of-type(2)': 'Select an empty cell, then a number. Relaxed mode only marks repeated numbers in a row, column, or box. It does not reveal mistakes from the hidden answer or from other cells’ candidates. Strict mode marks incorrect entries immediately and counts them. Candidate number aid shows which numbers currently fit the selected cell. Fill candidate notes recalculates notes for every empty cell from the current board; you can undo it.',
  '#rules-dialog > p:nth-of-type(3)': 'On a computer, use the arrow keys to move, 1–9 to enter a number, Delete to erase, N for notes, and Ctrl+Z to undo.',
  '#rules-dialog > p:nth-of-type(4)': 'Hint has three steps: see the solving technique, highlight the relevant area, then reveal the number.',
  '#rules-dialog > p:nth-of-type(5)': 'Turn on Maybe to enter amber tentative numbers. They still count toward the rules and conflict checks. Select an amber number and tap Confirm to turn it blue; you can undo that change. Maybe and Notes cannot be on together.',
  '.guide-title': 'Solving techniques · easy to advanced',
  '.guide-intro': 'Candidates are the numbers still possible after excluding those in the same row, column, and box. Advanced techniques remove more candidates. Use Notes to track them.',
  '#confirm-title': 'Confirm action', '#confirm-cancel': 'Cancel', '#confirm-accept': 'Confirm', '#win-title': 'Congratulations!',
  '.record-name > span': 'Name this result', '#skip-record': 'Skip saving', '#record-form button[type="submit"]': 'Save record',
  '#records-title': 'Records on this device', '.record-explain': 'Records are saved on this device. Each difficulty and mode has its own ranking.',
  '.record-filters label:first-child > span': 'Difficulty', '.record-filters label:last-child > span': 'Mode',
  '#difficulty option[value="easy"]': 'Easy', '#difficulty option[value="medium"]': 'Medium', '#difficulty option[value="hard"]': 'Hard', '#difficulty option[value="expert"]': 'Expert', '#difficulty option[value="master"]': 'Master',
  '#records-difficulty option[value="easy"]': 'Easy', '#records-difficulty option[value="medium"]': 'Medium', '#records-difficulty option[value="hard"]': 'Hard', '#records-difficulty option[value="expert"]': 'Expert', '#records-difficulty option[value="master"]': 'Master',
  '#error-mode option[value="relaxed"]': 'Relaxed: flag rule conflicts only', '#error-mode option[value="strict"]': 'Strict: count wrong entries immediately',
  '#records-mode option[value="relaxed"]': 'Relaxed mode', '#records-mode option[value="strict"]': 'Strict mode'
};

const techniqueEnglish = [
  ['1. Naked single', 'Easy', 'For an empty cell, exclude digits already in its row, column, and box. If only one candidate remains, enter it. For example, if 4 and 7 seem possible but the column already contains 4, the cell must be 7.'],
  ['2. Hidden single', 'Medium', 'Consider one digit at a time. It must appear once in each row, column, and box. If only one cell in that area can hold it, that cell is determined even if it has other candidates.'],
  ['3. Locked candidates', 'Medium', 'If all possible positions for 5 in one box lie in the same row, 5 can be removed from the rest of that row. Conversely, if all positions for 5 in one row lie in a single box, remove 5 from the other cells in that box. The same logic applies to columns.'],
  ['4. Pairs and triples', 'Hard', 'If two cells in a row, column, or box contain only {2, 7}, those digits must occupy those cells and can be removed elsewhere in the area. This is a naked pair. If two digits can occur only in the same two cells, remove all other candidates from those cells; this is a hidden pair. Triples use the same idea with three cells and digits.'],
  ['5. X-Wing', 'Expert', 'Track one digit. If 6 can appear in only columns 3 and 8 of both rows 2 and 7, these four positions form a rectangle. Whichever way the two rows place 6, no other row can place 6 in columns 3 or 8. Rows and columns can be swapped.'],
  ['6. Swordfish', 'Expert', 'This extends X-Wing to three rows: the candidate positions for one digit across three rows cover only the same three columns. Remove that digit from other rows in those columns. You can also start with three columns.'],
  ['7. XY-Wing', 'Expert', 'Find three cells with two candidates each: a pivot {2, 7}, and two wings {2, 9} and {7, 9} that both see it. Whether the pivot is 2 or 7, one wing must be 9. Any cell that sees both wings cannot be 9.'],
  ['8. Trial and backtracking', 'Master', 'If these techniques give no definite move, choose a cell with few candidates, assume one, and continue reasoning. If a contradiction appears, undo the assumption. Master difficulty also considers the work a solver spends on these branches. A human may know other logical techniques the rater does not yet recognize.']
];

let originalStatic;
let originalTechniques;
function rememberStaticText() {
  if (originalStatic) return;
  originalStatic = Object.entries(staticEnglish).map(([selector, en]) => {
    const element = document.querySelector(selector);
    if (!element) throw new Error(`Missing translation target: ${selector}`);
    return { element, zh: element.textContent, en };
  });
  const details = [...document.querySelectorAll('.technique-guide details')];
  if (details.length !== techniqueEnglish.length) throw new Error('Technique guide translation is incomplete');
  originalTechniques = details.map((detail, index) => {
    const parts = [detail.querySelector('summary span'), detail.querySelector('summary small'), detail.querySelector('p')];
    return { parts, zh: parts.map(part => part.textContent), en: techniqueEnglish[index] };
  });
}

export function applyStaticLanguage() {
  rememberStaticText();
  for (const item of originalStatic) item.element.textContent = item[current];
  for (const item of originalTechniques) item.parts.forEach((part, index) => { part.textContent = item[current][index]; });
  document.documentElement.lang = current === 'en' ? 'en' : 'zh-CN';
  document.title = current === 'en' ? 'Sudoku · Classic Game' : '数独 · 经典游戏';
  document.querySelector('meta[name="description"]').content = current === 'en'
    ? 'Play classic Sudoku on desktop or mobile, with optional candidate number aid.'
    : '随时在电脑或手机浏览器中玩的经典数独，带有可开关的候选数字辅助。';
  const button = document.getElementById('language-button');
  button.textContent = current === 'en' ? '中文' : 'EN';
  button.setAttribute('aria-label', current === 'en' ? '切换为中文' : 'Switch to English');
  button.title = button.getAttribute('aria-label');
  for (const selector of ['#close-rules', '#close-records']) document.querySelector(selector).setAttribute('aria-label', current === 'en' ? 'Close' : '关闭');
  const aria = current === 'en'
    ? ['Sudoku board', '9 by 9 Sudoku board', 'Game controls', 'Number pad']
    : ['数独棋盘', '9乘9数独棋盘', '游戏操作', '数字键盘'];
  ['.game-column', '#board', '.control-column', '#number-pad'].forEach((selector, index) => document.querySelector(selector).setAttribute('aria-label', aria[index]));
  document.getElementById('nickname').placeholder = current === 'en' ? 'Enter a name' : '输入昵称';
}
