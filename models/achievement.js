const Sequelize = require('sequelize');

class Achievement extends Sequelize.Model {
  static initiate(sequelize) {
    Achievement.init({
      achievement_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },

      description: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      condition_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      condition_value: {
        type: Sequelize.INTEGER,
        allowNull: false,
      }
    }, {
      sequelize,
      timestamps: false,
      underscored: false,
      modelName: 'Achievement',
      tableName: 'achievements',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }
  static associate(db) {
    db.Achievement.hasMany(db.UserAchievement, {
      foreignKey: 'achievement_id',
      sourceKey: 'achievement_id',
    });
  }
}

module.exports = Achievement;