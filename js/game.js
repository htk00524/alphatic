// 게임 로직과 UI를 담당하는 메인 모듈
import { getBestMove, checkWin, checkDraw, PLAYER, AI } from './ai.js';

// 게임 상태 변수들
let board = Array(9).fill(null);
let gameOver = false;
let scores = { player: 0, ai: 0, draws: 0 };

// 색상 설정 (CSS 변수를 통해 커스터마이징 가능)
let gameColors = {
  playerColor: '#4CAF50',  // 기본 녹색
  aiColor: '#F44336'       // 기본 빨간색
};

// DOM 요소들
const boardElem = document.getElementById('board');
const statusElem = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const playerWinsElem = document.getElementById('playerWins');
const aiWinsElem = document.getElementById('aiWins');
const drawsElem = document.getElementById('draws');

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", () => {
  const nickname = localStorage.getItem("nickname") || "게스트";
  const nicknameElem = document.getElementById("userNickname");
  if (nicknameElem) nicknameElem.textContent = nickname;

  // CSS 변수에서 색상 읽어오기
  updateColorsFromCSS();
  
  initGame();
  updateScoreDisplay();
});

// CSS 변수에서 현재 색상 설정 읽어오기
function updateColorsFromCSS() {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  
  gameColors.playerColor = style.getPropertyValue('--player-color').trim() || '#4CAF50';
  gameColors.aiColor = style.getPropertyValue('--ai-color').trim() || '#F44336';
}

// 색상 테마 변경 함수 (외부에서 호출 가능)
window.changeGameTheme = function(theme) {
  const body = document.body;
  
  // 기존 테마 클래스 제거
  body.classList.remove('theme-blue', 'theme-purple', 'theme-dark');
  
  // 새 테마 적용
  if (theme !== 'default') {
    body.classList.add(`theme-${theme}`);
  }
  
  // 색상 업데이트
  updateColorsFromCSS();
  
  // 보드 다시 렌더링
  render();
};

// 커스텀 색상 설정 함수
window.setCustomColors = function(playerColor, aiColor) {
  const root = document.documentElement;
  root.style.setProperty('--player-color', playerColor);
  root.style.setProperty('--ai-color', aiColor);
  
  updateColorsFromCSS();
  render();
};

// 게임 초기화
function initGame() {
  createBoard();
  resetGame();
}

// 보드 생성 (배경에 격자가 있으므로 투명한 캔버스만 생성)
function createBoard() {
  boardElem.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const canvas = document.createElement('canvas');
    canvas.dataset.index = i;
    canvas.width = 120;
    canvas.height = 120;
    canvas.className = 'game-cell';
    canvas.addEventListener('click', () => playerMove(i));
    boardElem.appendChild(canvas);
  }
}

// 캔버스에 O 그리기 (커스터마이징 가능한 색상)
function drawCircle(ctx, size) {
  const center = size / 2;
  const radius = size * 0.35;
  
  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = gameColors.playerColor;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  
  // 부드러운 원 그리기
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.stroke();
  
  // 내부 하이라이트 효과
  ctx.strokeStyle = gameColors.playerColor + '80'; // 투명도 추가
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(center, center, radius * 0.7, 0, Math.PI * 2);
  ctx.stroke();
}

// 캔버스에 X 그리기 (커스터마이징 가능한 색상)
function drawCross(ctx, size) {
  const margin = size * 0.2;
  
  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = gameColors.aiColor;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  
  // X 그리기
  ctx.beginPath();
  ctx.moveTo(margin, margin);
  ctx.lineTo(size - margin, size - margin);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(size - margin, margin);
  ctx.lineTo(margin, size - margin);
  ctx.stroke();
  
  // 내부 하이라이트 효과
  ctx.strokeStyle = gameColors.aiColor + '80'; // 투명도 추가
  ctx.lineWidth = 4;
  
  ctx.beginPath();
  ctx.moveTo(margin + 10, margin + 10);
  ctx.lineTo(size - margin - 10, size - margin - 10);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(size - margin - 10, margin + 10);
  ctx.lineTo(margin + 10, size - margin - 10);
  ctx.stroke();
}

// 보드 렌더링
function render() {
  const canvases = boardElem.querySelectorAll('canvas');
  canvases.forEach((canvas, idx) => {
    const ctx = canvas.getContext('2d');
    
    if (board[idx] === PLAYER) {
      drawCircle(ctx, 120);
    } else if (board[idx] === AI) {
      drawCross(ctx, 120);
    } else {
      ctx.clearRect(0, 0, 120, 120);
    }
  });
}

// 플레이어 움직임
function playerMove(idx) {
  if (gameOver || board[idx] !== null) return;
  
  board[idx] = PLAYER;
  render();
  
  if (checkWin(board, PLAYER)) {
    updateStatus('🎉 당신 승리!');
    gameOver = true;
    scores.player++;
    updateScoreDisplay();
    return;
  }
  
  if (checkDraw(board)) {
    updateStatus('🤝 무승부!');
    gameOver = true;
    scores.draws++;
    updateScoreDisplay();
    return;
  }
  
  updateStatus('🤖 AI 차례...');
  setTimeout(aiMove, 800);
}

// AI 움직임
function aiMove() {
  if (gameOver) return;
  
  const bestMove = getBestMove(board);
  if (bestMove !== null) {
    board[bestMove] = AI;
    render();
    
    if (checkWin(board, AI)) {
      updateStatus('🤖 AI 승리!');
      gameOver = true;
      scores.ai++;
      updateScoreDisplay();
      return;
    }
    
    if (checkDraw(board)) {
      updateStatus('🤝 무승부!');
      gameOver = true;
      scores.draws++;
      updateScoreDisplay();
      return;
    }
    
    updateStatus('● 당신 차례');
  }
}

// 상태 업데이트
function updateStatus(text) {
  statusElem.textContent = text;
}

// 점수 표시 업데이트
function updateScoreDisplay() {
  playerWinsElem.textContent = scores.player;
  aiWinsElem.textContent = scores.ai;
  drawsElem.textContent = scores.draws;
}

// 게임 리셋
function resetGame() {
  board = Array(9).fill(null);
  gameOver = false;
  updateStatus('● 당신 차례');
  render();
}

// 리셋 버튼 이벤트
resetBtn.addEventListener('click', () => {
  resetGame();
});

// 전역 함수로 점수 리셋 기능 제공
window.resetScores = function() {
  scores = { player: 0, ai: 0, draws: 0 };
  updateScoreDisplay();
};