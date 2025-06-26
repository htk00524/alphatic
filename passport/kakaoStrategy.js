const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const { User } = require('../models');

module.exports = () => {
  passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_ID,
    callbackURL: '/auth/kakao/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let isNewUser = false;
      let user = await User.findOne({
        where: { sns_id: profile.id, provider: 'kakao' },
      });
      
      if (!user) {
        isNewUser = true;
        user = await User.create({
          username: profile.displayName || `KakaoUser_${profile.id}`,
          sns_id: profile.id,
          provider: 'kakao',
        });
      }
      // done 호출 시, 두 번째 인자 user, 세 번째 인자 info 객체를 넘길 수 있음
      done(null, user, { isNewUser });
    } catch (error) {
      done(error);
    }
  }));
};
