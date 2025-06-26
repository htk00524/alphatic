class TicTacToe3x3 {
  constructor() {
    this.boardSize = 3;
    this.board = Array(9).fill(null);
    this.turn = 1;
    this.gameOver = false;
  }

  move(playerNum, index) {
    if (this.gameOver) return false;
    if (this.turn !== playerNum) return false;
    if (index < 0 || index >= this.board.length) return false;
    if (this.board[index] !== null) return false;

    this.board[index] = playerNum;

    if (this.checkWin(playerNum)) {
      this.gameOver = true;
      return 'win';
    }
    if (this.board.every(cell => cell !== null)) {
      this.gameOver = true;
      return 'draw';
    }

    this.turn = 3 - playerNum;
    return 'continue';
  }

  checkWin(playerNum) {
    const b = this.board;
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6],
    ];
    return lines.some(line => line.every(idx => b[idx] === playerNum));
  }

  reset() {
    this.board.fill(null);
    this.turn = 1;
    this.gameOver = false;
  }
}

module.exports = TicTacToe3x3;
