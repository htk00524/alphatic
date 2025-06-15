const passport = require('passport');
const {User} = require('../models');
const kakaoStrategy = require('./kakaoStrategy');
const googleStrategy = require('./googleStrategy');
const naverStrategy = require('./naverStrategy');

module.exports = () => {
  kakaoStrategy(passport);
  googleStrategy(passport);
  naverStrategy(passport);

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({ where: { id } });
      done
    } catch (err) {
      done(err);
    }
  });
};