import { GOAL, hasMoves, isValidBoard, moveBoard, newBoard, spawnTile } from "./engine.js";
import { applyStaticLanguage, language, setLanguage, t } from "./i18n.js";

const STORAGE_KEY = "junwen-2048-v1";
const MODES = ["assist", "classic"];

const $ = (selector) => document.querySelector(selector);
const boardElement = $("#board");
const tutorialDialog = $("#tutorial-dialog");
const confirmDialog = $("#confirm-dialog");
const resultDialog = $("#result-dialog");
const toastElement = $("#toast");

const tutorialSteps = [
  {
    title: { zh: "移动所有方块", en: "Move all the tiles" },
    copy: { zh: "电脑按方向键或 W、A、S、D；手机在棋盘上向任意方向滑动。一次操作会移动棋盘上的所有方块。", en: "Use arrow keys or WASD on a computer, or swipe on the board on a phone. Every tile slides in the chosen direction." },
    before: [2, 0, 0, 0],
    after: [0, 0, 0, 2],
    arrow: "→",
  },
  {
    title: { zh: "让相同数字相遇", en: "Merge matching tiles" },
    copy: { zh: "相同的两个数字碰在一起，就会合成一个双倍数字。比如 2 + 2 = 4，同时获得 4 分。", en: "Two matching tiles merge into one tile with twice the value. For example, 2 + 2 makes 4 and scores 4 points." },
    before: [2, 2, 0, 0],
    after: [4, 0, 0, 0],
    arrow: "←",
  },
  {
    title: { zh: "一次只合并一次", en: "One merge per move" },
    copy: { zh: "同一个方块一回合只能合并一次。2、2、2、2 向左移动，会变成 4、4，而不是直接变成 8。", en: "A tile can merge only once in a move. Sliding 2, 2, 2, 2 to the left makes 4, 4, not an 8." },
    before: [2, 2, 2, 2],
    after: [4, 4, 0, 0],
    arrow: "←",
  },
  {
    title: { zh: "给新方块留空间", en: "Leave space for new tiles" },
    copy: { zh: "每次有效移动后，随机空格里会出现一个 2，偶尔是 4。填满棋盘且再也无法合并时，本局结束。", en: "After every valid move, a 2 (or occasionally a 4) appears in a random empty cell. The game ends when the board is full and no merges remain." },
    before: [8, 4, 2, 0],
    after: [8, 4, 2, 2],
    arrow: "+2",
  },
  {
    title: { zh: "按自己的节奏玩", en: "Choose your style" },
    copy: { zh: "经典模式遵循原版规则，不提供工具。辅助模式可以撤销、交换或删除方块；合成 512 或更大数字时会补充工具次数。两个模式的进度分别保存。", en: "Classic mode has no power-ups. Assisted mode lets you undo, swap, or delete tiles. Merge a 512 or larger tile to earn more uses. Each mode saves separately." },
    before: [128, 128, 256, 256],
    after: [256, 512, 0, 0],
    arrow: "←",
  },
];

function freshRun() {
  return {
    board: newBoard(),
    score: 0,
    moves: 0,
    won: false,
    keepPlaying: false,
    lost: false,
    tools: { undo: 1, swap: 1, delete: 1 },
    history: [],
  };
}

function validRun(run) {
  return (
    run &&
    isValidBoard(run.board) &&
    Number.isSafeInteger(run.score) &&
    run.score >= 0 &&
    Number.isSafeInteger(run.moves) &&
    run.moves >= 0 &&
    run.tools &&
    ["undo", "swap", "delete"].every((name) =>
      Number.isInteger(run.tools[name]) && run.tools[name] >= 0 && run.tools[name] <= 9,
    )
  );
}

