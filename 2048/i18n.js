export const LANGUAGE_KEY = "jwliaomath-games-language";

let currentLanguage = "zh";
try {
  if (localStorage.getItem(LANGUAGE_KEY) === "en") currentLanguage = "en";
} catch {
  // Language switching still works when browser storage is unavailable.
}

const messages = {
  zh: {
    languageButton: "EN", languageLabel: "切换为英文", title: "2048 · 数字合成",
    description: "一款可在电脑和手机游玩的 2048。支持方向键、WASD、滑动操作和离线游玩。",
    home: "← 主页", homeLabel: "返回个人主页", tutorial: "玩法教程", newGame: "新游戏",
    gameLabel: "2048 游戏", eyebrow: "数字合成游戏", heading: "合并方块，达到 <span>2048</span>",
    score: "本局得分", best: "最高得分", boardLabel: "4 乘 4 的 2048 游戏棋盘",
    sideLabel: "游戏模式和工具", modeHeading: "游戏模式", switchAnytime: "随时切换",
    assisted: "辅助模式", classic: "经典模式", toolsHeading: "辅助工具", replenish: "合成 512 可补充次数",
    undo: "撤销", swap: "交换", delete: "删除", undoLabel: "撤销上一步",
    swapLabel: "交换两个方块", deleteLabel: "删除同数字方块",
    quickStart: "快速上手", guide1: "朝一个方向移动，所有方块会一起滑动。",
    guide2: "两个相同数字相遇，会合成一个更大的数字。", guide3: "每次有效移动后，会出现一个新方块。",
    guideLink: "查看分步教程 →", footerSave: "进度保存在这台设备的浏览器中 · 首次联网打开后可离线游玩",
    footerCredit: "2048 游戏创意：Gabriele Cirulli", closeTutorial: "关闭教程", previous: "上一步",
    next: "下一步", startPlaying: "开始游戏", confirmTitle: "开始新游戏？",
    confirmCopy: "当前模式的本局进度会重新开始，最高得分仍会保留。",
    cancelNew: "继续当前游戏", confirmNew: "开始新游戏", resultNew: "新游戏",
    goal: "达成目标", gameOver: "本局结束", won: "你合成了 2048！", lost: "没有可走的方向了",
    keepGoing: "继续挑战", undoMove: "撤销一步", close: "关闭",
    noUndo: "暂时无法撤销", undone: "已撤销上一步", swapPrompt: "依次点击两个非空方块",
    deletePrompt: "点击一个数字，删除棋盘上所有相同数字", chooseTile: "请选择有数字的方块",
    chooseDifferent: "请选择两个不同数字的方块", swapped: "两个方块已交换",
    assistDescription: "可使用撤销、交换和删除工具。两个模式各自保存进度。",
    classicDescription: "遵循经典规则：没有辅助工具，专心挑战 2048。",
    assistCaption: "方向键 / WASD / 滑动来移动；选好工具后可点击方块。",
    classicCaption: "方向键 / WASD / 滑动来移动。相同数字相遇就会合并。",
    swapHint: "依次点击两个非空方块进行交换。", secondSwap: "再点击一个不同数字的方块。",
    deleteHint: "点击一个数字，删除棋盘上所有相同数字。",
    toolHint: "先专心合并数字；需要时再使用工具。", started: "新游戏已开始",
    empty: "空", tileLabel: ({ row, column, value }) => `第 ${row} 行第 ${column} 列：${value || "空"}`,
    progress: ({ step, total }) => `第 ${step} 步 / 共 ${total} 步`,
    winCopy: ({ score }) => `本局得分 ${score}。还可以继续挑战更高数字。`,
    lossCopy: ({ score }) => `本局得分 ${score}。再试一次，或使用剩余的撤销次数。`,
    earned: ({ value }) => `合成 ${value}！每种工具增加 1 次`,
    noCharges: ({ tool }) => `${tool}次数已用完`,
    deleted: ({ value }) => `已删除所有 ${value} 方块`,
  },
  en: {
    languageButton: "中文", languageLabel: "Switch to Chinese", title: "2048 · Merge Tiles",
    description: "Play 2048 on desktop or mobile with arrow keys, WASD, swipes, and offline support.",
    home: "← Home", homeLabel: "Back to homepage", tutorial: "How to play", newGame: "New game",
    gameLabel: "2048 game", eyebrow: "NUMBER MERGE GAME", heading: "Merge tiles to reach <span>2048</span>",
    score: "Score", best: "Best", boardLabel: "4 by 4 2048 game board",
    sideLabel: "Game modes and tools", modeHeading: "Game mode", switchAnytime: "Switch anytime",
    assisted: "Assisted", classic: "Classic", toolsHeading: "Power-ups", replenish: "Merge 512+ to recharge",
    undo: "Undo", swap: "Swap", delete: "Delete", undoLabel: "Undo the previous move",
    swapLabel: "Swap two tiles", deleteLabel: "Delete tiles with the same number",
    quickStart: "Quick start", guide1: "Move in one direction to slide every tile.",
    guide2: "Equal tiles merge into one larger tile.", guide3: "A new tile appears after every valid move.",
    guideLink: "Step-by-step tutorial →", footerSave: "Progress is saved in this browser · Play offline after your first online visit",
    footerCredit: "2048 created by Gabriele Cirulli", closeTutorial: "Close tutorial", previous: "Previous",
    next: "Next", startPlaying: "Start playing", confirmTitle: "Start a new game?",
    confirmCopy: "Your current game in this mode will restart. Your best score will be kept.",
    cancelNew: "Keep playing", confirmNew: "Start new game", resultNew: "New game",
    goal: "GOAL REACHED", gameOver: "GAME OVER", won: "You made 2048!", lost: "No moves left",
    keepGoing: "Keep going", undoMove: "Undo a move", close: "Close",
    noUndo: "Undo is unavailable", undone: "Last move undone", swapPrompt: "Select two numbered tiles",
    deletePrompt: "Select a number to delete all matching tiles", chooseTile: "Select a numbered tile",
    chooseDifferent: "Select two tiles with different numbers", swapped: "Tiles swapped",
    assistDescription: "Use undo, swap, and delete. Each mode saves its own progress.",
    classicDescription: "Original 2048 rules, with no power-ups.",
    assistCaption: "Arrow keys / WASD / swipe to move; tap a tile after selecting a tool.",
    classicCaption: "Arrow keys / WASD / swipe to move. Matching tiles merge.",
    swapHint: "Select two numbered tiles to swap.", secondSwap: "Now select a tile with a different number.",
    deleteHint: "Select a number to delete all matching tiles.",
    toolHint: "Focus on merging tiles first; use tools when needed.", started: "New game started",
    empty: "empty", tileLabel: ({ row, column, value }) => `Row ${row}, column ${column}: ${value || "empty"}`,
    progress: ({ step, total }) => `Step ${step} of ${total}`,
    winCopy: ({ score }) => `Score: ${score}. You can keep going for a higher tile.`,
    lossCopy: ({ score }) => `Score: ${score}. Try again, or use an undo if you have one.`,
    earned: ({ value }) => `Merged ${value}! +1 use for each power-up`,
    noCharges: ({ tool }) => `No ${tool.toLowerCase()} uses left`,
    deleted: ({ value }) => `Deleted all ${value} tiles`,
  },
};

