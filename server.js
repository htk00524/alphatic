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

// 각 방별 게임 상태 저장
const games = {};  
// 게임 구조 예: { board: [null, null,...], currentTurn: 1, players: [socketId1, socketId2] }

function findRoom() {
  const rooms = io.sockets.adapter.rooms;
  for (const [roomName, room] of rooms) {
    if (!io.sockets.sockets.has(roomName) && room.size < MAX_PLAYERS_PER_ROOM) {
      return roomName;
    }
  }
  return `room-${roomCount++}`;
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  const room = findRoom();
  socket.join(room);
  console.log(`User ${socket.id} joined ${room}`);

  // 방에 플레이어 목록 관리
  if (!games[room]) {
    games[room] = {
      board: Array(9).fill(null),
      currentTurn: 1,
      players: [],
      gameStarted: false,
    };
  }

  const game = games[room];
  game.players.push(socket.id);
  const playerNumber = game.players.indexOf(socket.id) + 1;

  socket.emit('player-number', playerNumber);

  // 두 명 모이면 게임 시작
  if (game.players.length === MAX_PLAYERS_PER_ROOM && !game.gameStarted) {
    game.gameStarted = true;
    io.to(room).emit('start-game');
    io.to(room).emit('turn', game.currentTurn);
    io.to(room).emit('board-update', game.board);
  } else if (!game.gameStarted) {
    socket.emit('status', '상대방을 기다리는 중...');
  }

  // 플레이어가 이동했을 때
  socket.on('move', (index) => {
    // 유효성 검사
    if (!game.gameStarted) return;
    if (game.players[game.currentTurn - 1] !== socket.id) return; // 내 턴이 아님
    if (index < 0 || index > 8) return;
    if (game.board[index] !== null) return;

    // 보드 업데이트
    game.board[index] = game.currentTurn;

    // 승리 체크 함수
    function checkWin(board, player) {
      const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8], // 가로
        [0,3,6],[1,4,7],[2,5,8], // 세로
        [0,4,8],[2,4,6]          // 대각선
      ];
      return winPatterns.some(pattern => 
        pattern.every(idx => board[idx] === player)
      );
    }

    // 무승부 체크
    function checkDraw(board) {
      return board.every(cell => cell !== null);
    }

    // 승리 체크
    if (checkWin(game.board, game.currentTurn)) {
      io.to(room).emit('board-update', game.board);
      io.to(room).emit('game-over', `플레이어 ${game.currentTurn} 승리!`);
      game.gameStarted = false;  // 게임 종료
      return;
    }

    // 무승부 체크
    if (checkDraw(game.board)) {
      io.to(room).emit('board-update', game.board);
      io.to(room).emit('game-over', '무승부입니다!');
      game.gameStarted = false;
      return;
    }

    // 턴 변경
    game.currentTurn = game.currentTurn === 1 ? 2 : 1;

    // 상태 업데이트 전송
    io.to(room).emit('board-update', game.board);
    io.to(room).emit('turn', game.currentTurn);
  });

  // 연결 끊기
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    // 게임 참가자 목록에서 제거
    if (!game) return;
    game.players = game.players.filter(id => id !== socket.id);

    // 게임 초기화 및 알림
    io.to(room).emit('game-over', '상대가 나갔습니다. 게임 종료.');
    game.gameStarted = false;
    game.board = Array(9).fill(null);
    game.currentTurn = 1;
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});