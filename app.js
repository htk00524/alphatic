const express = require('express');
const path = require('path');
const morgan = require('morgan');
const nunjucks = require('nunjucks');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const passport = require('passport');
const passportConfig = require('./passport');
const authRouter = require('./routes/auth');
const rankingRouter = require('./routes/ranking');
const mainRouter = require('./routes/main');

const dotenv = require('dotenv')
dotenv.config();

const { sequelize } = require('./models');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const friendRouter = require('./routes/friend');
const gameRouter = require('./routes/game');
 
const app = express();
passportConfig();

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});

sequelize.sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });
  

app.use(session({
  secret: 'mySecretKey',
  resave: false,
  saveUninitialized: false,
  store: new SequelizeStore({ db: sequelize }),
}));

// 미들웨어
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize()); 
app.use(passport.session()); 

// 라우터
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/friend', friendRouter);
app.use('/ranking', rankingRouter);
app.use('/main', mainRouter);
app.use('/game', gameRouter);

// 에러처리
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err: {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
