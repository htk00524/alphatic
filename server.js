// ==== server.js ====
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;
app.use(express.static('public'));

const rooms = {};
const rematchVotes = {};
const friendRequests = {}; // { fromSocketId: toSocketId }

function findRoomOfSocket(id) {
  for (const room in rooms) {
    if (rooms[room].players.includes(id)) return room;
  }
  return null;
}

function initGame(room) {
  rooms[room].board = Array(9).fill(null);
  rooms[room].turn = 1;
  rooms[room].gameOver = false;
}

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

function checkWin(board, player) {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6],
  ];
  return lines.some(([a,b,c]) =>
    board[a] === player && board[b] === player && board[c] === player
  );
}

function handleLeaveRoom(socket) {
  const roomCode = findRoomOfSocket(socket.id);
  if (!roomCode) return;

  const room = rooms[roomCode];
  room.players = room.players.filter(id => id !== socket.id);

  if (room.players.length === 0) {
    delete rooms[roomCode];
    delete rematchVotes[roomCode];
    console.log(`방 삭제됨: ${roomCode}`);
  } else {
    room.closed = true;
    room.gameOver = true;
    room.players.forEach(playerId => {
      io.to(playerId).emit('status', '상대방이 방을 나갔습니다.');
      io.to(playerId).emit('game-over', {
        message: '상대방이 나가 게임이 종료되었습니다.',
        showRematch: false
      });
    });
  }
}

io.on('connection', (socket) => {
  console.log(`유저 접속: ${socket.id}`);

  socket.on('create-room', () => {
    const roomCode = generateRoomCode();
    rooms[roomCode] = {
      players: [socket.id],
      board: Array(9).fill(null),
      turn: 1,
      gameOver: false,
      chat: [],
      closed: false,
    };
    socket.join(roomCode);
    socket.emit('player-number', 1);
    socket.emit('room-code', roomCode);
    socket.emit('room-created', roomCode);
    console.log(`방 생성: ${roomCode}`);
  });

  socket.on('join-room', (roomCode) => {
    const room = rooms[roomCode];
    if (!room || room.closed || room.players.length >= 2) {
      socket.emit('error-message', '방에 참여할 수 없습니다.');
      return;
    }
    room.players.push(socket.id);
    socket.join(roomCode);
    socket.emit('player-number', 2);
    io.to(roomCode).emit('status', '두 명이 모여 게임을 시작합니다.');
    initGame(roomCode);
    io.to(roomCode).emit('start-game');
    io.to(roomCode).emit('board-update', room.board);
    io.to(roomCode).emit('turn', room.turn);
    console.log(`방 참가: ${roomCode} (${socket.id})`);
  });

  socket.on('join-random-room', () => {
    let targetRoom = null;
    for (const r in rooms) {
      const room = rooms[r];
      if (!room.closed && room.players.length === 1 && room.players[0] !== socket.id) {
        targetRoom = r;
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
        chat: [],
        closed: false,
      };
    }
    const room = rooms[targetRoom];
    if (room.closed || room.players.length >= 2) {
      socket.emit('error-message', '랜덤 방 입장이 불가능합니다.');
      return;
    }
    room.players.push(socket.id);
    socket.join(targetRoom);
    const playerNum = room.players.length;
    socket.emit('player-number', playerNum);
    socket.emit('status', `랜덤 방 입장: ${targetRoom}`);
    socket.emit('room-code', targetRoom);

    if (playerNum === 2) {
      io.to(targetRoom).emit('status', '두 명이 모여 게임을 시작합니다.');
      initGame(targetRoom);
      io.to(targetRoom).emit('start-game');
      io.to(targetRoom).emit('board-update', room.board);
      io.to(targetRoom).emit('turn', room.turn);
    }
  });

  socket.on('move', (index) => {
    const roomCode = findRoomOfSocket(socket.id);
    if (!roomCode) return;
    const room = rooms[roomCode];
    if (room.gameOver) return;

    const playerIndex = room.players.indexOf(socket.id);
    const playerNum = playerIndex + 1;
    if (room.turn !== playerNum || room.board[index] !== null) return;

    room.board[index] = playerNum;

    if (checkWin(room.board, playerNum)) {
      room.gameOver = true;
      io.to(roomCode).emit('board-update', room.board);
      io.to(roomCode).emit('game-over', {
        message: `플레이어 ${playerNum} 승리!`,
        showRematch: true
      });
      return;
    } else if (room.board.every(cell => cell !== null)) {
      room.gameOver = true;
      io.to(roomCode).emit('board-update', room.board);
      io.to(roomCode).emit('game-over', {
        message: '무승부입니다.',
        showRematch: true
      });
      return;
    }

    room.turn = room.turn === 1 ? 2 : 1;
    io.to(roomCode).emit('board-update', room.board);
    io.to(roomCode).emit('turn', room.turn);
  });

  socket.on('chat-message', (msg) => {
    const roomCode = findRoomOfSocket(socket.id);
    if (!roomCode) return;
    const room = rooms[roomCode];
    const senderIndex = room.players.indexOf(socket.id);
    if (senderIndex === -1) return;
    const senderNum = senderIndex + 1;

    io.to(roomCode).emit('chat-message', {
      sender: senderNum,
      message: msg
    });
  });

  socket.on('rematch-request', () => {
    const roomCode = findRoomOfSocket(socket.id);
    if (!roomCode) return;
    if (!rematchVotes[roomCode]) rematchVotes[roomCode] = new Set();
    rematchVotes[roomCode].add(socket.id);

    const room = rooms[roomCode];
    const otherPlayer = room.players.find(id => id !== socket.id);
    if (otherPlayer) {
      io.to(otherPlayer).emit('chat-message', {
        sender: 0,
        message: '상대가 재대결을 요청했습니다.'
      });
    }

    if (rematchVotes[roomCode].size === 2) {
      rematchVotes[roomCode] = new Set();
      initGame(roomCode);
      io.to(roomCode).emit('rematch-start');
      io.to(roomCode).emit('board-update', room.board);
      io.to(roomCode).emit('turn', room.turn);
    }
  });

  socket.on('leave-room', () => {
    handleLeaveRoom(socket);
  });

  socket.on('request-profile', () => {
    const roomCode = findRoomOfSocket(socket.id);
    if (!roomCode) return;
    const room = rooms[roomCode];
    const opponent = room.players.find(id => id !== socket.id);
    if (opponent) {
      io.to(socket.id).emit('show-profile', {
        opponentId: opponent,
        wins: Math.floor(Math.random() * 10),
        losses: Math.floor(Math.random() * 10)
      });
    }
  });

  socket.on('send-friend-request', (targetId) => {
    if (!targetId) return;
    io.to(targetId).emit('friend-request-received', socket.id);
  });

  socket.on('accept-friend-request', (fromId) => {
    io.to(fromId).emit('friend-request-accepted', socket.id);
  });

  socket.on('disconnect', () => {
    handleLeaveRoom(socket);
  });
});

http.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
