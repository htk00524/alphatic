const express = require('express');
const router = express.Router();
const { User, Sequelize} = require('../models');
const Op = Sequelize.Op;

router.get('/', async (req, res, next) => {
  try {
    const mode = req.query.mode || '3x3';
    const limit = parseInt(req.query.limit) || 10;

    const query = `
      SELECT
        u.user_id,
        u.username,
        COUNT(CASE WHEN g.winner_id = u.user_id THEN 1 END) AS win_count,
        COUNT(CASE WHEN g.winner_id IS NOT NULL AND g.winner_id != u.user_id THEN 1 END) AS lose_count,
        COUNT(*) AS total_games,
        ROUND(
          IF(COUNT(*) = 0, 0, COUNT(CASE WHEN g.winner_id = u.user_id THEN 1 END) / COUNT(*)),
          4
        ) AS win_rate
      FROM users u
      JOIN games g ON (u.user_id = g.player_x_id OR u.user_id = g.player_o_id)
      WHERE g.mode = 'pvp' AND g.game_type = :mode
      GROUP BY u.user_id, u.username
      HAVING total_games > 0
      ORDER BY win_rate DESC
      LIMIT :limit
    `;
    
    const results = await Sequelize.query(query, {
      replacements: {mode, limit },
      type: Sequelize.QueryTypes.SELECT,
    });

    res.json(results);
  } catch(err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;