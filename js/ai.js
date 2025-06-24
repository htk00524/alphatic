// AI 로직을 담당하는 모듈
const PLAYER = 0;
const AI = 1;

const winCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// Minimax 알고리즘으로 최적의 수 찾기
export function getBestMove(board) {
  let bestVal = -Infinity;
  let bestMove = null;

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = AI;
      let moveVal = minimax(board, 0, false);
      board[i] = null;

      if (moveVal > bestVal) {
        bestVal = moveVal;
        bestMove = i;
      }
    }
  }

  return bestMove;
}

// Minimax 알고리즘 구현
function minimax(board, depth, isMaximizing) {
  const score = evaluate(board);
  
  // 게임이 끝났다면 점수 반환
  if (score === 10 || score === -10) return score;
  if (board.every(cell => cell !== null)) return 0; // 무승부

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = AI;
        best = Math.max(best, minimax(board, depth + 1, false));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = PLAYER;
        best = Math.min(best, minimax(board, depth + 1, true));
        board[i] = null;
      }
    }
    return best;
  }
}

// 보드 상태 평가
function evaluate(board) {
  for (let combo of winCombos) {
    const [a, b, c] = combo;
    if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) {
      return board[a] === AI ? 10 : -10;
    }
  }
  return 0;
}

// 승리 체크
export function checkWin(board, player) {
  return winCombos.some(combo => combo.every(i => board[i] === player));
}

// 무승부 체크
export function checkDraw(board) {
  return board.every(cell => cell !== null);
}

// 플레이어 상수 내보내기
export { PLAYER, AI };