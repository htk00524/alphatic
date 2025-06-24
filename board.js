// game/board.js

class SmallBoard {
  constructor() {
    this.cells = Array(9).fill(null); // 3x3 보드
    this.winner = null;
  }

  makeMove(index, player) {
    if (!this.cells[index]) {
      this.cells[index] = player;
      this.checkWinner();
      return true;
    }
    return false;
  }

  checkWinner() {
    const winLines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (let line of winLines) {
      const [a, b, c] = line;
      if (this.cells[a] && this.cells[a] === this.cells[b] && this.cells[b] === this.cells[c]) {
        this.winner = this.cells[a];
        return;
      }
    }

    if (this.cells.every(cell => cell !== null)) {
      this.winner = "draw";
    }
  }
}

class UltimateBoard {
  constructor() {
    this.boards = Array(9).fill().map(() => new SmallBoard());
    this.currentPlayer = 'X';
    this.activeBoardIndex = null; // null이면 아무 소보드에 둬도 됨
    this.winner = null;
  }

  makeMove(boardIndex, cellIndex) {
    if (this.winner) return false; // 게임 끝났으면 못둬

    const board = this.boards[boardIndex];

    // 유효한 보드인지 확인
    if (
      this.activeBoardIndex !== null &&
      boardIndex !== this.activeBoardIndex &&
      !this.boards[this.activeBoardIndex].winner
    ) return false;

    if (board.makeMove(cellIndex, this.currentPlayer)) {
      this.activeBoardIndex = this.boards[cellIndex].winner ? null : cellIndex; // 다음 보드 갱신
      this.checkUltimateWinner();
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      return true;
    }

    return false;
  }

  checkUltimateWinner() {
    const winners = this.boards.map(b => b.winner && b.winner !== 'draw' ? b.winner : null);
    const winLines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];

    for (let line of winLines) {
      const [a, b, c] = line;
      if (winners[a] && winners[a] === winners[b] && winners[b] === winners[c]) {
        this.winner = winners[a];
        return;
      }
    }

    if (this.boards.every(b => b.winner)) {
      this.winner = "draw";
    }
  }
}

module.exports = { UltimateBoard };
