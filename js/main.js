document.addEventListener("DOMContentLoaded", () => {
  // AI 대전
  document.getElementById("btn-ai")?.addEventListener("click", () => {
    location.href = "game.html";
  });

  // 랜덤 입장
  document.getElementById("btn-random")?.addEventListener("click", () => {
    alert("랜덤 입장 로직 필요 (서버와 연결 예정)");
  });

  // 방 생성 버튼 클릭 → 모달 열기
  document.getElementById("btn-create")?.addEventListener("click", () => {
    document.getElementById("modal")?.classList.add("show");
  });

  // 방 생성 모달 닫기
  document.getElementById("btn-close")?.addEventListener("click", () => {
    document.getElementById("modal")?.classList.remove("show");
  });

  // 방 생성 완료 버튼
  document.getElementById("btn-create-room")?.addEventListener("click", () => {
    const name = document.getElementById("room-name")?.value.trim();
    const key = document.getElementById("room-key")?.value.trim();
    if (name && key) {
      alert(`방 생성 요청: ${name} (${key})`);
    } else {
      alert("방 이름과 코드를 모두 입력해주세요.");
    }
  });

  // 코드 입력 버튼 클릭 → 코드 입력 모달 열기
  document.getElementById("btn-input-code")?.addEventListener("click", () => {
    document.getElementById("code-modal")?.classList.add("show");
  });

  // 코드 입력 모달 닫기
  document.getElementById("btn-close-code")?.addEventListener("click", () => {
    document.getElementById("code-modal")?.classList.remove("show");
  });

  // 코드 입력 후 입장
  document.getElementById("btn-join-room")?.addEventListener("click", () => {
    const code = document.getElementById("room-code")?.value.trim();
    if (code) {
      alert("입장 코드: " + code);
    } else {
      alert("입장 코드를 입력해주세요.");
    }
  });
});

let board = Array(9).fill(null);
let gameOver = false;

document.getElementById('board').addEventListener('click', e => {
  const idx = e.target.closest('canvas')?.dataset.index;
  if (idx !== undefined) playerMove(Number(idx));
});

document.getElementById('resetBtn').addEventListener('click', resetGame);

function updateStatus(text) {
  statusElem.textContent = text;
}

function playerMove(idx) {
  if (gameOver || board[idx] !== null) return;
  board[idx] = PLAYER;
  render();

  if (checkWin(PLAYER)) return endGame('● 당신 승리!');
  if (checkDraw()) return endGame('무승부!');

  updateStatus('✕ AI 차례...');
  setTimeout(aiMove, 600);
}

function aiMove() {
  if (gameOver) return;

  const best = getBestMove(board);
  if (best !== null) {
    board[best] = AI;
    render();
    if (checkWin(AI)) return endGame('✕ AI 승리!');
    if (checkDraw()) return endGame('무승부!');
    updateStatus('● 당신 차례');
  }
}

function checkWin(player) {
  return winCombos.some(combo => combo.every(i => board[i] === player));
}

function checkDraw() {
  return board.every(cell => cell !== null);
}

function endGame(message) {
  updateStatus(message);
  gameOver = true;
}

function resetGame() {
  board = Array(9).fill(null);
  gameOver = false;
  updateStatus('● 당신 차례');
  render();
}
