// gameLogicAI3x3.js

const { getAIMove } = require('./ai'); // AI 의사결정 함수

class TicTacToeAI3x3 {
  constructor(difficulty = 'medium') {
    this.boardSize = 3;
    this.board = Array(9).fill(null);
    this.turn = 1;      // 1: 사람, 2: AI
    this.gameOver = false;
    this.difficulty = difficulty;
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

  getAIMove() {
    if (this.gameOver) return null;

    // AI는 2번 플레이어 (O)라고 가정
    // AI 함수에 맞게 board 상태 변환 (null → "", 1 → "X", 2 → "O")
    const convertedBoard = this.board.map(cell => {
      if (cell === null) return "";
      if (cell === 1) return "X";
      if (cell === 2) return "O";
    });

    return getAIMove(convertedBoard, this.difficulty, "3x3");
  }
}

module.exports = TicTacToeAI3x3;
