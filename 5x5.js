const SIZE = 5;
const WIN_COUNT = 5;
let board = Array(SIZE * SIZE).fill("");
let player = "X";
let gameOver = false;

const boardEl = document.getElementById("board");
const resultEl = document.getElementById("result");

function renderBoard() {
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = `repeat(${SIZE}, 60px)`;
  board.forEach((cell, i) => {
    const cellEl = document.createElement("div");
    cellEl.classList.add("cell");
    if (cell !== "") cellEl.classList.add("disabled");
    cellEl.textContent = cell;
    cellEl.addEventListener("click", () => playerMove(i));
    boardEl.appendChild(cellEl);
  });
}

function playerMove(index) {
  if (board[index] || gameOver) return;
  board[index] = player;
  renderBoard();
  if (checkWinner(board, player)) return endGame("당신이 이겼습니다!");
  if (isDraw()) return endGame("무승부입니다!");

  setTimeout(aiMove, 200);
}

async function aiMove() {
  const difficulty = document.getElementById("difficulty").value;
  const response = await fetch("/ai-move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ board, difficulty, mode: "5x5" })
  });
  const data = await response.json();
  board[data.move] = "O";
  renderBoard();
  if (checkWinner(board, "O")) return endGame("AI가 이겼습니다!");
  if (isDraw()) return endGame("무승부입니다!");
}

function isDraw() {
  return board.every(cell => cell !== "");
}

function checkWinner(b, p) {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (
        checkLine(b, row, col, 0, 1, p) ||  // →
        checkLine(b, row, col, 1, 0, p) ||  // ↓
        checkLine(b, row, col, 1, 1, p) ||  // ↘
        checkLine(b, row, col, 1, -1, p)    // ↙
      ) return true;
    }
  }
  return false;
}

function checkLine(b, row, col, dRow, dCol, p) {
  for (let i = 0; i < WIN_COUNT; i++) {
    let r = row + i * dRow;
    let c = col + i * dCol;
    if (r < 0 || c < 0 || r >= SIZE || c >= SIZE || b[r * SIZE + c] !== p) return false;
  }
  return true;
}

function endGame(msg) {
  resultEl.textContent = msg;
  gameOver = true;
  document.querySelectorAll(".cell").forEach(cell => cell.classList.add("disabled"));
}

function resetGame() {
  board = Array(SIZE * SIZE).fill("");
  gameOver = false;
  resultEl.textContent = "";
  renderBoard();
}

renderBoard();
