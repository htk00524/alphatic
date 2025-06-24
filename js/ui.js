
let selectedAvatar = null;
let nickname = '';

const avatarElems = document.querySelectorAll('.avatar');
const nicknameInput = document.getElementById('nicknameInput');
const startGameBtn = document.getElementById('startGameBtn');

avatarElems.forEach(avatar => {
  avatar.addEventListener('click', () => {
    avatarElems.forEach(a => a.classList.remove('selected'));
    avatar.classList.add('selected');
    selectedAvatar = avatar.src;
    checkStartEnable();
  });
});

nicknameInput.addEventListener('input', () => {
  nickname = nicknameInput.value.trim();
  checkStartEnable();
});

function checkStartEnable() {
  startGameBtn.disabled = !(selectedAvatar && nickname.length > 0);
}

startGameBtn.addEventListener('click', () => {
  showScreen('gameScreen');
});

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');

  if (screenId === 'gameScreen') {
    resetGame();
    showPlayerProfile();
  }
}

function showPlayerProfile() {
  const profileDiv = document.getElementById('playerProfile');
  const profileAvatar = document.getElementById('profileAvatar');
  const profileName = document.getElementById('profileName');

  if (selectedAvatar && nickname) {
    profileAvatar.src = selectedAvatar;
    profileName.textContent = nickname;
    profileDiv.style.display = 'flex';
  } else {
    profileDiv.style.display = 'none';
  }
}
