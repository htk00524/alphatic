const Sequelize = require('sequelize');
const config = require('../config/config.json');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
  }
);

const db = {}; 

db.sequelize = sequelize;
db.Sequelize = Sequelize;


const User = require('./user'); 
const Game = require('./game');
const Friend = require('./friend');
const Room = require('./room');
const Room_Player = require('./room_player');
const Chat_Room = require('./chat_room');
const Chat_Message = require('./chat_message');
     

db.User = User;
db.Game = Game;
db.Friend = Friend;
db.Room = Room;
db.Room_Player = Room_Player;
db.Chat_Room = Chat_Room;
db.Chat_Message = Chat_Message;

User.initiate(sequelize);     
Game.initiate(sequelize);
Friend.initiate(sequelize);
Room.initiate(sequelize);
Room_Player.initiate(sequelize);
Chat_Room.initiate(sequelize);
Chat_Message.initiate(sequelize);

User.associate(db);
Game.associate(db);
Friend.associate(db);
Room.associate(db);
Room_Player.associate(db);
Chat_Room.associate(db);
Chat_Message.associate(db);

module.exports = db;

/*
'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, 
    config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});


// models/index.js 안에서
db.Users.hasMany(db.Games, { foreignKey: 'player_x_id' });
db.Users.hasMany(db.Games, { foreignKey: 'player_o_id' });
db.Users.hasMany(db.friends, { foreignKey: 'user_id' });
db.Users.hasMany(db.friends, { foreignKey: 'friend_id'});
db.Users.hasMany(db.chat_message, { foreignKey: 'sender_id'});
db.Users.hasMany(db.rooms, { foreignKey: 'host_id' });
db.Users.hasMany(db.room_players, { foreignKey: 'user_id'});

db.Games.belongsTo(db.Users, { foreignKey: 'player_x_id', as: 'PlayerX' });
db.Games.belongsTo(db.Users, { foreignKey: 'player_o_id', as: 'PlayerO' });

db.friends.belongsTo(db.Users, { foreignKey: 'user_id'});
db.friends.belongsTo(db.Users, { foreignKey: 'user_id'});

db.chat_message.belongsTo(db.Users, { foreignKey: 'sender_id'});

db.rooms.belongsTo(db.Users, { foreignKey: 'host_id' });
db.rooms.hasMany(db.room_players, { foreignKey: 'room_id' });

db.room_players.belongsTo(db.rooms, { foreignKey: 'room_id' });
db.room_players.belongsTo(db.Users, { foreignKey: 'user_id' });

db.sequelize = sequelize;
module.exports = db;
*/