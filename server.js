const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.use(express.static('public')); // public 폴더에 index.html, script.js 등 배치

// 방 정보 저장: { roomCode: { players: [socket.id, ...], board: [...], turn: 1 or 2, ... } }
const rooms = {};

// 방 찾기 (socket.id로)
function findRoomOfSocket(id) {
  for (const room in rooms) {
    if (rooms[room].players.includes(id)) return room;
  }
  return null;
}

// 새 게임 시작 초기화
function initGame(room) {
  rooms[room].board = Array(9).fill(null);
  rooms[room].turn = 1;
  rooms[room].gameOver = false;
}

io.on('connection', (socket) => {
  console.log(`클라이언트 연결: ${socket.id}`);

  socket.on('create-room', (roomCode) => {
    if (rooms[roomCode]) {
      socket.emit('error-message', '이미 존재하는 방 코드입니다.');
      return;
    }
    rooms[roomCode] = {
      players: [socket.id],
      board: Array(9).fill(null),
      turn: 1,
      gameOver: false,
    };
    socket.join(roomCode);
    socket.emit('player-number', 1);
    socket.emit('status', `방 ${roomCode}에 입장했습니다. 친구를 기다리세요.`);
  });

  socket.on('join-room', (roomCode) => {
    const room = rooms[roomCode];
    if (!room) {
      socket.emit('error-message', '존재하지 않는 방 코드입니다.');
      return;
    }
    if (room.players.length >= 2) {
      socket.emit('error-message', '방이 꽉 찼습니다.');
      return;
    }
    room.players.push(socket.id);
    socket.join(roomCode);

    // 플레이어 번호 부여
    const playerNumber = 2;
    socket.emit('player-number', playerNumber);

    // 방 내 모든 플레이어에게 게임 시작 알림
    io.to(roomCode).emit('start-game');
    initGame(roomCode);

    // 게임 상태 초기화 및 첫 턴 알림
    io.to(roomCode).emit('board-update', rooms[roomCode].board);
    io.to(roomCode).emit('turn', rooms[roomCode].turn);
  });

  socket.on('join-random-room', () => {
    // 빈 방 찾기
    let roomCode = null;
    for (const code in rooms) {
      if (rooms[code].players.length === 1) {
        roomCode = code;
        break;
      }
    }
    if (!roomCode) {
      // 새 방 생성
      roomCode = generateRoomCode();
      rooms[roomCode] = {
        players: [],
        board: Array(9).fill(null),
        turn: 1,
        gameOver: false,
      };
    }
    rooms[roomCode].players.push(socket.id);
    socket.join(roomCode);

    const playerNumber = rooms[roomCode].players.indexOf(socket.id) + 1;
    socket.emit('player-number', playerNumber);
    socket.emit('status', `방 ${roomCode}에 입장했습니다.`);

    if (rooms[roomCode].players.length === 2) {
      io.to(roomCode).emit('start-game');
      initGame(roomCode);
      io.to(roomCode).emit('board-update', rooms[roomCode].board);
      io.to(roomCode).emit('turn', rooms[roomCode].turn);
    } else {
      socket.emit('status', '상대를 기다리는 중입니다...');
    }
  });

  socket.on('move', (idx) => {
    const roomCode = findRoomOfSocket(socket.id);
    if (!roomCode) return;

    const room = rooms[roomCode];
    if (room.gameOver) return;
    const playerIndex = room.players.indexOf(socket.id);
    const playerNum = playerIndex + 1;

    if (playerNum !== room.turn) return; // 내 턴이 아닐 때 무시
    if (room.board[idx]) return; // 이미 놓인 칸

    room.board[idx] = playerNum;

    // 승리 여부 확인
    if (checkWin(room.board, playerNum)) {
      room.gameOver = true;
      io.to(roomCode).emit('board-update', room.board);
      io.to(roomCode).emit('game-over', `플레이어 ${playerNum} 승리!`);
      return;
    }

    // 무승부 체크
    if (room.board.every(cell => cell !== null)) {
      room.gameOver = true;
      io.to(roomCode).emit('board-update', room.board);
      io.to(roomCode).emit('game-over', '무승부입니다!');
      return;
    }

    // 턴 변경
    room.turn = room.turn === 1 ? 2 : 1;
    io.to(roomCode).emit('board-update', room.board);
    io.to(roomCode).emit('turn', room.turn);
  });

  // 채팅 메시지 중계
  socket.on('chat-message', (msg) => {
    const roomCode = findRoomOfSocket(socket.id);
    if (roomCode) {
      socket.to(roomCode).emit('chat-message', msg);
    }
  });

  socket.on('disconnect', () => {
    console.log(`클라이언트 연결 종료: ${socket.id}`);
    const roomCode = findRoomOfSocket(socket.id);
    if (roomCode) {
      const room = rooms[roomCode];
      if (!room) return;

      // 방에서 플레이어 제거
      room.players = room.players.filter(id => id !== socket.id);

      // 상대가 있으면 퇴장 메시지 보내기
      socket.to(roomCode).emit('status', '상대가 나갔습니다.');

      // 방 비었으면 삭제
      if (room.players.length === 0) {
        delete rooms[roomCode];
      }
    }
  });
});

// 승리 체크 함수
function checkWin(board, player) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(line => line.every(idx => board[idx] === player));
}

// 랜덤 방 코드 생성 (영문+숫자 5자리)
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

http.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