function loadState() {
  const fallback = {
    mode: "assist",
    games: { assist: freshRun(), classic: freshRun() },
    best: { assist: 0, classic: 0 },
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !MODES.includes(saved.mode)) return fallback;
    for (const mode of MODES) {
      if (validRun(saved.games?.[mode])) {
        fallback.games[mode] = {
          ...saved.games[mode],
          board: [...saved.games[mode].board],
          history: Array.isArray(saved.games[mode].history)
            ? saved.games[mode].history.filter(validRun).slice(-30)
            : [],
          won: Boolean(saved.games[mode].won),
          keepPlaying: Boolean(saved.games[mode].keepPlaying),
          lost: Boolean(saved.games[mode].lost),
        };
      }
      if (Number.isSafeInteger(saved.best?.[mode]) && saved.best[mode] >= 0) {
        fallback.best[mode] = saved.best[mode];
      }
    }
    fallback.mode = saved.mode;
  } catch {
    // Private browsing or disabled storage still allows a normal in-memory game.
  }
  return fallback;
}

let firstVisit = false;
try {
  firstVisit = localStorage.getItem(STORAGE_KEY) === null;
} catch {
  // Storage is optional.
}
const state = loadState();
let selectedTool = null;
let swapFirst = null;
let tutorialIndex = 0;
let toastTimer;
let pointerStart = null;

function currentRun() {
  return state.games[state.mode];
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The game remains playable if storage is unavailable.
  }
}

function snapshot(run) {
  return {
    board: [...run.board],
    score: run.score,
    moves: run.moves,
    won: run.won,
    keepPlaying: run.keepPlaying,
    lost: run.lost,
    tools: { ...run.tools },
  };
}

function remember(run) {
  run.history.push(snapshot(run));
  if (run.history.length > 30) run.history.shift();
}

function toast(message) {
  toastElement.textContent = message;
  toastElement.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastElement.classList.remove("show"), 2600);
}

function closeResult() {
  if (resultDialog.open) resultDialog.close();
}

function showResult(kind) {
  const run = currentRun();
  const win = kind === "win";
  $("#result-eyebrow").textContent = t(win ? "goal" : "gameOver");
  $("#result-title").textContent = t(win ? "won" : "lost");
  $("#result-copy").textContent = win
    ? t("winCopy", { score: run.score.toLocaleString(language() === "en" ? "en-US" : "zh-CN") })
    : t("lossCopy", { score: run.score.toLocaleString(language() === "en" ? "en-US" : "zh-CN") });
  $("#result-secondary").textContent = win
    ? t("keepGoing")
    : state.mode === "assist" && run.tools.undo > 0 && run.history.length > 0
      ? t("undoMove")
      : t("close");
  if (!resultDialog.open) resultDialog.showModal();
}

function finishAction(run) {
  state.best[state.mode] = Math.max(state.best[state.mode], run.score);
  if (!run.won && run.board.some((value) => value >= GOAL)) {
    run.won = true;
    run.keepPlaying = false;
    save();
    render();
    showResult("win");
    return;
  }
  run.lost = !hasMoves(run.board);
  save();
  render();
  if (run.lost) showResult("lost");
}

function move(direction) {
  if (tutorialDialog.open || confirmDialog.open || resultDialog.open) return;
  const run = currentRun();
  if (run.lost) return showResult("lost");
  if (run.won && !run.keepPlaying) return showResult("win");
  const result = moveBoard(run.board, direction);
  if (!result.moved) return;
  remember(run);
  selectedTool = null;
  swapFirst = null;
  run.board = spawnTile(result.board);
  run.score += result.gained;
  run.moves += 1;
  if (state.mode === "assist") {
    for (const value of result.mergedValues) {
      if (value >= 512) {
        for (const tool of Object.keys(run.tools)) {
          run.tools[tool] = Math.min(9, run.tools[tool] + 1);
        }
        toast(t("earned", { value }));
      }
    }
  }
  finishAction(run);
}

