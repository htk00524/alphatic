const Sequelize = require('sequelize');

class Room extends Sequelize.Model {
  static initiate(sequelize) {
    Room.init({
      room_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      host_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        isDelete: 'CASCADE',
        isUpdate: 'CASCADE',
      },

      status: {
        type: Sequelize.ENUM('waiting', 'playing'),
        defaultValue: 'waiting',
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },

      game_type: {
        type: Sequelize.ENUM('3x3', '5x5', 'ultimate'),
        defaultValue: '3x3',
        allowNull: false,
      },

      mode: {
        type: Sequelize.ENUM('pvp', 'pvai'),
        defaultValue: 'pvp',
        allowNull: false,
      },

      ai_difficulty: {
        type: Sequelize.ENUM('easy', 'medium', 'hard'),
        defaultValue: 'medium',
      },

      secret: {
        type: Sequelize.BOOLEAN,
        defaultType: false,
      },

      password: {
        type: Sequelize.TINYINT,
      }
    }, {
      sequelize,
      timestmap: false,
      underscored: false,
      modelName: 'Room',
      tableName: 'rooms',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }
    static associate(db) {
      db.Room.hasMany(db.Room_Player, { foreignKey: 'room_id', sourceKey: 'room_id' });
      db.Room.belongsTo(db.User, { foreignKey: 'user_id', foreignKey: 'host_id' });
  };
};

module.exports = Room;

/*
const Sequelize = require('sequelize');

class Room extends Sequelize.Model {
  static initiate(sequelize) {
    Room.init({

      
    })
  }
}

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('rooms', {

    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },

    host_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id',
      },
      isDelete: 'CASCADE',
      isUpdate: 'CASCADE',
    },

    status: {
      type: DataTypes.ENUM('waiting', 'playing'),
      defaultValue: 'waiting',
      allowNull: false,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },

    game_type: {
      type: DataTypes.ENUM('3x3', '5x5', 'ultimate'),
      defaultValue: '3x3',
      allowNull: false,
    },

    mode: {
      type: DataTypes.ENUM('pvp', 'pvai'),
      defaultValue: 'pvp',
      allowNull: false,
    },

    ai_difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      defaultValue: 'medium',
    },

    secret: {
      type: DataTypes.BOOLEAN,
      defaultType: false,
    },

    password: {
      type: DataTypes.TINYINT,
    },

  });
};*/