// gameLogicAI5x5.js

const { getAIMove } = require('./ai'); // AI 로직 함수

class GameLogicAI5x5 {
  constructor(difficulty = 'medium') {
    this.SIZE = 5;
    this.WIN_COUNT = 5;
    this.board = Array(this.SIZE * this.SIZE).fill(0);
    this.turn = 1;  // 1: 사람, 2: AI
    this.gameOver = false;
    this.difficulty = difficulty;
  }

  move(player, index) {
    if (this.gameOver) return false;
    if (this.turn !== player) return false;
    if (index < 0 || index >= this.board.length) return false;
    if (this.board[index] !== 0) return false;

    this.board[index] = player;

    if (this.checkWinner(player)) {
      this.gameOver = true;
      return 'win';
    }
    if (this.board.every(cell => cell !== 0)) {
      this.gameOver = true;
      return 'draw';
    }

    this.turn = this.turn === 1 ? 2 : 1;
    return 'continue';
  }

  checkWinner(p) {
    const b = this.board;
    const SIZE = this.SIZE;
    const WIN_COUNT = this.WIN_COUNT;

    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (
          this.checkLine(b, row, col, 0, 1, p) ||
          this.checkLine(b, row, col, 1, 0, p) ||
          this.checkLine(b, row, col, 1, 1, p) ||
          this.checkLine(b, row, col, 1, -1, p)
        ) return true;
      }
    }
    return false;
  }

  checkLine(b, row, col, dRow, dCol, p) {
    for (let i = 0; i < this.WIN_COUNT; i++) {
      let r = row + i * dRow;
      let c = col + i * dCol;
      if (r < 0 || c < 0 || r >= this.SIZE || c >= this.SIZE || b[r * this.SIZE + c] !== p) return false;
    }
    return true;
  }

  reset() {
    this.board.fill(0);
    this.turn = 1;
    this.gameOver = false;
  }

  getAIMove() {
    if (this.gameOver) return null;

    // AI는 2번 플레이어 (O)로 가정
    // AI 함수에 맞게 board 상태 변환 (0 → "", 1 → "X", 2 → "O")
    const convertedBoard = this.board.map(cell => {
      if (cell === 0) return "";
      if (cell === 1) return "X";
      if (cell === 2) return "O";
    });

    return getAIMove(convertedBoard, this.difficulty, "5x5");
  }
}

module.exports = GameLogicAI5x5;
