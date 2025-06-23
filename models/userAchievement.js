const Sequelize = require('sequelize');

class UserAchievement extends Sequelize.Model {
  static initiate(sequelize) {
    UserAchievement.init({
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      achievement_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'achievements',
          key: 'achievement_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      achieved_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }
    }, {
      sequelize,
      timestamps: false,
      underscored: false,
      modelName: 'UserAchievement',
      tableName: 'user_achievements',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.UserAchievement.belongsTo(db.User, {
      foreignKey: 'user_id',
      targetKey: 'user_id',
    });
    db.UserAchievement.belongsTo(db.Achievement, {
      foreignKey: 'achievement_id',
      targetKey: 'achievement_id',
    });
  }
}

module.exports = UserAchievement;