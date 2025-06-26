function getAIMove(board, difficulty, mode) {
  const SIZE = mode === "5x5" ? 5 : 3;
  const WIN_COUNT = SIZE;
  const ai = "O";
  const player = "X";

  const MAX_DEPTH = mode === "5x5" ? 3 : 10; // ★ 깊이 제한

  const checkWinner = (b, p) => {
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (
          checkLine(b, row, col, 0, 1, p) ||
          checkLine(b, row, col, 1, 0, p) ||
          checkLine(b, row, col, 1, 1, p) ||
          checkLine(b, row, col, 1, -1, p)
        ) return true;
      }
    }
    return false;
  };

  const checkLine = (b, row, col, dRow, dCol, p) => {
    for (let i = 0; i < WIN_COUNT; i++) {
      let r = row + i * dRow;
      let c = col + i * dCol;
      if (r < 0 || c < 0 || r >= SIZE || c >= SIZE || b[r * SIZE + c] !== p) return false;
    }
    return true;
  };

  const isDraw = (b) => b.every(cell => cell !== "");

  const getRandomMove = () => {
    const available = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
    return available[Math.floor(Math.random() * available.length)];
  };

  function evaluate(b) {
    let score = 0;
    score += countLines(b, ai) * 10;
    score -= countLines(b, player) * 10;
    return score;
  }

  function countLines(b, p) {
    let count = 0;
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        const directions = [
          [0, 1], [1, 0], [1, 1], [1, -1]
        ];
        directions.forEach(([dRow, dCol]) => {
          let matches = 0;
          let blocked = false;
          for (let i = 0; i < WIN_COUNT; i++) {
            let r = row + i * dRow;
            let c = col + i * dCol;
            if (r < 0 || c < 0 || r >= SIZE || c >= SIZE) {
              blocked = true;
              break;
            }
            const cell = b[r * SIZE + c];
            if (cell === p) matches++;
            else if (cell !== "") blocked = true;
          }
          if (!blocked && matches > 0) count++;
        });
      }
    }
    return count;
  }

  const minimax = (b, depth, isMax) => {
    if (checkWinner(b, ai)) return 1000 - depth;
    if (checkWinner(b, player)) return -1000 + depth;
    if (isDraw(b) || depth >= MAX_DEPTH) return evaluate(b);

    if (isMax) {
      let maxEval = -Infinity;
      b.forEach((cell, i) => {
        if (cell === "") {
          b[i] = ai;
          let eval = minimax(b, depth + 1, false);
          b[i] = "";
          maxEval = Math.max(maxEval, eval);
        }
      });
      return maxEval;
    } else {
      let minEval = Infinity;
      b.forEach((cell, i) => {
        if (cell === "") {
          b[i] = player;
          let eval = minimax(b, depth + 1, true);
          b[i] = "";
          minEval = Math.min(minEval, eval);
        }
      });
      return minEval;
    }
  };

  const getBestMove = () => {
    let bestScore = -Infinity;
    let move = null;
    board.forEach((cell, i) => {
      if (cell === "") {
        board[i] = ai;
        let score = minimax(board, 0, false);
        board[i] = "";
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    });
    return move;
  };

  if (difficulty === "easy") return getRandomMove();
  if (difficulty === "medium") return Math.random() < 0.5 ? getRandomMove() : getBestMove();
  return getBestMove();
}

module.exports = { getAIMove };
