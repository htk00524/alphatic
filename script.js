const socket = io();

const board = document.getElementById('board');
const status = document.getElementById('status');
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

const btnRandom = document.getElementById('btn-random');
const btnCreateRoom = document.getElementById('btn-create-room');
const btnJoinRoom = document.getElementById('btn-join-room');
const inputRoomCode = document.getElementById('input-room-code');
const roomCodeDisplay = document.getElementById('room-code-display');
const btnRematch = document.getElementById('btn-rematch');

let playerNumber = 0;
let myTurn = false;
let boardState = Array(9).fill(null);

function createBoard() {
  board.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('click', onCellClick);
    board.appendChild(cell);
  }
}

function onCellClick(e) {
  if (!myTurn) return;
  const idx = +e.target.dataset.index;
  if (boardState[idx] !== null) return;
  socket.emit('move', idx);
}

function updateBoard(newBoard) {
  boardState = newBoard;
  const cells = board.querySelectorAll('.cell');
  cells.forEach((cell, idx) => {
    cell.textContent = '';
    cell.classList.remove('x', 'o', 'disabled');
    if (boardState[idx] === 1) {
      cell.textContent = 'X';
      cell.classList.add('x');
    } else if (boardState[idx] === 2) {
      cell.textContent = 'O';
      cell.classList.add('o');
    }
  });
}

function disableBoard() {
  const cells = board.querySelectorAll('.cell');
  cells.forEach(cell => cell.classList.add('disabled'));
  myTurn = false;
}

function enableBoard() {
  const cells = board.querySelectorAll('.cell');
  cells.forEach(cell => cell.classList.remove('disabled'));
  myTurn = true;
}

function clearBoard() {
  boardState.fill(null);
  const cells = board.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('x', 'o', 'disabled');
  });
}

btnRandom.addEventListener('click', () => {
  socket.emit('leave-room');
  socket.emit('join-random-room');
  roomCodeDisplay.textContent = '';
  status.textContent = '랜덤 매칭 중...';
});

btnCreateRoom.addEventListener('click', () => {
  socket.emit('leave-room');
  socket.emit('create-room');
  roomCodeDisplay.textContent = '';
  status.textContent = '방을 생성 중...';
});

btnJoinRoom.addEventListener('click', () => {
  socket.emit('leave-room');
  const code = inputRoomCode.value.trim().toUpperCase();
  if (!code) return alert('방 코드를 입력하세요.');
  socket.emit('join-room', code);
});

chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;
  socket.emit('chat-message', message);
  chatInput.value = '';
});

btnRematch.addEventListener('click', () => {
  socket.emit('rematch-request');
  btnRematch.style.display = 'none';
});

function appendChatMessage(msg) {
  const div = document.createElement('div');
  div.textContent = msg;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

socket.on('player-number', num => {
  playerNumber = num;
  status.textContent = `플레이어 ${playerNumber}로 게임에 참여했습니다.`;
});

socket.on('room-code', code => {
  roomCodeDisplay.textContent = `방 코드: ${code}`;
});

socket.on('room-created', roomCode => {
  roomCodeDisplay.textContent = `방 코드: ${roomCode}`;
  appendChatMessage(`[시스템] 방이 생성되었습니다: ${roomCode}`);
});

socket.on('status', msg => {
  appendChatMessage(`[시스템] ${msg}`);
});

socket.on('error-message', msg => {
  alert(msg);
});

socket.on('start-game', () => {
  clearBoard();
  status.textContent = `게임 시작! 플레이어 ${playerNumber}의 턴입니다.`;
  enableBoard();
});

socket.on('board-update', boardArr => {
  updateBoard(boardArr);
});

socket.on('turn', turnNum => {
  myTurn = (turnNum === playerNumber);
  if (myTurn) {
    status.textContent = '당신의 차례입니다.';
    enableBoard();
  } else {
    status.textContent = '상대방 차례입니다.';
    disableBoard();
  }
});

socket.on('game-over', data => {
  status.textContent = data.message;
  disableBoard();
  if (data.showRematch) {
    btnRematch.style.display = 'inline-block';
  } else {
    btnRematch.style.display = 'none';
  }
});

socket.on('rematch-start', () => {
  clearBoard();
  enableBoard();
  status.textContent = `재대결 시작! 플레이어 ${playerNumber}의 턴입니다.`;
  btnRematch.style.display = 'none';
});

socket.on('chat-message', data => {
  if (data.sender === playerNumber) {
    appendChatMessage(`나: ${data.message}`);
  } else {
    appendChatMessage(`상대: ${data.message}`);
  }
});

createBoard();
