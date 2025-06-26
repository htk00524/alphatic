class GameLogic5x5 {
  constructor() {
    this.SIZE = 5;
    this.WIN_COUNT = 5;
    this.board = Array(this.SIZE * this.SIZE).fill(0);
    this.turn = 1;
    this.gameOver = false;
  }

  move(player, index) {
    if (this.gameOver) return false;
    if (this.turn !== player) return false;
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
}

module.exports = GameLogic5x5;
