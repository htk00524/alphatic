const socket = io();

let currentMode = '3x3';
let myPlayerNum = null;
let boardData = null;
let currentPlayer = null;
let activeBoardIndex = null;
let gameOver = false;

// UI 요소
const boardElem = document.getElementById('board');
const statusElem = document.getElementById('status');
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const gameModeSelect = document.getElementById('game-mode-select');
const btnRandom = document.getElementById('btn-random');
const btnCreate = document.getElementById('btn-create-room');
const btnJoin = document.getElementById('btn-join-room');
const inputRoomCode = document.getElementById('input-room-code');
const roomCodeDisplay = document.getElementById('room-code-display');
const btnRematch = document.getElementById('btn-rematch');

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (chatInput.value.trim() !== '') {
    socket.emit('chat-message', chatInput.value.trim());
    chatInput.value = '';
  }
});

gameModeSelect.addEventListener('change', () => {
  currentMode = gameModeSelect.value;
  resetGameUI();
  updateButtons();
});

btnRandom.addEventListener('click', () => {
  socket.emit('join-random-room', currentMode);
  resetGameUI();
});

btnCreate.addEventListener('click', () => {
  socket.emit('create-room', currentMode);
  resetGameUI();
});

btnJoin.addEventListener('click', () => {
  const code = inputRoomCode.value.trim().toUpperCase();
  if (code) {
    socket.emit('join-room', code, currentMode);
    resetGameUI();
  }
});

btnRematch.addEventListener('click', () => {
  socket.emit('rematch-request');
  btnRematch.style.display = 'none';
});

function resetGameUI() {
  boardElem.innerHTML = '';
  statusElem.textContent = '대기 중...';
  roomCodeDisplay.textContent = '';
  gameOver = false;
  boardData = null;
  currentPlayer = null;
}

function updateButtons() {
  if (currentMode.includes('ai')) {
    btnRandom.style.display = 'none';
    btnJoin.style.display = 'none';
  } else {
    btnRandom.style.display = 'inline-block';
    btnJoin.style.display = 'inline-block';
  }
}

function renderBoard() {
  boardElem.innerHTML = '';

  if (!boardData) return;

  if (currentMode === 'ultimate' || currentMode === 'ultimate-ai') {
    boardElem.style.display = 'grid';
    boardElem.style.gridTemplateColumns = 'repeat(3, auto)';
    boardElem.style.gap = '10px';

    for (let b = 0; b < 9; b++) {
      const smallBoardDiv = document.createElement('div');
      smallBoardDiv.className = 'small-board';
      smallBoardDiv.style.cssText = `
        display: grid;
        grid-template-columns: repeat(3, 40px);
        grid-gap: 2px;
        padding: 6px;
        border: 2px solid ${(activeBoardIndex === null || activeBoardIndex === b) ? '#3366cc' : '#ccc'};
        border-radius: 6px;
        background-color: ${(activeBoardIndex === null || activeBoardIndex === b) ? '#eef4ff' : '#f9f9f9'};
        user-select: none;
      `;

      const smallBoard = boardData.boards[b];
      for (let i = 0; i < 9; i++) {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'cell';
        cellDiv.style.width = '40px';
        cellDiv.style.height = '40px';
        cellDiv.style.display = 'flex';
        cellDiv.style.alignItems = 'center';
        cellDiv.style.justifyContent = 'center';
        cellDiv.style.fontSize = '26px';
        cellDiv.style.fontWeight = 'bold';
        cellDiv.style.cursor = 'default';
        cellDiv.style.border = '1px solid #999';
        cellDiv.style.userSelect = 'none';

        if (smallBoard.cells[i]) {
          cellDiv.textContent = smallBoard.cells[i];
          cellDiv.classList.add(smallBoard.cells[i].toLowerCase());
        }

        if (!smallBoard.winner && !gameOver &&
            currentPlayer === (myPlayerNum === 1 ? 'X' : 'O') &&
            (activeBoardIndex === null || activeBoardIndex === b) &&
            !cellDiv.textContent) {
          cellDiv.style.cursor = 'pointer';
          cellDiv.addEventListener('click', () => {
            socket.emit('move', { boardIndex: b, cellIndex: i });
          });
        } else {
          cellDiv.classList.add('disabled');
        }

        smallBoardDiv.appendChild(cellDiv);
      }

      if (smallBoard.winner && smallBoard.winner !== 'draw') {
        smallBoardDiv.style.backgroundColor = smallBoard.winner === 'X' ? '#cce5ff' : '#ffd6d6';
      }

      boardElem.appendChild(smallBoardDiv);
    }
  } else {
    const size = (currentMode === '5x5' || currentMode === 'ai-5x5') ? 5 : 3;
    boardElem.style.display = 'grid';
    boardElem.style.gridTemplateColumns = `repeat(${size}, 60px)`;
    boardElem.style.gridGap = '4px';

    boardData.forEach((cell, idx) => {
      const cellDiv = document.createElement('div');
      cellDiv.className = 'cell';
      cellDiv.style.width = '60px';
      cellDiv.style.height = '60px';
      cellDiv.style.display = 'flex';
      cellDiv.style.alignItems = 'center';
      cellDiv.style.justifyContent = 'center';
      cellDiv.style.fontSize = '40px';
      cellDiv.style.fontWeight = 'bold';
      cellDiv.style.border = '1.5px solid #666';
      cellDiv.style.cursor = 'default';
      cellDiv.style.userSelect = 'none';

      if (cell === 1) {
        cellDiv.textContent = 'X';
        cellDiv.classList.add('x');
      } else if (cell === 2) {
        cellDiv.textContent = 'O';
        cellDiv.classList.add('o');
      }

      if (!cellDiv.textContent && currentPlayer === myPlayerNum && !gameOver) {
        cellDiv.style.cursor = 'pointer';
        cellDiv.addEventListener('click', () => {
          socket.emit('move', { index: idx });
        });
      } else {
        cellDiv.classList.add('disabled');
      }

      boardElem.appendChild(cellDiv);
    });
  }
}

