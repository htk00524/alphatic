const NaverStrategy = require('passport-naver').Strategy;
const {User} = require('../models');

module.exports = (passport) => {
  passport.use(new NaverStrategy({
    clientID: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
    callbackURL: '/auth/naver/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let isNewUser = false;
      const exUser = await User.findOne({
        where: {
          sns_id: profile.id,
          provider: 'naver',
        }
      });

      if (exUser) {
        done(null, exUser, { isNewUser });
      } else {
        isNewUser = true;
        const newUser = await User.create({
          username: profile.displayName,
          sns_id: profile.id,
          provider: 'naver',
        });
        done(null, newUser, { isNewUser });
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};