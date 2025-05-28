// server.js
const express = require('express');
const path = require('path');
const {
  createBoard,
  makeMove,
  getBestMove,
  checkWinner,
  isDraw
} = require('./game');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

let board = createBoard();

app.post('/move', (req, res) => {
  const { row, col } = req.body;

  // 1. 사람 수 두기
  if (!makeMove(board, row, col, 'X')) {
    return res.json({ error: 'Invalid move' });
  }

  // 2. 승패 확인
  const winnerAfterPlayer = checkWinner(board);
  if (winnerAfterPlayer) {
    return res.json({ board, winner: winnerAfterPlayer });
  }

  if (isDraw(board)) {
    return res.json({ board, winner: 'draw' });
  }

  // 3. AI 수 두기
  const best = getBestMove(board);
  if (best) {
    makeMove(board, best.row, best.col, 'O');
  }

  const winnerAfterAI = checkWinner(board);
  if (winnerAfterAI) {
    return res.json({ board, winner: winnerAfterAI });
  }

  if (isDraw(board)) {
    return res.json({ board, winner: 'draw' });
  }

  res.json({ board, winner: null });
});

app.post('/reset', (req, res) => {
  board = createBoard();
  res.json({ board });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
