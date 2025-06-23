const NaverStrategy = require('passport-naver').Strategy;
const {User} = require('../models');

module.exports = (passport) => {
  passport.use(new NaverStrategy({
    clientID: process.env.NAVER_CLIENT_ID, // 네이버에서 받아와야함
    clientSecret: process.env.NAVER_CLIENT_SECRET,
    callbackURL: '/auth/naver/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const exUser = await User.findOne({
        where: {
          snsId: profile.id,
          provider: 'naver',
        }
      });

      if (exUser) {
        done(null, exUser);
      } else {
        const newUser = await User.create({
          username: profile.displayName,
          snsId: profile.id,
          provider: 'naver',
        });
        done(null, newUser);
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};