function undo() {
  const run = currentRun();
  if (state.mode !== "assist" || run.tools.undo < 1 || run.history.length === 0) {
    toast(t("noUndo"));
    return;
  }
  const charges = run.tools.undo - 1;
  const previous = run.history.pop();
  const history = run.history;
  state.games.assist = { ...previous, history, tools: { ...previous.tools, undo: charges } };
  selectedTool = null;
  swapFirst = null;
  closeResult();
  save();
  render();
  toast(t("undone"));
}

function chooseTool(name) {
  if (state.mode !== "assist") return;
  const run = currentRun();
  if (name === "undo") return undo();
  if (run.tools[name] < 1) return toast(t("noCharges", { tool: t(name) }));
  selectedTool = selectedTool === name ? null : name;
  swapFirst = null;
  render();
  if (selectedTool) {
    toast(t(name === "swap" ? "swapPrompt" : "deletePrompt"));
  }
}

function clickCell(index) {
  if (state.mode !== "assist" || !selectedTool || resultDialog.open) return;
  const run = currentRun();
  const value = run.board[index];
  if (value === 0) return toast(t("chooseTile"));
  if (selectedTool === "swap") {
    if (swapFirst === null) {
      swapFirst = index;
      render();
      return;
    }
    if (swapFirst === index) {
      swapFirst = null;
      render();
      return;
    }
    if (run.board[swapFirst] === value) return toast(t("chooseDifferent"));
    remember(run);
    [run.board[swapFirst], run.board[index]] = [run.board[index], run.board[swapFirst]];
    run.tools.swap -= 1;
    selectedTool = null;
    swapFirst = null;
    finishAction(run);
    toast(t("swapped"));
    return;
  }
  if (selectedTool === "delete") {
    remember(run);
    run.board = run.board.map((tile) => (tile === value ? 0 : tile));
    run.tools.delete -= 1;
    selectedTool = null;
    finishAction(run);
    toast(t("deleted", { value }));
  }
}

function render() {
  const run = currentRun();
  boardElement.replaceChildren();
  run.board.forEach((value, index) => {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    if (index === swapFirst) cell.classList.add("cell-selected");
    cell.dataset.value = String(value);
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-label", t("tileLabel", { row: Math.floor(index / 4) + 1, column: index % 4 + 1, value }));
    cell.textContent = value || "";
    cell.addEventListener("click", () => clickCell(index));
    boardElement.append(cell);
  });

  $("#score").textContent = run.score.toLocaleString(language() === "en" ? "en-US" : "zh-CN");
  $("#best").textContent = state.best[state.mode].toLocaleString(language() === "en" ? "en-US" : "zh-CN");
  for (const mode of MODES) {
    $("#mode-" + mode).setAttribute("aria-pressed", String(state.mode === mode));
  }
  $("#tools-panel").hidden = state.mode === "classic";
  $("#mode-description").textContent = state.mode === "assist"
    ? t("assistDescription")
    : t("classicDescription");
  $("#board-caption").textContent = state.mode === "assist"
    ? t("assistCaption")
    : t("classicCaption");
  for (const name of Object.keys(TOOL_NAMES)) {
    $("#" + name + "-count").textContent = "×" + run.tools[name];
    const button = $("#" + name + "-button");
    button.disabled = run.tools[name] === 0 || (name === "undo" && run.history.length === 0);
    button.classList.toggle("active", selectedTool === name);
    button.setAttribute("aria-pressed", String(selectedTool === name));
  }
  $("#tool-hint").textContent = selectedTool === "swap"
    ? swapFirst === null ? t("swapHint") : t("secondSwap")
    : selectedTool === "delete"
      ? t("deleteHint")
      : t("toolHint");
}

