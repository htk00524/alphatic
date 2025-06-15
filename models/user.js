const Sequelize = require('sequelize');

class User extends Sequelize.Model {
  static initiate(sequelize) {
    User.init({
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(17),
        allowNull: true,
      },
      win_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      lose_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total_games: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      level: {
        type: Sequelize.TINYINT,
        defaultValue: 1,
      },
      is_guest: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }
  }, {
      sequelize,
      timestmap: false,
      underscored: false,
      modelName: 'User',
      tableName: 'users',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db){
    db.User.hasMany(db.Game, { foreignKey: 'player_x_id', sourceKey: 'user_id' });
    db.User.hasMany(db.Game, { foreignKey: 'player_o_id', sourceKey: 'user_id' });
    db.User.hasMany(db.Game, { foreignKey: 'winner_id', sourceKey: 'user_id' });

    db.User.hasMany(db.Friend, { foreignKey: 'user_id', sourceKey: 'user_id' });
    db.User.hasMany(db.Friend, { foreignKey: 'friend_id', sourceKey: 'user_id' });
  
    db.User.hasMany(db.Chat_Message, { foreignKey: 'sender_id', sourceKey: 'user_id'});
    db.User.hasMany(db.Room, { foreignKey: 'host_id', sourceKey: 'user_id' });
    db.User.hasMany(db.Room_Player, { foreignKey: 'user_id', sourceKey: 'user_id'});
  };
};

module.exports = User;

/*
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Users', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    win_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lose_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_games: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    created_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    level: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
    is_guest: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  }, {
    tableName: 'users',
    timestamps: false,
  });
};
*/