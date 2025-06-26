const express = require('express');
const User = require('../models/user');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    res.render('index');
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/nickname', (req, res, next) => {
  try {
    res.render('nickname'); // views/nickname.html을 렌더링
  } catch (err) {
    console.error(err);
    next(err);
  }
});


module.exports = router;