const staticSelectors = {
  ".back-link": "home", "#tutorial-button": "tutorial", "#new-game-button": "newGame",
  ".play-area .eyebrow": "eyebrow", ".score-card:not(.best) span": "score",
  ".score-card.best span": "best", ".mode-card .section-heading h2": "modeHeading",
  ".mode-card .section-heading span": "switchAnytime", "#mode-assist": "assisted",
  "#mode-classic": "classic", ".tools-card .section-heading h2": "toolsHeading",
  ".tools-card .section-heading span": "replenish", "#undo-button span:nth-child(2)": "undo",
  "#swap-button span:nth-child(2)": "swap", "#delete-button span:nth-child(2)": "delete",
  ".help-card .section-heading h2": "quickStart", ".help-card li:nth-child(1)": "guide1",
  ".help-card li:nth-child(2)": "guide2", ".help-card li:nth-child(3)": "guide3",
  "#guide-link": "guideLink", "#tool-hint": "toolHint", ".site-footer span:nth-child(1)": "footerSave",
  ".site-footer span:nth-child(2)": "footerCredit", "#tutorial-prev": "previous",
  "#confirm-title": "confirmTitle", "#confirm-dialog .dialog-inner > p": "confirmCopy",
  "#cancel-new": "cancelNew", "#confirm-new": "confirmNew", "#result-new": "resultNew",
};

const ariaSelectors = {
  ".back-link": "homeLabel", ".play-area": "gameLabel", "#board": "boardLabel",
  ".side-panel": "sideLabel", ".mode-switch": "modeHeading", "#undo-button": "undoLabel",
  "#swap-button": "swapLabel", "#delete-button": "deleteLabel", "#tutorial-close": "closeTutorial",
};

export function language() { return currentLanguage; }
export function t(key, params = {}) {
  const message = messages[currentLanguage][key];
  return typeof message === "function" ? message(params) : message;
}
export function setLanguage(next) {
  currentLanguage = next === "en" ? "en" : "zh";
  try { localStorage.setItem(LANGUAGE_KEY, currentLanguage); } catch { /* Optional. */ }
  applyStaticLanguage();
}
export function applyStaticLanguage() {
  document.documentElement.lang = currentLanguage === "en" ? "en" : "zh-CN";
  document.title = t("title");
  document.querySelector('meta[name="description"]').content = t("description");
  for (const [selector, key] of Object.entries(staticSelectors)) document.querySelector(selector).textContent = t(key);
  for (const [selector, key] of Object.entries(ariaSelectors)) document.querySelector(selector).setAttribute("aria-label", t(key));
  document.querySelector(".game-heading h1").innerHTML = t("heading");
  const button = document.querySelector("#language-button");
  button.textContent = t("languageButton");
  button.setAttribute("aria-label", t("languageLabel"));
  button.title = t("languageLabel");
}
