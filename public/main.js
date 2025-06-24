let currentBoard = null;
let winner = null;

async function resetGame() {
  const res = await fetch('/reset', { method: 'POST' });
  const boardRes = await fetch('/status');  // ← 새로 추가
  const data = await boardRes.json();
  currentBoard = data.board;
  winner = data.winner;
  document.getElementById('status').innerText = "Your turn!";
  await updateGame();
}


document.getElementById('difficulty').addEventListener('change', async (e) => {
  await fetch('/difficulty', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level: e.target.value })
  });
});

async function updateGame() {
  const gameDiv = document.getElementById('game');
  gameDiv.innerHTML = '';

  if (!currentBoard) return;

  currentBoard.boards.forEach((sb, sbIndex) => {
    const sbDiv = document.createElement('div');
    sbDiv.className = 'small-board';
    if (sb.winner && sb.winner !== 'draw') sbDiv.classList.add('won');

    sb.cells.forEach((cell, cellIndex) => {
      const cellBtn = document.createElement('button');
      cellBtn.className = 'cell';
      cellBtn.innerText = cell || '';
      if (!cell && !winner && (currentBoard.activeBoardIndex === null || currentBoard.activeBoardIndex === sbIndex)) {
        cellBtn.onclick = () => makeMove(sbIndex, cellIndex);
      }
      sbDiv.appendChild(cellBtn);
    });

    gameDiv.appendChild(sbDiv);
  });
}

async function makeMove(boardIndex, cellIndex) {
  const res = await fetch('/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ boardIndex, cellIndex })
  });

  const data = await res.json();
  currentBoard = data.board;
  winner = data.winner;


  document.getElementById('status').innerText =
    winner ? `🎉 Winner: ${winner}` : "Your turn!";
  await updateGame();
}

(async () => {
  await resetGame();
})();
