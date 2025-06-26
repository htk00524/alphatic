const Sequelize = require('sequelize');

class Room_Player extends Sequelize.Model {
  static initiate(sequelize) {
    Room_Player.init({
      room_player_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
      },

      room_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'rooms',
          key: 'room_Id',
        },
        isDelete: 'CASCADE',
        isUpdate: 'CASCADE',
      },

      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'user_Id',
        },
        isDelete: 'CASCADE',
        isUpdate: 'CASCADE',
      } 
    }, {
      sequelize,
      timestmap: false,
      underscored: false,
      modelName: 'Room_Player',
      tableName: 'room_players',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }
  static associate(db) {
    db.Room_Player.belongsTo(db.Room, { foreignKey: 'room_id', targetKey: 'room_id' });
    db.Room_Player.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'user_id' });

  };
};

module.exports = Room_Player;