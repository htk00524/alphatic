const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

let roomCount = 1;
const games = {}; // roomName: { players: [socket.id,...], board: [...], turn: 1 or 2, rematchRequests: [] }

// 기존 방에서 나가고 게임 상태 초기화 함수
function leaveGame(socket, room) {
  if (!room || !games[room]) return;
  const game = games[room];
  game.players = game.players.filter(id => id !== socket.id);

  // 상대가 있으면 상대에게도 알려줌
  socket.to(room).emit('status', '상대가 나갔습니다. 게임이 종료됩니다.');

  // 게임 상태 초기화
  delete games[room];

  socket.leave(room);
}

// 승리 체크 함수
function checkWin(board, player) {
  const winCombos = [
    [0,1,2],[3,4,5],[6,7,8], // 가로
    [0,3,6],[1,4,7],[2,5,8], // 세로
    [0,4,8],[2,4,6]          // 대각선
  ];
  return winCombos.some(combo => combo.every(i => board[i] === player));
}

// 무승부 체크
function checkDraw(board) {
  return board.every(cell => cell !== null);
}

io.on('connection', (socket) => {
  socket.on('join-random-room', () => {
    // 기존 방 있으면 나가고 새 방 조인
    if (socket.currentRoom) {
      leaveGame(socket, socket.currentRoom);
      socket.currentRoom = null;
    }

    // 빈 방 찾기
    let roomName = null;
    for (const [name, game] of Object.entries(games)) {
      if (game.players.length === 1) {
        roomName = name;
        break;
      }
    }
    // 없으면 새로 생성
    if (!roomName) {
      roomName = `room${roomCount++}`;
      games[roomName] = { players: [], board: Array(9).fill(null), turn: 1, rematchRequests: [] };
    }
    socket.join(roomName);
    socket.currentRoom = roomName;

    const game = games[roomName];
    game.players.push(socket.id);

    const playerNum = game.players.indexOf(socket.id) + 1;
    socket.emit('player-number', playerNum);
    io.to(roomName).emit('status', `플레이어 ${playerNum}가 입장했습니다.`);

    if (game.players.length === 2) {
      io.to(roomName).emit('start-game');
      io.to(roomName).emit('board-update', game.board);
      io.to(roomName).emit('turn', game.turn);
    }
  });

  socket.on('create-room', (roomCode) => {
    if (socket.currentRoom) {
      leaveGame(socket, socket.currentRoom);
      socket.currentRoom = null;
    }

    if (games[roomCode]) {
      socket.emit('error-message', '이미 존재하는 방 코드입니다.');
      return;
    }

    games[roomCode] = { players: [], board: Array(9).fill(null), turn: 1, rematchRequests: [] };
    socket.join(roomCode);
    socket.currentRoom = roomCode;

    games[roomCode].players.push(socket.id);

    socket.emit('player-number', 1);
    socket.emit('joined-room', roomCode);
    socket.emit('status', `방 생성 완료: ${roomCode} - 친구에게 코드 공유하세요.`);
  });

  socket.on('join-room', (roomCode) => {
    if (socket.currentRoom) {
      leaveGame(socket, socket.currentRoom);
      socket.currentRoom = null;
    }

    const game = games[roomCode];
    if (!game) {
      socket.emit('error-message', '존재하지 않는 방 코드입니다.');
      return;
    }
    if (game.players.length >= 2) {
      socket.emit('error-message', '방이 가득 찼습니다.');
      return;
    }

    socket.join(roomCode);
    socket.currentRoom = roomCode;

    game.players.push(socket.id);

    const playerNum = game.players.indexOf(socket.id) + 1;
    socket.emit('player-number', playerNum);
    io.to(roomCode).emit('status', `플레이어 ${playerNum}가 입장했습니다.`);

    if (game.players.length === 2) {
      io.to(roomCode).emit('start-game');
      io.to(roomCode).emit('board-update', game.board);
      io.to(roomCode).emit('turn', game.turn);
    }

    socket.emit('joined-room', roomCode);
  });

  socket.on('leave-room', (room) => {
    leaveGame(socket, room);
    socket.currentRoom = null;
  });

  socket.on('move', (index) => {
    const room = socket.currentRoom;
    if (!room) return;
    const game = games[room];
    if (!game) return;

    const playerNum = game.players.indexOf(socket.id) + 1;
    if (playerNum !== game.turn) return; // 내 턴이 아니면 무시

    if (game.board[index] !== null) return; // 이미 차있으면 무시

    game.board[index] = playerNum;

    io.to(room).emit('board-update', game.board);

    if (checkWin(game.board, playerNum)) {
      io.to(room).emit('game-over', `플레이어 ${playerNum} 승리!`);
      delete games[room];
      return;
    }

    if (checkDraw(game.board)) {
      io.to(room).emit('game-over', '무승부입니다!');
      delete games[room];
      return;
    }

    // 턴 변경
    game.turn = (game.turn === 1) ? 2 : 1;
    io.to(room).emit('turn', game.turn);
  });

  socket.on('disconnect', () => {
    if (socket.currentRoom) {
      leaveGame(socket, socket.currentRoom);
      socket.currentRoom = null;
    }
  });
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
