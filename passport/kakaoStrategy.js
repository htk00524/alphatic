const kakaoStrategy = require('passport-kakao').Strategy;

const {User} = require('../models');

module.exports = (passport) => {
  passport.use(new kakaoStrategy({
    clientID:process.env.KAKAO_ID,
     //kakao에서 발급해주는 id, .env 파일 생성후 KAKAO_ID:카카오에서 발급해준 api 를 추가
    callbackURL:'/auth/kakao/callback',
  }, async (accessToken, refreshToken, profile, done)=> {
    try { 
      const exUser = await User.findOne({
        where: {
          snsId: profile.id,
          provider: 'kakao'
        }});
      if (exUser) {
        done(null, exUser);
      } else {
        const newUser = await User.create({ //새 유저 생성
          username: profile.displayName,
          snsId: profile.id,
          provider: 'kakao',
        });
        done(null, newUser);
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};