socket.on('player-number', (num) => {
  myPlayerNum = num;
  statusElem.textContent = `당신은 플레이어 ${myPlayerNum} 입니다.`;
});

socket.on('room-code', (code) => {
  roomCodeDisplay.textContent = `방 코드: ${code}`;
});

socket.on('status', (msg) => {
  const p = document.createElement('p');
  p.textContent = `[시스템] ${msg}`;
  p.style.color = '#666';
  chatBox.appendChild(p);
  chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on('chat-message', ({ sender, message }) => {
  const p = document.createElement('p');
  p.innerHTML = `<strong>플레이어 ${sender}:</strong> ${message}`;
  chatBox.appendChild(p);
  chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on('board-update', (board) => {
  boardData = board;
  if (currentMode === 'ultimate' || currentMode === 'ultimate-ai') {
    currentPlayer = board.currentPlayer;
    activeBoardIndex = board.activeBoardIndex;
    gameOver = !!board.winner;
  } else {
    currentPlayer = board.turn || currentPlayer;
    gameOver = false;
  }
  renderBoard();
});

socket.on('turn', (player) => {
  currentPlayer = player;
  updateStatus();
  renderBoard();
});

socket.on('game-over', ({ message, showRematch }) => {
  statusElem.textContent = message;
  gameOver = true;
  btnRematch.style.display = showRematch ? 'inline-block' : 'none';
});

socket.on('rematch-start', () => {
  statusElem.textContent = '재대결 시작!';
  gameOver = false;
  btnRematch.style.display = 'none';
  boardData = null;
  renderBoard();
});

socket.on('error-message', (msg) => {
  alert(msg);
});

function updateStatus() {
  if (gameOver) return;
  if (!currentPlayer) {
    statusElem.textContent = '대기 중...';
  } else {
    if (currentMode === 'ultimate' || currentMode === 'ultimate-ai') {
      const playerText = currentPlayer === (myPlayerNum === 1 ? 'X' : 'O') ? '당신 차례' : '상대 차례';
      statusElem.textContent = `턴: ${playerText}`;
    } else {
      statusElem.textContent = `턴: 플레이어 ${currentPlayer}`;
    }
  }
}

resetGameUI();
updateButtons();
