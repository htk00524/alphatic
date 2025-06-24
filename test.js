// test.js
const { UltimateBoard } = require('./game/board');
const { getRandomMove, getNormalMove } = require('./game/ai');
const prompt = require('prompt-sync')({ sigint: true });

// 🔧 AI 난이도 설정: 'easy' 또는 'normal'
const AI_DIFFICULTY = 'normal';

const game = new UltimateBoard();

function printUltimateBoard(board) {
  console.clear();
  console.log("======= Ultimate Tic Tac Toe =======");
  for (let row = 0; row < 3; row++) {
    let rows = ["", "", ""];
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col;
      const sb = board.boards[idx];
      for (let r = 0; r < 3; r++) {
        rows[r] += (sb.cells.slice(r * 3, r * 3 + 3).map(c => c || '.').join(' ') + "   ");
      }
    }
    console.log(rows.join('\n'));
    console.log('');
  }

  if (board.winner) {
    console.log(`🎉 Winner: ${board.winner}`);
  } else {
    console.log(`Next player: ${board.currentPlayer}`);
    console.log(`Active Board: ${board.activeBoardIndex !== null ? board.activeBoardIndex : "Any"}`);
  }
}

while (!game.winner) {
  printUltimateBoard(game);

  if (game.currentPlayer === 'X') {
    let b = prompt("Your Move - Board (0~8): ");
    let c = prompt("Your Move - Cell (0~8): ");
    const boardIndex = parseInt(b);
    const cellIndex = parseInt(c);
    const result = game.makeMove(boardIndex, cellIndex);
    if (!result) {
      console.log("❌ Invalid move! Try again.");
      prompt("Press Enter...");
    }
  } else {
    console.log("🤖 AI is thinking...");
    let move;
    if (AI_DIFFICULTY === 'easy') {
      move = getRandomMove(game);
    } else if (AI_DIFFICULTY === 'normal') {
      move = getNormalMove(game);
    }else if (AI_DIFFICULTY === 'hard') {
      move = getBestMove(game);
    }
    game.makeMove(move.boardIndex, move.cellIndex);
  }
}

printUltimateBoard(game);
