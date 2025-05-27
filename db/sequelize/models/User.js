module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(30),
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
  }, {
    tableName: 'users',
    timestamps: false,
  });

  User.associate = (models) => {
    User.hasMany(models.Game, { foreignKey: 'player_x_id', as: 'games_as_x' });
    User.hasMany(models.Game, { foreignKey: 'player_o_id', as: 'games_as_o' });
    User.hasMany(models.Game, { foreignKey: 'winner_id', as: 'wins' });
  
    User.hasMany(models.Friend, { foreignKey: 'user_id', as: 'myFriends' });
    User.hasMany(models.Friend, { foreignKey: 'friend_id', as: 'friendOf' });
  
    // 등등...
  };
  
  return User;
};
