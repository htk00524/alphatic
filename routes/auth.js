const express = require('express');
const passport = require('passport');
const router = express.Router();
const {User} = require('../models');

router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', (req, res, next) => {
  passport.authenticate('kakao', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect('/login'); // 실패 시 로그인 페이지 등으로
    
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      
      if (info && info.isNewUser) {
        // 신규 가입 유저면 nickname.html로 이동
        return res.redirect('/nickname');
      } else {
        // 기존 유저면 메인 페이지 등으로 이동
        return res.redirect('/main');
      }
    });
  })(req, res, next);
});

// 구글 로그인
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

//구글 로그인 콜백
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect('/login'); // 실패 시 로그인 페이지 등으로

    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);

      if (info && info.isNewUser) {
        // 신규 가입 유저면 nickname.html로 이동
        return res.redirect('/nickname');
      } else {
        // 기존 유저면 메인 페이지 등으로 이동
        return res.redirect('/main');
      }
    });
  })(req, res, next);
});


// 네이버 로그인
router.get('/naver', passport.authenticate('naver'));

// 네이버 로그인 콜백
router.get('/naver/callback', (req, res, next) => {
  passport.authenticate('naver', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect('/login'); // 실패 시 로그인 페이지 등으로
    
    console.log('info:', info);  // 여기서 info 내용 확인
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);

      if (info && info.isNewUser) {
        // 신규 가입 유저면 nickname.html로 이동
        return res.redirect('/nickname');
      } else {
        // 기존 유저면 메인 페이지 등으로 이동
        return res.redirect('/main');
      }
    });
  })(req, res, next);
});

router.post('/set-nickname', async (req, res, next) => {
  const { nickname } = req.body;
  const userId = req.session.passport?.user;

  if (!userId) {
    return res.status(401).json({ message: '로그인 상태가 아닙니다.' });
  }

  if (!nickname || nickname.trim() === '') {
    return res.status(400).json({ message: '닉네임을 입력하세요.' });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
    }

    user.username = nickname;
    await user.save();

    // 세션도 갱신
    req.session.user = {
      id: user.user_id,
      username: user.username,
      is_guest: user.is_guest,
    };

    res.json({ message: '닉네임 설정 완료',
      user: {
        user_id: user.user_id,
        username: user.username,
        is_guest: user.is_guest,
      }
     });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;