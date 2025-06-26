const socket = io();

document.addEventListener("DOMContentLoaded", () => {
  // DOM 요소들
  const boardElem = document.getElementById('board');
  const resetBtn = document.getElementById('resetBtn');
  const statusElem = document.getElementById('status');

  // AI 대전 모달 관련 요소 가져오기
  const btnAI = document.getElementById('btn-ai');
  const modalAI = document.getElementById('modal-ai');
  const modalOverlay = document.getElementById('modal-overlay'); // 모달 배경(div)
  const btnStartAI = document.getElementById('btn-start-ai');
  const btnCancelAI = document.getElementById('btn-cancel-ai');

  const btnModeSelect = document.getElementById("btn-mode-select");
  const modeOptions = document.getElementById("mode-options");
  const btnDifficultySelect = document.getElementById("btn-difficulty-select");
  const difficultyOptions = document.getElementById("difficulty-options");


  let selectedMode = null;
  let selectedDifficulty = null;

  btnAI?.addEventListener('click', () => {
    // AI 대전 모달 열기
    modalAI?.classList.add('show');      // 또는 hidden 클래스 조절
    modalOverlay?.classList.add('show');
    btnStartAI.disabled = true;

    // 초기화: 선택 해제
    selectedMode = null;
    selectedDifficulty = null;
    document.querySelectorAll('.mode-option').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.difficulty-option').forEach(b => b.classList.remove('selected'));
  });

  btnCancelAI?.addEventListener('click', () => {
    modalAI?.classList.remove('show');
    modalOverlay?.classList.remove('show');
  });
  modalOverlay?.addEventListener('click', () => {
    modalAI?.classList.remove('show');
    modalOverlay?.classList.remove('show'); 
  });

  // 모드 선택 버튼 이벤트
  document.querySelectorAll('.mode-option').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedMode = btn.getAttribute('data-mode');
      document.querySelectorAll('.mode-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      checkEnableStart();
    });
  });

  // 난이도 선택 버튼 이벤트
  document.querySelectorAll('.difficulty-option').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedDifficulty = btn.getAttribute('data-difficulty');
      document.querySelectorAll('.difficulty-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      checkEnableStart();
    });
  });

  function checkEnableStart() {
    btnStartAI.disabled = !(selectedMode && selectedDifficulty);
  }

  btnStartAI?.addEventListener('click', () => {
    if (!selectedMode || !selectedDifficulty) return;

    modalAI?.classList.remove('show');
    modalOverlay?.classList.remove('show');

    // 서버에 AI 대전 모드 생성 요청 보내기
    // socket 객체는 기존에 선언되어 있어야 함
    socket.emit('create-room', selectedMode);

    // 현재 모드도 업데이트
    currentMode = selectedMode;

    resetGameUI();  // 기존 함수 있으면 호출 (없으면 따로 UI 초기화)

    updateButtons(); // 기존 함수 있으면 호출
  });
  btnModeSelect.addEventListener("click", () => {
    modeOptions.classList.toggle("hidden");
    difficultyOptions.classList.add("hidden");  // 난이도 드롭다운 닫기
  });

  // 난이도 드롭다운 토글
  btnDifficultySelect.addEventListener("click", () => {
    difficultyOptions.classList.toggle("hidden");
    modeOptions.classList.add("hidden");  // 모드 드롭다운 닫기
  });

  // 모드 옵션 선택
  modeOptions.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedMode = btn.dataset.mode;
      btnModeSelect.textContent = btn.textContent + " ▼";
      modeOptions.classList.add("hidden");
      checkStartReady();
    });
  });

  // 난이도 옵션 선택
  difficultyOptions.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedDifficulty = btn.dataset.difficulty;
      btnDifficultySelect.textContent = btn.textContent + " ▼";
      difficultyOptions.classList.add("hidden");
      checkStartReady();
    });
  });

  // 시작 버튼 활성화 체크
  function checkStartReady() {
    if (selectedMode && selectedDifficulty) {
      btnStartAI.disabled = false;
    } else {
      btnStartAI.disabled = true;
    }
  }

  // 시작 버튼 클릭 시 처리
  btnStartAI.addEventListener("click", () => {
    // 예: 로컬스토리지에 저장 후 게임 페이지 이동
    localStorage.setItem("selectedMode", selectedMode);
    localStorage.setItem("selectedDifficulty", selectedDifficulty);
    location.href = "/game";
  });

  // 버튼 이벤트 등록
  document.getElementById("btn-ai")?.addEventListener("click", () => {
    document.getElementById("modal-ai")?.classList.add("hidden");
    electedMode = null;
    selectedDifficulty = null;
    btnModeSelect.textContent = "모드 선택 ▼";
    btnDifficultySelect.textContent = "난이도 선택 ▼";
    btnStartAI.disabled = true;
    modeOptions.classList.add("hidden");
    difficultyOptions.classList.add("hidden");
  });

  document.querySelectorAll(".select-mode-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    const mode = e.target.dataset.mode;
    // 모달 숨기기
    document.getElementById("modal-ai").classList.remove("show");
    
    // 선택한 모드에 따라 게임 시작 처리 (예: 로컬스토리지에 저장하고 게임 페이지로 이동)
    localStorage.setItem("selectedMode", mode);
    location.href = "/game";
    });
  });

  document.querySelectorAll(".close-modal").forEach(btn => {
    btn.addEventListener("click", () => {
    document.getElementById("modal-create")?.classList.remove("show");
    document.getElementById("modal-ai")?.classList.remove("show");

    });
  });
  document.getElementById("btn-random")?.addEventListener("click", () => {
    alert("랜덤 입장 로직 필요 (서버와 연결 예정)");
  });

  document.getElementById("btn-create")?.addEventListener("click", () => {
    document.getElementById("modal-create")?.classList.add("show");
  });

  document.getElementById("btn-close")?.addEventListener("click", () => {
    document.getElementById("modal")?.classList.remove("show");
  });

  document.getElementById("btn-create-room")?.addEventListener("click", () => {
    const code = document.getElementById("room-code")?.value.trim();
    const key = document.getElementById("room-key")?.value.trim();
    if (name && key) {
      alert(`방 생성 요청: ${key}`);
    } else {
      alert("코드를 입력해주세요.");
    }
  });

  document.getElementById("btn-input-code")?.addEventListener("click", () => {
    document.getElementById("code-modal")?.classList.add("show");
  });

  document.getElementById("btn-close-code")?.addEventListener("click", () => {
    document.getElementById("code-modal")?.classList.remove("show");
  });

  document.getElementById("btn-join-room")?.addEventListener("click", () => {
    const code = document.getElementById("room-code")?.value.trim();
    if (code) {
      alert("입장 코드: " + code);
    } else {
      alert("입장 코드를 입력해주세요.");
    }

  

});

  // 보드 클릭 이벤트
  boardElem?.addEventListener('click', e => {
    const idx = e.target.closest('canvas')?.dataset.index;
    if (idx !== undefined) playerMove(Number(idx));
  });

  // 리셋 버튼 이벤트
  resetBtn?.addEventListener('click', resetGame);

  // 게임 상태 업데이트 함수
  function updateStatus(text) {
    if (statusElem) statusElem.textContent = text;
  }

  // 게임판 상태 및 변수
  let board = Array(9).fill(null);
  let gameOver = false;
  const PLAYER = 1;  // 예시 플레이어 숫자
  const AI = 2;      // AI 숫자

  // 승리 조합 예시 (틱택토 3x3)
  const winCombos = [
    [0,1,2],[3,4,5],[6,7,8], // 가로
    [0,3,6],[1,4,7],[2,5,8], // 세로
    [0,4,8],[2,4,6]          // 대각선
  ];

  // 플레이어 수 움직임 처리
  function playerMove(idx) {
    if (gameOver || board[idx] !== null) return;
    board[idx] = PLAYER;
    render();

    if (checkWin(PLAYER)) return endGame('● 당신 승리!');
    if (checkDraw()) return endGame('무승부!');

    updateStatus('✕ AI 차례...');
    setTimeout(aiMove, 600);
  }

  // AI 움직임 (간단히 첫 빈칸에 둠, 더 좋은 알고리즘으로 대체 가능)
  function aiMove() {
    if (gameOver) return;

    // 단순 빈 칸 첫번째 찾기 (테스트 용)
    const best = board.findIndex(cell => cell === null);
    if (best !== -1) {
      board[best] = AI;
      render();
      if (checkWin(AI)) return endGame('✕ AI 승리!');
      if (checkDraw()) return endGame('무승부!');
      updateStatus('● 당신 차례');
    }
  }

  // 승리 체크
  function checkWin(player) {
    return winCombos.some(combo => combo.every(i => board[i] === player));
  }

  // 무승부 체크
  function checkDraw() {
    return board.every(cell => cell !== null);
  }

  // 게임 종료 처리
  function endGame(message) {
    updateStatus(message);
    gameOver = true;
  }

  // 게임판 초기화
  function resetGame() {
    board = Array(9).fill(null);
    gameOver = false;
    updateStatus('● 당신 차례');
    render();
  }

  // 보드 렌더 함수 (여기선 canvas 요소들 생성 예시)
  function render() {
    if (!boardElem) return;
    boardElem.innerHTML = '';
    board.forEach((cell, idx) => {
      const canvas = document.createElement('canvas');
      canvas.className = 'cell';
      canvas.dataset.index = idx;
      canvas.width = 60; // 예시 사이즈
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#333';
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (cell === PLAYER) ctx.fillText('●', canvas.width/2, canvas.height/2);
      else if (cell === AI) ctx.fillText('✕', canvas.width/2, canvas.height/2);
      boardElem.appendChild(canvas);
    });
  }
  btnAI.addEventListener('click', () => {
  overlay.style.display = 'block';
  modalAI.classList.add('show');
  });

  // 취소 버튼 클릭 시 모달 닫기
  btnCancelAI.addEventListener('click', () => {
    overlay.style.display = 'none';
    modalAI.classList.remove('show');
  });

  // (선택 사항) 오버레이 클릭해도 모달 닫기
  overlay.addEventListener('click', () => {
    overlay.style.display = 'none';
    modalAI.classList.remove('show');
  });
  // 초기 상태 세팅
  resetGame();
});
