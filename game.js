// game.js

// 1. 보드 생성
function createBoard() {
  return [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ];
}

// 2. 수 두기
function makeMove(board, row, col, player) {
  if (board[row][col] === '') {
    board[row][col] = player;
    return true;
  }
  return false;
}

// 3. 승자 판정
function checkWinner(board) {
  const lines = [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]]
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (
      board[a[0]][a[1]] !== '' &&
      board[a[0]][a[1]] === board[b[0]][b[1]] &&
      board[a[0]][a[1]] === board[c[0]][c[1]]
    ) {
      return board[a[0]][a[1]];
    }
  }

  return null;
}

// 4. 무승부 판정
function isDraw(board) {
  return board.flat().every(cell => cell !== '') && !checkWinner(board);
}

// 5. 보드 출력 (디버깅용)
function printBoard(board) {
  console.log('\n' + board.map(row => row.join(' | ')).join('\n---------\n') + '\n');
}

// 6. 평가 함수: AI(O) +10, 사람(X) -10
function evaluate(board) {
  const winner = checkWinner(board);
  if (winner === 'O') return 10;
  if (winner === 'X') return -10;
  return 0;
}

// 7. Minimax 알고리즘
function minimax(board, depth, isMaximizing) {
  const score = evaluate(board);

  if (score === 10 || score === -10) return score;
  if (isDraw(board)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === '') {
          board[i][j] = 'O'; // AI의 수
          best = Math.max(best, minimax(board, depth + 1, false));
          board[i][j] = ''; // 백트래킹
        }
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === '') {
          board[i][j] = 'X'; // 사람 수
          best = Math.min(best, minimax(board, depth + 1, true));
          board[i][j] = '';
        }
      }
    }
    return best;
  }
}

// 8. 최적 수 찾기 (AI 차례일 때 호출)
function getBestMove(board) {
  let bestVal = -Infinity;
  let bestMove = null;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === '') {
        board[i][j] = 'O'; // AI 수 둬보기
        let moveVal = minimax(board, 0, false);
        board[i][j] = '';

        if (moveVal > bestVal) {
          bestVal = moveVal;
          bestMove = { row: i, col: j };
        }
      }
    }
  }

  return bestMove;
}

// 9. 모듈 export
module.exports = {
  createBoard,
  makeMove,
  checkWinner,
  isDraw,
  getBestMove,
  printBoard
};
