const { User, Game, Achievement, UserAchievement, Sequelize } = require('../models');
const { Op } = Sequelize;

async function checkAchievements(userId) {
  const user = await User.findByPk(userId);
  if (!user || user.is_guest) return;

  // 이미 달성한 업적 목록
  const userAchievements = await UserAchievement.findAll({
    where: { user_id: userId },
    attributes: ['achievement_id'],
    raw: true,
  });
  const achievedIds = userAchievements.map(a => a.achievement_id);

  // 모든 업적 불러오기
  const achievements = await Achievement.findAll();

  for (const achievement of achievements) {
    if (achievedIds.includes(achievement.achievement_id)) continue;

    let conditionMet = false;

    switch (achievement.condition_type) {
      case 'total_games': {
        conditionMet = user.total_games >= achievement.condition_value;
        break;
      }
      case 'win_streak': {
        const recentGames = await Game.findAll({
          where: {
            [Op.or]: [
              { player_x_id: userId },
              { player_o_id: userId },
            ],
            mode: 'pvp',
          },
          order: [['end_time', 'DESC']],
          limit: achievement.condition_value,
        });

        let count = 0;
        for (const game of recentGames) {
          if (game.winner_id === userId) {
            count++;
          } else {
            break;
          }
        }
        conditionMet = count === achievement.condition_value;
        break;
      }
      case 'daily_streak': {
        const today = new Date();
        const days = [];

        for (let i = 0; i < achievement.condition_value; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          days.push(d.toISOString().slice(0, 10));
        }

        const playedDays = await Game.findAll({
          where: {
            [Op.or]: [
              { player_x_id: userId },
              { player_o_id: userId },
            ],
            mode: 'pvp',
            start_time: {
              [Op.gte]: new Date(today.getTime() - achievement.condition_value * 86400000),
            },
          },
          attributes: [
            [Sequelize.fn('DATE', Sequelize.col('start_time')), 'play_date'],
          ],
          group: ['play_date'],
          raw: true,
        });

        const playedDates = playedDays.map(p => p.play_date);
        conditionMet = days.every(d => playedDates.includes(d));
        break;
      }
    }

    if (conditionMet) {
      await UserAchievement.create({
        user_id: userId,
        achievement_id: achievement.achievement_id,
      });
      console.log(` [User ${userId}] 업적 달성: ${achievement.name}`);
    }
  }
}

module.exports = { checkAchievements };
