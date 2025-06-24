const express = require("express");
const app = express();
const { getAIMove } = require("./ai/ai");

app.use(express.static("public"));
app.use(express.json());

app.post("/ai-move", (req, res) => {
  const { board, difficulty, mode } = req.body;
  const move = getAIMove(board, difficulty, mode);
  res.json({ move });
});

app.listen(3000, () => {
  console.log("서버 실행 중: http://localhost:3000");
});