const GoogleStrategy = require('passport-google-oauth20').Strategy;
const {User} = require('../models');

module.exports = (passport) => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // google에서 받아와야됨
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const exUser = await User.findOne({
        where: {
          snsId: profile.id,
          provider: 'google',
        }
      });

      if (exUser) {
        done(null, exUser);
      } else {
        const newUser = await User.create({
          username: profile.displayName,
          snsId: profile.id,
          provider: 'google',
        });
        done(null, newUser);
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};