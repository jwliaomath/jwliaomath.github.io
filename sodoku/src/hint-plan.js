import { BOXES, COLS, PEERS, ROWS } from './sudoku.js';
import { nextLogicalPlacement } from './rater.js';

const quickTips = {
  '单格唯一候选': '排除同行、同列和同宫已出现的数字，找只剩一个候选的格子。',
  '行列宫唯一位置': '找某个数字在一行、一列或一宫里唯一能放的位置。',
  '区块排除': '若某数字在一个宫内只落在同一行或列，可排除该行或列其他宫的相同候选。',
  '数对': '两个格锁定同一对数字，可从该区域其他格排除这两个候选。',
  '三数组': '三个格共同锁定三个数字，可从该区域其他格排除它们。',
  '显性数对': '同一区域的两个格都只剩相同两数，可从该区域其他格排除这两数。',
  '隐性数对': '两个数字在同一区域只出现于同两格，可删去这两格的其他候选。',
  '显性三数组': '三个格的候选数合起来只有三个，可从同区域其他格排除它们。',
  '隐性三数组': '三个数字在同一区域只落在同三格，可删去那三格的其他候选。',
  'X-Wing': '同一数字在两行只落在相同两列，可从那两列的其他行排除。',
  'Swordfish': '同一数字在三行的候选合起来只覆盖三列，可从那三列的其他行排除。',
  'XY-Wing': '三个双候选格构成中心与两翼，可从同时看见两翼的格子排除共同数字。',
  'Swordfish / XY-Wing': '寻找三行三列的鱼形，或三个双候选格组成的翼形来排除候选。'
};
const englishTips = {
  '单格唯一候选': ['Naked single', 'Eliminate digits already present in the row, column, and box; find a cell with one candidate left.'],
  '行列宫唯一位置': ['Hidden single', 'Find the only place for a digit in one row, column, or box.'],
  '区块排除': ['Locked candidates', 'If a digit in one box is confined to a row or column, remove it elsewhere on that line.'],
  '数对': ['Pair', 'Two cells share the same two digits; remove those digits from other cells in the area.'],
  '三数组': ['Triple', 'Three cells share three digits; remove those digits from other cells in the area.'],
  '显性数对': ['Naked pair', 'Two cells in one area have the same two candidates; remove them elsewhere in that area.'],
  '隐性数对': ['Hidden pair', 'Two digits occur only in the same two cells; remove other candidates from those cells.'],
  '显性三数组': ['Naked triple', 'Three cells together have only three candidates; remove them elsewhere in the area.'],
  '隐性三数组': ['Hidden triple', 'Three digits occur only in the same three cells; remove other candidates from those cells.'],
  'X-Wing': ['X-Wing', 'One digit appears in the same two columns of two rows; remove it elsewhere in those columns.'],
  'Swordfish': ['Swordfish', 'Candidates for one digit in three rows cover only three columns; remove it from other rows in those columns.'],
  'XY-Wing': ['XY-Wing', 'Three cells with two candidates form a pivot and wings; remove their shared digit from cells seeing both wings.'],
  'Swordfish / XY-Wing': ['Swordfish / XY-Wing', 'Look for a three-row fish or a pivot with two wings to remove candidates.']
};

function unitName(unit) {
  const row = ROWS.indexOf(unit);
  if (row >= 0) return `第${row + 1}行`;
  const col = COLS.indexOf(unit);
  if (col >= 0) return `第${col + 1}列`;
  const box = BOXES.indexOf(unit);
  return box >= 0 ? `第${box + 1}宫` : '相关区域';
}

export function buildHintPlan(board, solution, selected = -1) {
  if (selected === null) selected = -1;
  const wrong = board.findIndex((value, i) => value && value !== solution[i]);
  if (wrong >= 0) {
    const index = selected >= 0 && board[selected] && board[selected] !== solution[selected] ? selected : wrong;
    return { kind: 'correction', index, value: solution[index], region: PEERS[index].filter(i => board[i]) };
  }
  const preferred = selected >= 0 && !board[selected] ? selected : -1;
  const logical = nextLogicalPlacement(board, preferred);
  if (logical) {
    const region = logical.unit || PEERS[logical.index].filter(i => board[i]);
    return { kind: 'logical', ...logical, region, unitLabel: logical.unit ? unitName(logical.unit) : null };
  }
  const index = preferred >= 0 ? preferred : board.findIndex((value, i) => !value && solution[i]);
  if (index < 0) return null;
  return { kind: 'advanced', index, value: solution[index], region: PEERS[index].filter(i => board[i]) };
}

export function hintMessage(plan, stage, lang = 'zh') {
  if (lang === 'en') {
    if (stage === 1) {
      if (plan.kind === 'correction') return 'One entered number needs checking. Press Hint again to see where.';
      if (plan.kind === 'advanced') return 'The hint solver found no definite move it can explain. See Trial and backtracking in How to play & tips, or press Hint again to highlight an empty cell.';
      const first = plan.preparations[0] || plan.technique;
      const [name, tip] = englishTips[first] || [first, 'Look for a candidate you can eliminate.'];
      const more = plan.preparations.length ? ` Then look for ${englishTips[plan.technique]?.[0] || plan.technique}.` : '';
      return `Try ${name}: ${tip}${more} Press Hint again to see where. Details are in How to play & tips.`;
    }
    if (stage === 2) {
      if (plan.kind === 'correction') return 'The cell to check is highlighted. You can erase it and reason again; press Hint once more to correct it.';
      if (plan.kind === 'advanced') return 'An empty cell is highlighted. Press Hint once more to reveal its number.';
      let area = 'the highlighted cell and its filled peers';
      if (plan.unit) {
        const row = ROWS.indexOf(plan.unit), col = COLS.indexOf(plan.unit), box = BOXES.indexOf(plan.unit);
        area = row >= 0 ? `row ${row + 1}` : col >= 0 ? `column ${col + 1}` : `box ${box + 1}`;
      }
      return plan.unit
        ? `Look at ${area} and find the only place for a digit. Press Hint again to reveal the answer.`
        : `Look at ${area}; exclude digits already in the row, column, or box. Press Hint again to reveal the answer.`;
    }
    return `Hint: row ${Math.floor(plan.index / 9) + 1}, column ${plan.index % 9 + 1} is ${plan.value}.`;
  }
  if (stage === 1) {
    if (plan.kind === 'correction') return '有一个已填数字需要检查。再按一次“提示”查看位置。';
    if (plan.kind === 'advanced') return '当前提示器没有找到可解释的确定步骤。可先看“玩法与技巧”中的试探与回退；再按一次“提示”查看一个待填格。';
    const first = plan.preparations[0] || plan.technique;
    const more = plan.preparations.length ? `之后再找${plan.technique}。` : '';
    return `试试「${first}」：${quickTips[first]}${more}再按一次“提示”查看位置；详细用法见“玩法与技巧”。`;
  }
  if (stage === 2) {
    if (plan.kind === 'correction') return '已标出需要检查的格子。可以先擦除，再按推理重新填；再按一次“提示”会直接改正。';
    if (plan.kind === 'advanced') return '已标出一个待填格。再按一次“提示”会直接填入答案。';
    const area = plan.unitLabel ? `观察标出的${plan.unitLabel}` : '观察标出的格子及相关已填数字';
    const detail = plan.unitLabel ? '，找只剩一个落点的数字' : '，排除同行、同列和九宫格已出现的数字';
    return `${area}${detail}。再按一次“提示”揭示答案。`;
  }
  return `提示：第${Math.floor(plan.index / 9) + 1}行第${plan.index % 9 + 1}列是 ${plan.value}。`;
}
