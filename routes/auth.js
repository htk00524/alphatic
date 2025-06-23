const express = require('express');
const passport = require('passport');
const router = express.Router();


// 카카오 로그인 시작 (카카오 로그인 페이지로 리디렉션)
router.get('/kakao', passport.authenticate('kakao'));

// 카카오 로그인 콜백 (로그인 성공/실패 후 돌아오는 경로)
router.get('/kakao/callback',
  passport.authenticate('kakao', {
    failureRedirect: '/login', // 로그인 실패 시 이동
  }),
  (req, res) => {
    //로그인 성공 시 이동
    res.redirect('/main');  
  }
);


// 구글 로그인
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

//구글 로그인 콜백
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/main',
}), (req, res) => {
  res.redirect('/main');
});

// 네이버 로그인
router.get('naver', passport.authenticate('naver'));

// 네이버 로그인 콜백
router.get('/naver/callback', passport.authenticate('naver', {
  failureRedirect: '/main',
}), (req, res) => {
  res.redirect('/main');
});


module.exports = router;