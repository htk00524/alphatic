const express = require('express');
const User = require('../models/user');
const router = express.Router();
const bcrypt = require('bcrypt');


// 회원가입 페이지
// 일단 주소 /join으로
router.get('/join', (req, res) =>  {
  res.render('join');
})

// 회원가입 처리
router.post('/join', async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      username,
      password: hash,
      is_guest: false,
    });
    res.redirect('/users/login');
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// /login 페이지 
router.get('/login', (req, res) =>  {
  res.render('login');
})

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: {username } });

    if (!user) {
      return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // 로그인 성공
    return res.status(200).json({ message: '로그인 성공', user: { id: user.username }});
  } catch (err) {
    console.error(err);
    next(err);
  }
});


// 로그인 처리
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).send('존재하지 않는 사용자입니다.');
    }
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      req.session.user = {
        id: user.user_id,
        username: user.username,
      };
      return res.redirect('/');
    } else {
      return res.status(401).send('비밀번호가 틀립니다.');
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});


// 로그아웃
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;