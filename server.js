// ✅ server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;
app.use(express.static('public'));

const rooms = {};
const rematchVotes = {};

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  do {
    code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (rooms[code]);
  return code;
}

function findRoomOfSocket(id) {
  for (const code in rooms) {
    if (rooms[code].players.includes(id)) return code;
  }
  return null;
}

function initGame(roomCode) {
  const room = rooms[roomCode];
  room.board = Array(9).fill(null);
  room.turn = 1;
  room.gameOver = false;
}

function checkWin(board, player) {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6],
  ];
  return lines.some(([a,b,c]) => board[a] === player && board[b] === player && board[c] === player);
}

function handleLeaveRoom(socket) {
  const roomCode = findRoomOfSocket(socket.id);
  if (!roomCode) return;

  const room = rooms[roomCode];
  room.players = room.players.filter(id => id !== socket.id);

  if (room.players.length === 0) {
    delete rooms[roomCode];
    delete rematchVotes[roomCode];
  } else {
    room.closed = true;
    room.gameOver = true;
    const remainingPlayer = room.players[0];
    io.to(remainingPlayer).emit('status', '상대방이 나갔습니다.');
    io.to(remainingPlayer).emit('game-over', { message: '상대방이 나가 게임이 종료되었습니다.', showRematch: false });
  }
}

io.on('connection', (socket) => {
  console.log('유저 접속:', socket.id);

  socket.on('create-room', () => {
    const code = generateRoomCode();
    rooms[code] = {
      players: [socket.id],
      board: Array(9).fill(null),
      turn: 1,
      gameOver: false,
      closed: false,
      matchType: 'manual', // ✅ 수동 생성 방
    };
    socket.join(code);
    socket.emit('player-number', 1);
    socket.emit('room-code', code);
    socket.emit('room-created', code);
  });

  socket.on('join-room', (code) => {
    const room = rooms[code];
    if (!room) return socket.emit('error-message', '존재하지 않는 방입니다.');
    if (room.closed) return socket.emit('error-message', '입장할 수 없는 방입니다.');
    if (room.players.length >= 2) return socket.emit('error-message', '방이 가득 찼습니다.');
    if (room.matchType !== 'manual') return socket.emit('error-message', '해당 방은 수동 입장이 불가능합니다.');

    room.players.push(socket.id);
    socket.join(code);
    socket.emit('player-number', 2);
    io.to(code).emit('status', '두 명이 모여 게임을 시작합니다.');
    initGame(code);
    io.to(code).emit('start-game');
    io.to(code).emit('board-update', room.board);
    io.to(code).emit('turn', room.turn);
  });

  socket.on('join-random-room', () => {
    let targetRoom = null;
    for (const code in rooms) {
      const room = rooms[code];
      if (!room.closed && room.matchType === 'random' && room.players.length === 1) {
        targetRoom = code;
        break;
      }
    }
    if (!targetRoom) {
      targetRoom = generateRoomCode();
      rooms[targetRoom] = {
        players: [],
        board: Array(9).fill(null),
        turn: 1,
        gameOver: false,
        closed: false,
        matchType: 'random', // ✅ 랜덤 매칭 방
      };
    }

    const room = rooms[targetRoom];
    if (room.players.length >= 2) return socket.emit('error-message', '랜덤 방 입장이 불가능합니다.');

    room.players.push(socket.id);
    socket.join(targetRoom);
    const playerNum = room.players.length;
    socket.emit('player-number', playerNum);
    socket.emit('room-code', targetRoom);
    socket.emit('status', `랜덤 방 입장: ${targetRoom}`);

    if (playerNum === 2) {
      io.to(targetRoom).emit('status', '두 명이 모여 게임을 시작합니다.');
      initGame(targetRoom);
      io.to(targetRoom).emit('start-game');
      io.to(targetRoom).emit('board-update', room.board);
      io.to(targetRoom).emit('turn', room.turn);
    }
  });

  socket.on('move', (index) => {
    const code = findRoomOfSocket(socket.id);
    if (!code) return;
    const room = rooms[code];
    if (room.gameOver) return;

    const playerIdx = room.players.indexOf(socket.id);
    const playerNum = playerIdx + 1;
    if (room.turn !== playerNum) return;
    if (room.board[index] !== null) return;

    room.board[index] = playerNum;

    if (checkWin(room.board, playerNum)) {
      room.gameOver = true;
      io.to(code).emit('board-update', room.board);
      io.to(code).emit('game-over', { message: `플레이어 ${playerNum} 승리!`, showRematch: true });
    } else if (room.board.every(cell => cell !== null)) {
      room.gameOver = true;
      io.to(code).emit('board-update', room.board);
      io.to(code).emit('game-over', { message: '무승부입니다.', showRematch: true });
    } else {
      room.turn = 3 - playerNum;
      io.to(code).emit('board-update', room.board);
      io.to(code).emit('turn', room.turn);
    }
  });

  socket.on('chat-message', (msg) => {
    const code = findRoomOfSocket(socket.id);
    if (!code) return;
    const room = rooms[code];
    const senderIdx = room.players.indexOf(socket.id);
    if (senderIdx === -1) return;
    const senderNum = senderIdx + 1;
    io.to(code).emit('chat-message', { sender: senderNum, message: msg });
  });

  socket.on('rematch-request', () => {
    const code = findRoomOfSocket(socket.id);
    if (!code) return;
    if (!rematchVotes[code]) rematchVotes[code] = new Set();
    rematchVotes[code].add(socket.id);

    const room = rooms[code];
    const otherPlayer = room.players.find(id => id !== socket.id);
    if (otherPlayer) {
      io.to(otherPlayer).emit('chat-message', {
        sender: 0,
        message: '상대가 재대결을 요청했습니다.'
      });
    }

    if (rematchVotes[code].size === 2) {
      rematchVotes[code] = new Set();
      initGame(code);
      io.to(code).emit('rematch-start');
      io.to(code).emit('board-update', room.board);
      io.to(code).emit('turn', room.turn);
    }
  });

  socket.on('leave-room', () => {
    handleLeaveRoom(socket);
  });

  socket.on('disconnect', () => {
    handleLeaveRoom(socket);
  });
});

http.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
