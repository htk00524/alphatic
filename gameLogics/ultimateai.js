// game/ai.js

function getAvailableMoves(board) {
  const moves = [];
  const active = board.activeBoardIndex;

  for (let b = 0; b < 9; b++) {
    const sb = board.boards[b];
    if (active !== null && b !== active) continue;
    if (sb.winner) continue;

    for (let i = 0; i < 9; i++) {
      if (!sb.cells[i]) {
        moves.push({ boardIndex: b, cellIndex: i });
      }
    }
  }

  return moves;
}

function getRandomMove(board) {
  const moves = getAvailableMoves(board);
  return moves[Math.floor(Math.random() * moves.length)];
}

function findWinningMove(sb, player) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a, b, c] of lines) {
    const line = [sb.cells[a], sb.cells[b], sb.cells[c]];
    const counts = line.filter(cell => cell === player).length;
    const emptyIndex = [a, b, c].find(i => !sb.cells[i]);
    if (counts === 2 && emptyIndex !== undefined) {
      return emptyIndex;
    }
  }
  return null;
}

function getNormalMove(board, aiPlayer = 'O') {
  const humanPlayer = aiPlayer === 'O' ? 'X' : 'O';
  const moves = getAvailableMoves(board);

  for (const move of moves) {
    const sb = board.boards[move.boardIndex];
    const winIdx = findWinningMove(sb, aiPlayer);
    if (winIdx !== null) {
      return { boardIndex: move.boardIndex, cellIndex: winIdx };
    }
  }

  for (const move of moves) {
    const sb = board.boards[move.boardIndex];
    const blockIdx = findWinningMove(sb, humanPlayer);
    if (blockIdx !== null) {
      return { boardIndex: move.boardIndex, cellIndex: blockIdx };
    }
  }

  return getRandomMove(board);
}

function evaluateBoard(board, aiPlayer) {
  if (board.winner === aiPlayer) return 100;
  if (board.winner && board.winner !== 'draw') return -100;
  return 0;
}

function minimax(board, depth, isMax, alpha, beta, aiPlayer, maxDepth) {
  const score = evaluateBoard(board, aiPlayer);
  if (depth >= maxDepth || board.winner) {
    return score;
  }

  const moves = getAvailableMoves(board);
  let best = isMax ? -Infinity : Infinity;

  for (const move of moves) {
    // 가상으로 둠
    const temp = boardCopy(board);
    temp.makeMove(move.boardIndex, move.cellIndex);

    const val = minimax(temp, depth + 1, !isMax, alpha, beta, aiPlayer, maxDepth);

    if (isMax) {
      best = Math.max(best, val);
      alpha = Math.max(alpha, best);
    } else {
      best = Math.min(best, val);
      beta = Math.min(beta, best);
    }

    if (beta <= alpha) break; // 가지치기
  }

  return best;
}

function boardCopy(originalBoard) {
  const { UltimateBoard } = require('./ultimate');
  const newBoard = new UltimateBoard();

  newBoard.currentPlayer = originalBoard.currentPlayer;
  newBoard.activeBoardIndex = originalBoard.activeBoardIndex;
  newBoard.winner = originalBoard.winner;

  for (let i = 0; i < 9; i++) {
    newBoard.boards[i].cells = [...originalBoard.boards[i].cells];
    newBoard.boards[i].winner = originalBoard.boards[i].winner;
  }

  return newBoard;
}

function getBestMove(board, aiPlayer = 'O') {
  const maxDepth = 3; // 너무 깊게 하면 느려짐
  const moves = getAvailableMoves(board);

  let bestScore = -Infinity;
  let bestMove = null;

  for (const move of moves) {
    const temp = boardCopy(board);
    temp.makeMove(move.boardIndex, move.cellIndex);

    const score = minimax(temp, 1, false, -Infinity, Infinity, aiPlayer, maxDepth);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove || getRandomMove(board);
}

module.exports = {
  getRandomMove,
  getNormalMove,
  getBestMove,
  getAvailableMoves,
};