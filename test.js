const {
  createBoard,
  makeMove,
  getBestMove,
  checkWinner,
  printBoard
} = require('./game');

const board = createBoard();

// 사람이 두는 수
makeMove(board, 0, 0, 'X');
makeMove(board, 1, 1, 'X');

// AI가 수를 둠
const aiMove = getBestMove(board);
makeMove(board, aiMove.row, aiMove.col, 'O');

printBoard(board);

const winner = checkWinner(board);
console.log('Winner:', winner ?? '아직 없음');
