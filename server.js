const express = require('express');
const path = require('path');
const { UltimateBoard } = require('./game/board');
const { getRandomMove, getNormalMove, getBestMove } = require('./game/ai');

const app = express();
const port = 3000;

let board = new UltimateBoard();
let difficulty = 'normal'; // default

app.use(express.static('public'));
app.use(express.json());

// 게임 초기화
app.post('/reset', (req, res) => {
  board = new UltimateBoard();
  res.json({ status: 'reset' });
});

// 현재 보드 상태 반환
app.get('/status', (req, res) => {
  res.json({
    board,
    winner: board.winner,
  });
});

// 플레이어가 둔 수 처리 및 AI 수 둠
app.post('/move', (req, res) => {
  const { boardIndex, cellIndex } = req.body;
  const result = board.makeMove(boardIndex, cellIndex);
  if (!result) {
    return res.status(400).json({ error: 'Invalid move' });
  }

  if (board.winner) {
    return res.json({ board, winner: board.winner });
  }

  // AI 차례
  let move;
  if (difficulty === 'easy') {
    move = getRandomMove(board);
  } else if (difficulty === 'normal') {
    move = getNormalMove(board);
  } else {
    move = getBestMove(board);
  }

  board.makeMove(move.boardIndex, move.cellIndex);

  res.json({
    board,
    aiMove: move,
    winner: board.winner,
  });
});

// 난이도 설정
app.post('/difficulty', (req, res) => {
  const { level } = req.body;
  if (['easy', 'normal', 'hard'].includes(level)) {
    difficulty = level;
    return res.json({ difficulty });
  }
  res.status(400).json({ error: 'Invalid difficulty' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
