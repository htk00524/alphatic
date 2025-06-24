// js/nickname.js
import { guestLogin } from './auth.js';
guestLogin("닉네임");

document.getElementById("startGameBtn").addEventListener("click", async () => {
  const nickname = document.getElementById("nicknameInput").value.trim();
  if (!nickname) {
    alert("닉네임을 입력해주세요.");
    return;
  }

  const result = await guestLogin(nickname);

  if (result && result.token) {
    localStorage.setItem("userNickname", result.nickname);
    localStorage.setItem("userToken", result.token);
    window.location.href = "game.html";
  } else {
    alert("로그인 실패");
  }
});
