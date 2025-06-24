const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const gameLogics = {
  '3x3': require('./gameLogics/gameLogic3x3'),
  'ai-3x3': require('./gameLogics/gameLogicai3x3'),
  '5x5': require('./gameLogics/gameLogic5x5'),
  'ai-5x5': require('./gameLogics/gameLogicai5x5'),
  'ultimate': require('./gameLogics/ultimate'),
  'ultimate-ai': require('./gameLogics/ultimateai'),
};

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

process.on('uncaughtException', (err) => {
  console.error('처리되지 않은 예외:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('처리되지 않은 Promise 거부:', reason);
});

io.on('connection', (socket) => {
  console.log('유저 접속:', socket.id);

  socket.on('create-room', (mode) => {
    try {
      if (!gameLogics[mode]) {
        socket.emit('error-message', '지원하지 않는 게임 모드입니다.');
        return;
      }

      const code = generateRoomCode();
      rooms[code] = {
        players: [socket.id],
        gameInstance: new gameLogics[mode](),
        matchType: 'manual',
        mode,
      };
      socket.join(code);
      socket.emit('player-number', 1);
      socket.emit('room-code', code);
      socket.emit('room-created', code);

      // AI 모드인 경우 즉시 시작
      if (mode.startsWith('ai')) {
        io.to(code).emit('status', 'AI와 게임을 시작합니다.');
        io.to(code).emit('start-game');
        io.to(code).emit('board-update', rooms[code].gameInstance.board);
        io.to(code).emit('turn', rooms[code].gameInstance.turn);
      }
    } catch (e) {
      console.error('create-room 에러:', e);
      socket.emit('error-message', '방 생성 중 오류 발생');
    }
  });

  socket.on('join-room', (code, mode) => {
    try {
      const room = rooms[code];
      if (!room) {
        socket.emit('error-message', '존재하지 않는 방 코드입니다.');
        return;
      }
      if (room.players.length >= 2) {
        socket.emit('error-message', '방이 가득 찼습니다.');
        return;
      }
      if (room.mode !== mode) {
        socket.emit('error-message', '선택한 모드와 방 모드가 다릅니다.');
        return;
      }
      room.players.push(socket.id);
      socket.join(code);
      socket.emit('player-number', 2);

      io.to(code).emit('status', '두 명이 모여 게임을 시작합니다.');
      io.to(code).emit('start-game');
      io.to(code).emit('board-update', room.gameInstance.board);
      io.to(code).emit('turn', room.gameInstance.turn);
    } catch (e) {
      console.error('join-room 에러:', e);
      socket.emit('error-message', '방 입장 중 오류 발생');
    }
  });

  socket.on('join-random-room', (mode) => {
    try {
      if (!gameLogics[mode]) {
        socket.emit('error-message', '지원하지 않는 게임 모드입니다.');
        return;
      }

      let targetRoom = null;
      for (const code in rooms) {
        const room = rooms[code];
        if (room.matchType === 'random' && room.players.length === 1 && room.mode === mode) {
          targetRoom = code;
          break;
        }
      }

      if (!targetRoom) {
        targetRoom = generateRoomCode();
        rooms[targetRoom] = {
          players: [],
          gameInstance: new gameLogics[mode](),
          matchType: 'random',
          mode,
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
    } catch (e) {
      console.error('join-random-room 에러:', e);
      socket.emit('error-message', '랜덤 방 입장 중 오류 발생');
    }
  });

  socket.on('move', (data) => {
    try {
      const code = findRoomOfSocket(socket.id);
      if (!code) return;
      const room = rooms[code];
      const playerNum = room.players.indexOf(socket.id) + 1;

      let result;
      if (room.mode === 'ultimate' || room.mode === 'ultimate-ai') {
        result = room.gameInstance.move(playerNum, data.boardIndex, data.cellIndex);
      } else {
        result = room.gameInstance.move(playerNum, data.index);
      }

      io.to(code).emit('board-update', room.gameInstance.board);

      if (result === 'win') {
        io.to(code).emit('game-over', { message: `플레이어 ${playerNum} 승리!`, showRematch: true });
        return;
      } else if (result === 'draw') {
        io.to(code).emit('game-over', { message: '무승부입니다.', showRematch: true });
        return;
      } else {
        io.to(code).emit('turn', room.gameInstance.turn);
      }

      // AI 모드 처리
      const isAIMode = room.mode === 'ai-3x3' || room.mode === 'ai-5x5';
      if (isAIMode && room.gameInstance.turn === 2) {
        const aiMove = room.gameInstance.getAIMove();
        const aiResult = room.gameInstance.move(2, aiMove);

        io.to(code).emit('board-update', room.gameInstance.board);

        if (aiResult === 'win') {
          io.to(code).emit('game-over', { message: 'AI 승리!', showRematch: true });
        } else if (aiResult === 'draw') {
          io.to(code).emit('game-over', { message: '무승부입니다.', showRematch: true });
        } else {
          io.to(code).emit('turn', room.gameInstance.turn);
        }
      }
    } catch (e) {
      console.error('move 에러:', e);
      socket.emit('error-message', '이동 처리 중 오류 발생');
    }
  });

  socket.on('chat-message', (msg) => {
    try {
      const code = findRoomOfSocket(socket.id);
      if (!code) return;
      const room = rooms[code];
      const senderIdx = room.players.indexOf(socket.id);
      const senderNum = senderIdx + 1;
      io.to(code).emit('chat-message', { sender: senderNum, message: msg });
    } catch (e) {
      console.error('chat-message 에러:', e);
    }
  });

  socket.on('rematch-request', () => {
    try {
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
    } catch (e) {
      console.error('rematch-request 에러:', e);
    }
  });

  socket.on('leave-room', () => {
    try {
      const code = findRoomOfSocket(socket.id);
      if (!code) return;
      const room = rooms[code];
      room.players = room.players.filter(id => id !== socket.id);

      if (room.players.length === 0) {
        delete rooms[code];  // 방 완전 삭제
      } else if (room.players.length === 1) {
        room.gameInstance.reset();  // 게임 상태 초기화
        const remainingPlayer = room.players[0];
        io.to(remainingPlayer).emit('status', '상대방이 나갔습니다.');
        io.to(remainingPlayer).emit('game-over', { message: '상대방이 나가 게임이 종료되었습니다.', showRematch: false });
      }
    } catch (e) {
      console.error('leave-room 에러:', e);
    }
  });

  socket.on('disconnect', () => {
    try {
      const code = findRoomOfSocket(socket.id);
      if (!code) return;
      const room = rooms[code];
      room.players = room.players.filter(id => id !== socket.id);

      if (room.players.length === 0) {
        delete rooms[code];  // 방 완전 삭제
      } else if (room.players.length === 1) {
        room.gameInstance.reset();  // 게임 상태 초기화
        const remainingPlayer = room.players[0];
        io.to(remainingPlayer).emit('status', '상대방이 나갔습니다.');
        io.to(remainingPlayer).emit('game-over', { message: '상대방이 나가 게임이 종료되었습니다.', showRematch: false });
      }
    } catch (e) {
      console.error('disconnect 에러:', e);
    }
  });
});

http.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
