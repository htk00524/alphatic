const Sequelize = require('sequelize');

class Chat_Room extends Sequelize.Model {
  static initiate(sequelize) {
    Chat_Room.init({
      chat_room_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },

      is_group: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }
    }, { 
      sequelize,
      timestmap: false,
      underscored: false,
      modelName: 'Chat_Room',
      tableName: 'chat_rooms',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.Chat_Room.hasMany(db.Chat_Message, { foreignKey: 'chat_room_id', sourceKey: 'chat_room_id' });
  };
};

module.exports = Chat_Room;