function renderTutorial() {
  const step = tutorialSteps[tutorialIndex];
  $("#tutorial-progress").textContent = t("progress", { step: tutorialIndex + 1, total: tutorialSteps.length });
  $("#tutorial-title").textContent = step.title[language()];
  $("#tutorial-copy").textContent = step.copy[language()];
  const demo = $("#tutorial-demo");
  const tiles = (values) => values.map((value) =>
    `<span class="demo-cell" data-value="${value}">${value || ""}</span>`,
  ).join("");
  demo.innerHTML = `<div class="demo-row">${tiles(step.before)}</div><span class="demo-arrow">${step.arrow}</span><div class="demo-row">${tiles(step.after)}</div>`;
  $("#tutorial-prev").disabled = tutorialIndex === 0;
  $("#tutorial-next").textContent = t(tutorialIndex === tutorialSteps.length - 1 ? "startPlaying" : "next");
}

function openTutorial() {
  tutorialIndex = 0;
  renderTutorial();
  tutorialDialog.showModal();
}

$("#tutorial-button").addEventListener("click", openTutorial);
$("#language-button").addEventListener("click", () => {
  setLanguage(language() === "zh" ? "en" : "zh");
  render();
  if (tutorialDialog.open) renderTutorial();
});
$("#guide-link").addEventListener("click", openTutorial);
$("#tutorial-close").addEventListener("click", () => tutorialDialog.close());
$("#tutorial-prev").addEventListener("click", () => {
  tutorialIndex = Math.max(0, tutorialIndex - 1);
  renderTutorial();
});
$("#tutorial-next").addEventListener("click", () => {
  if (tutorialIndex === tutorialSteps.length - 1) tutorialDialog.close();
  else {
    tutorialIndex += 1;
    renderTutorial();
  }
});

$("#new-game-button").addEventListener("click", () => confirmDialog.showModal());
$("#cancel-new").addEventListener("click", () => confirmDialog.close());
$("#confirm-new").addEventListener("click", () => {
  state.games[state.mode] = freshRun();
  selectedTool = null;
  swapFirst = null;
  confirmDialog.close();
  closeResult();
  save();
  render();
  toast(t("started"));
});

for (const mode of MODES) {
  $("#mode-" + mode).addEventListener("click", () => {
    state.mode = mode;
    selectedTool = null;
    swapFirst = null;
    closeResult();
    save();
    render();
  });
}
for (const name of Object.keys(TOOL_NAMES)) {
  $("#" + name + "-button").addEventListener("click", () => chooseTool(name));
}

$("#result-secondary").addEventListener("click", () => {
  const run = currentRun();
  if (run.won && !run.keepPlaying) {
    run.keepPlaying = true;
    resultDialog.close();
    save();
    return;
  }
  if (run.lost && state.mode === "assist" && run.tools.undo > 0 && run.history.length > 0) {
    resultDialog.close();
    undo();
    return;
  }
  resultDialog.close();
});
$("#result-new").addEventListener("click", () => {
  resultDialog.close();
  confirmDialog.showModal();
});

document.addEventListener("keydown", (event) => {
  if (tutorialDialog.open || confirmDialog.open || resultDialog.open) return;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
  const directions = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", s: "down", a: "left", d: "right",
  };
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (directions[key]) {
    event.preventDefault();
    move(directions[key]);
  } else if (key === "z" && state.mode === "assist") {
    event.preventDefault();
    undo();
  } else if (key === "n" || key === "r") {
    event.preventDefault();
    confirmDialog.showModal();
  }
});

boardElement.addEventListener("pointerdown", (event) => {
  pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
});
boardElement.addEventListener("pointerup", (event) => {
  if (!pointerStart || pointerStart.id !== event.pointerId) return;
  const dx = event.clientX - pointerStart.x;
  const dy = event.clientY - pointerStart.y;
  pointerStart = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 28) return;
  event.preventDefault();
  move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
});
boardElement.addEventListener("pointercancel", () => { pointerStart = null; });

applyStaticLanguage();
render();
save();
if (firstVisit) openTutorial();
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // The game still runs online if offline caching is unavailable.
    });
  });
}
