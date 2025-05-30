const Sequelize = require('sequelize');

class Game extends Sequelize.Model {
  static initiate(sequelize) {
    Game.init({
      game_id: { 
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
    
      player_x_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

    player_o_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    winner_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    start_time: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,      
    },

    end_time: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },

    game_type: {
      type: Sequelize.ENUM('3x3', '5x5', 'ultimate'),
      allowNull: false,
      defaultValue: '3x3',
    },
    
    mode: {
      type: Sequelize.ENUM('pvp', 'pvai'),
      allowNull: false,
      defaultValue: 'pvai',
    },

    ai_difficulty: {
      type: Sequelize.ENUM('easy', 'medium', 'hard'),
      defaultValue: 'medium',
    }, 
  }, {
      sequelize,
      timestamps: false,
      modelName: 'Game',
      tableName: 'games',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }

  static associate(db) {
    db.Game.belongsTo(db.User, { foreignKey: 'player_x_id', as: 'PlayerX', targetKey: 'user_id' });
    db.Game.belongsTo(db.User, { foreignKey: 'player_o_id', as: 'PlayerO', targetKey: 'user_id' });
    db.Game.belongsTo(db.User, { foreignKey: 'winner_id', targetKey: 'user_id' });
  };
};

module.exports = Game;

/*
moule.exports = (sequelize, DataTypes) => {
  return sequelize.define('Games', {
    game_id: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    
    player_x_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    player_o_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    winner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,      
    },

    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    game_type: {
      type: DataTypes.ENUM('3x3', '5x5', 'ultimate'),
      allowNull: false,
      defaultValue: '3x3',
    },
    
    mode: {
      type: DataTypes.ENUM('pvp', 'pvai'),
      allowNull: false,
      defaultValue: 'pvai',
    },

    ai_difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard')
    }

  });
};


*/