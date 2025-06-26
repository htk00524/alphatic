const GoogleStrategy = require('passport-google-oauth20').Strategy;
const {User} = require('../models');

module.exports = (passport) => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let isNewUser = false;
      const exUser = await User.findOne({
        where: {
          sns_id: profile.id,
          provider: 'google',
        }
      });

      if (exUser) {
        done(null, exUser, { isNewUser });
      } else {
        isNewUser = true;
        const newUser = await User.create({
          username: profile.displayName,
          sns_id: profile.id,
          provider: 'google',
        });
        done(null, newUser, { isNewUser });
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};