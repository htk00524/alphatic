const SIZE = 3; // ← 추가
let board = ["", "", "", "", "", "", "", "", ""];
let player = "X";
let gameOver = false;

const boardEl = document.getElementById("board");
const resultEl = document.getElementById("result");

function renderBoard() {
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = `repeat(${SIZE}, 60px)`; // JS로 지정 가능

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
  if (checkWinner(player)) return endGame("당신이 이겼습니다!");
  if (isDraw()) return endGame("무승부입니다!");

  setTimeout(aiMove, 200);
}

async function aiMove() {
  const difficulty = document.getElementById("difficulty").value;
  const response = await fetch("/ai-move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ board, difficulty })
  });
  const data = await response.json();
  board[data.move] = "O";
  renderBoard();
  if (checkWinner("O")) return endGame("AI가 이겼습니다!");
  if (isDraw()) return endGame("무승부입니다!");
}

function checkWinner(p) {
  const win = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return win.some(pattern => pattern.every(i => board[i] === p));
}

function isDraw() {
  return board.every(cell => cell !== "");
}

function endGame(message) {
  resultEl.textContent = message;
  gameOver = true;
  document.querySelectorAll(".cell").forEach(cell => cell.classList.add("disabled"));
}

function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  gameOver = false;
  resultEl.textContent = "";
  renderBoard();
}

renderBoard();
