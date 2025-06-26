const express = require('express');
const router = express.Router();

// GET /game 요청 처리
router.get('/', (req, res) => {
  res.render('game');  // views/game.html 또는 views/game.njk 렌더링
});

module.exports = router;
