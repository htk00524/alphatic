const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

// 게임 로직 불러오기
const gameLogics = {
  '3x3': require('./gameLogics/gameLogic3x3'),
};

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

io.on('connection', (socket) => {
  console.log('유저 접속:', socket.id);

  socket.on('create-room', () => {
    const code = generateRoomCode();
    rooms[code] = {
      players: [socket.id],
      gameInstance: new gameLogics['3x3'](),
      matchType: 'manual',
    };
    socket.join(code);
    socket.emit('player-number', 1);
    socket.emit('room-code', code);
    socket.emit('room-created', code);
  });

  socket.on('join-room', (code) => {
    const room = rooms[code];
    if (!room || room.players.length >= 2) {
      return socket.emit('error-message', '방에 입장할 수 없습니다.');
    }
    room.players.push(socket.id);
    socket.join(code);
    socket.emit('player-number', 2);
    io.to(code).emit('status', '두 명이 모여 게임을 시작합니다.');
    io.to(code).emit('start-game');
    io.to(code).emit('board-update', room.gameInstance.board);
    io.to(code).emit('turn', room.gameInstance.turn);
  });

  socket.on('join-random-room', () => {
    let targetRoom = null;
    for (const code in rooms) {
      const room = rooms[code];
      if (room.matchType === 'random' && room.players.length === 1) {
        targetRoom = code;
        break;
      }
    }

    if (!targetRoom) {
      targetRoom = generateRoomCode();
      rooms[targetRoom] = {
        players: [],
        gameInstance: new gameLogics['3x3'](),
        matchType: 'random',
      };
    }

    const room = rooms[targetRoom];
    room.players.push(socket.id);
    socket.join(targetRoom);
    const playerNum = room.players.length;
    socket.emit('player-number', playerNum);
    socket.emit('room-code', targetRoom);
    socket.emit('status', `랜덤 방 입장: ${targetRoom}`);

    if (playerNum === 2) {
      io.to(targetRoom).emit('status', '두 명이 모여 게임을 시작합니다.');
      io.to(targetRoom).emit('start-game');
      io.to(targetRoom).emit('board-update', room.gameInstance.board);
      io.to(targetRoom).emit('turn', room.gameInstance.turn);
    }
  });

  socket.on('move', (index) => {
    const code = findRoomOfSocket(socket.id);
    if (!code) return;
    const room = rooms[code];
    const playerNum = room.players.indexOf(socket.id) + 1;
    const result = room.gameInstance.move(playerNum, index);
    if (!result) return;

    io.to(code).emit('board-update', room.gameInstance.board);
    if (result === 'win') {
      io.to(code).emit('game-over', { message: `플레이어 ${playerNum} 승리!`, showRematch: true });
    } else if (result === 'draw') {
      io.to(code).emit('game-over', { message: '무승부입니다.', showRematch: true });
    } else {
      io.to(code).emit('turn', room.gameInstance.turn);
    }
  });

  socket.on('chat-message', (msg) => {
    const code = findRoomOfSocket(socket.id);
    if (!code) return;
    const room = rooms[code];
    const senderIdx = room.players.indexOf(socket.id);
    const senderNum = senderIdx + 1;
    io.to(code).emit('chat-message', { sender: senderNum, message: msg });
  });

  socket.on('rematch-request', () => {
    const code = findRoomOfSocket(socket.id);
    if (!code) return;
    if (!rematchVotes[code]) rematchVotes[code] = new Set();
    rematchVotes[code].add(socket.id);

    const room = rooms[code];
    if (room.players.length === 2 && rematchVotes[code].size === 2) {
      rematchVotes[code] = new Set();
      room.gameInstance.reset();
      io.to(code).emit('rematch-start');
      io.to(code).emit('board-update', room.gameInstance.board);
      io.to(code).emit('turn', room.gameInstance.turn);
    }
  });

  socket.on('leave-room', () => {
    const code = findRoomOfSocket(socket.id);
    if (!code) return;
    const room = rooms[code];
    room.players = room.players.filter(id => id !== socket.id);
    if (room.players.length === 0) {
      delete rooms[code];
    } else {
      io.to(room.players[0]).emit('status', '상대방이 나갔습니다.');
      io.to(room.players[0]).emit('game-over', { message: '상대방이 나가 게임이 종료되었습니다.', showRematch: false });
    }
  });

  socket.on('disconnect', () => {
    const code = findRoomOfSocket(socket.id);
    if (!code) return;
    const room = rooms[code];
    room.players = room.players.filter(id => id !== socket.id);
    if (room.players.length === 0) {
      delete rooms[code];
    } else {
      io.to(room.players[0]).emit('status', '상대방이 나갔습니다.');
      io.to(room.players[0]).emit('game-over', { message: '상대방이 나가 게임이 종료되었습니다.', showRematch: false });
    }
  });
});

http.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
