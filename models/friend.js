const Sequelize = require('sequelize');

class Friend extends Sequelize.Model {
  static initiate(sequelize) {
    Friend.init ({
      f_id: {
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

      friend_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      status: {
        type: Sequelize.ENUM('requesting', 'friend', 'blocked'),
      },
    
      requested_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    }, {
      sequelize,
      timestmap: false,
      underscored: false,
      modelName: 'Friend',
      tableName: 'friends',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db){
    db.Friend.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'user_id' });
    db.Friend.belongsTo(db.User, { foreignKey: 'friend_id', targetKey: 'user_id' });
  };
};

module.exports = Friend;
/*
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('friends', {
    f_id: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    friend_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    status: {
      type: DataTypes.ENUM('requesting', 'friend', 'blocked'),
    },
    
    requested_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });
};*/