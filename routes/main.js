const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('main');  // views/main.html 또는 main.html 파일이 있어야 합니다.
});

module.exports = router;
