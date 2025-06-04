const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const MAX_PLAYERS_PER_ROOM = 2;

let roomCount = 1;

// 게임 상태 저장: { [roomName]: { board, currentTurn, players, gameStarted, rematchRequests } }
const games = {};

function findRandomRoom() {
  // 랜덤매칭용 빈 방 찾기
  const rooms = io.sockets.adapter.rooms;
  for (const [roomName, room] of rooms) {
    // 실제 플레이어 소켓만 있는 방 (소켓.id와 방 이름이 같은 방은 제외)
    if (!io.sockets.sockets.has(roomName) && room.size < MAX_PLAYERS_PER_ROOM) {
      return roomName;
    }
  }
  // 없으면 새 방 생성
  return `room-${roomCount++}`;
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-random-room', () => {
    if (socket.data.room) {
      socket.leave(socket.data.room);
      leaveGame(socket, socket.data.room);
    }
    const room = findRandomRoom();
    joinGameRoom(socket, room);
  });

  socket.on('create-room', (roomCode) => {
    if (socket.data.room) {
      socket.leave(socket.data.room);
      leaveGame(socket, socket.data.room);
    }

    if (games[roomCode]) {
      socket.emit('error-message', '이미 존재하는 방 코드입니다.');
      return;
    }

    joinGameRoom(socket, roomCode, true);
  });

  socket.on('join-room', (roomCode) => {
    if (socket.data.room) {
      socket.leave(socket.data.room);
      leaveGame(socket, socket.data.room);
    }
    if (!games[roomCode]) {
      socket.emit('error-message', '존재하지 않는 방 코드입니다.');
      return;
    }
    joinGameRoom(socket, roomCode);
  });

  socket.on('move', (index) => {
    const room = socket.data.room;
    if (!room) return;
    const game = games[room];
    if (!game || !game.gameStarted) return;

    if (game.players[game.currentTurn - 1] !== socket.id) return; // 내 턴 아님
    if (index < 0 || index > 8) return;
    if (game.board[index] !== null) return;

    game.board[index] = game.currentTurn;

    // 승리 체크
    const winPatterns = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];

    const checkWin = winPatterns.some(pattern =>
      pattern.every(idx => game.board[idx] === game.currentTurn)
    );

    const checkDraw = game.board.every(cell => cell !== null);

    if (checkWin) {
      io.to(room).emit('board-update', game.board);
      io.to(room).emit('game-over', `플레이어 ${game.currentTurn} 승리!`);
      game.gameStarted = false;
      game.rematchRequests = {};
      return;
    }

    if (checkDraw) {
      io.to(room).emit('board-update', game.board);
      io.to(room).emit('game-over', '무승부입니다!');
      game.gameStarted = false;
      game.rematchRequests = {};
      return;
    }

    // 턴 변경
    game.currentTurn = game.currentTurn === 1 ? 2 : 1;
    io.to(room).emit('board-update', game.board);
    io.to(room).emit('turn', game.currentTurn);
  });

  socket.on('rematch-request', () => {
    const room = socket.data.room;
    if (!room) return;
    const game = games[room];
    if (!game) return;
    game.rematchRequests[socket.id] = true;

    const allRequested = game.players.every(id => game.rematchRequests[id]);
    if (allRequested) {
      game.board = Array(9).fill(null);
      game.currentTurn = 1;
      game.gameStarted = true;
      game.rematchRequests = {};
      io.to(room).emit('start-game');
      io.to(room).emit('turn', game.currentTurn);
      io.to(room).emit('board-update', game.board);
    } else {
      io.to(room).emit('status', '재대결 요청 대기 중...');
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    if (!socket.data.room) return;
    leaveGame(socket, socket.data.room);
  });
});

// 게임 입장 함수
function joinGameRoom(socket, room, isCreator=false) {
  socket.join(room);
  socket.data.room = room;

  if (!games[room]) {
    games[room] = {
      board: Array(9).fill(null),
      currentTurn: 1,
      players: [],
      gameStarted: false,
      rematchRequests: {},
    };
  }
  const game = games[room];

  if (game.players.length >= MAX_PLAYERS_PER_ROOM) {
    socket.emit('error-message', '방이 가득 찼습니다.');
    socket.leave(room);
    delete socket.data.room;
    return;
  }

  game.players.push(socket.id);
  const playerNumber = game.players.indexOf(socket.id) + 1;
  socket.emit('player-number', playerNumber);

  if (game.players.length < MAX_PLAYERS_PER_ROOM) {
    socket.emit('status', '상대방을 기다리는 중...');
  }

  if (game.players.length === MAX_PLAYERS_PER_ROOM && !game.gameStarted) {
    game.gameStarted = true;
    io.to(room).emit('start-game');
    io.to(room).emit('turn', game.currentTurn);
    io.to(room).emit('board-update', game.board);
  }
}

// 게임 나가기 함수
function leaveGame(socket, room) {
  const game = games[room];
  if (!game) return;

  game.players = game.players.filter(id => id !== socket.id);

  io.to(room).emit('game-over', '상대가 나갔습니다. 게임 종료.');

  game.gameStarted = false;
  game.board = Array(9).fill(null);
  game.currentTurn = 1;
  game.rematchRequests = {};

  socket.leave(room);
  delete socket.data.room;

  if (game.players.length === 0) {
    delete games[room];
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
