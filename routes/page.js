const express = require('express');

// render+(html파일 이름)
//const { render } = require('../controllers/page');

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = null;
  res.locals.followerCount = 0;
  res.locals.followingCount = 0;
  res.locals.followingIdList = [];
  next();
});

//router.get('/', render);


module.exports = router;