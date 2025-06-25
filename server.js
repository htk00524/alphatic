// fullServer.js

const express = require('express');
const cors = require('cors');
const fs = require('fs'); // 👉 나중에 DB 대신 파일 저장 가능
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 메모리 캐시 형태로 저장 (DB 대신)
const guestLogins = [];

// 🔹 게스트 로그인 API
app.post('/api/guest-login', (req, res) => {
  const { nickname } = req.body;

  if (!nickname || nickname.trim() === '') {
    return res.status(400).json({ message: '닉네임을 입력해주세요.' });
  }

  const token = `guest-${Date.now()}`;
  const loginData = { nickname, token, createdAt: new Date().toISOString() };

  // 저장 (테스트용 메모리)
  guestLogins.push(loginData);

  // 👉 파일로 저장해두고 싶으면 아래 코드 주석 해제
  // fs.appendFileSync('guest-logins.json', JSON.stringify(loginData) + '\n');

  res.json({ nickname, token });
});

// 🔸 전체 로그인 기록 확인 (테스트용)
app.get('/api/guest-logins', (req, res) => {
  res.json(guestLogins);
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
