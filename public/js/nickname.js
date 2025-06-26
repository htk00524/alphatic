// js/nickname.js
import { guestLogin } from './auth.js';

document.getElementById("startGameBtn").addEventListener("click", async () => {
  const nickname = document.getElementById("nicknameInput").value.trim();
  if (!nickname) {
    alert("닉네임을 입력해주세요.");
    return;
  }

const result = await guestLogin(nickname);
console.log('닉네임 응답:', result);  

  if (result && result.user) {
    localStorage.setItem("userNickname", result.user.username);
    localStorage.setItem("userId", result.user.user_id);
    window.location.href = "game.html";
  } else {
    alert("로그인 실패");
  }
});
