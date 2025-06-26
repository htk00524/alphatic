const Sequelize = require('sequelize');

class Chat_Message extends Sequelize.Model {
  static initiate(sequelize) {
    Chat_Message.init ({
        message_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      chat_room_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'chat_rooms',
          key: 'chat_room_id',
        },
        isDelete: 'CASCADE',
        isUpdate: 'CASCADE',
      },

      sender_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        isDelete: 'CASCADE',
        isUpdate: 'CASCADE',
      },

      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      sent_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW, 
        allowNull: false,
      }
    }, {
      sequelize,
      timestmap: false,
      underscored: false,
      modelName: 'Chat_Message',
      tableName: 'chat_messages',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.Chat_Message.belongsTo(db.User, { foreignKey: 'sender_id', targetKey: 'user_id'});
    db.Chat_Message.belongsTo(db.Chat_Room, { foreignKey: 'chat_room_id', targetKey: 'chat_room_id' });
  };
};

module.exports = Chat_Message;