const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js');
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
const Achievement = require('./achievement');
const UserAchievement = require('./userAchievement');    

db.User = User;
db.Game = Game;
db.Friend = Friend;
db.Room = Room;
db.Room_Player = Room_Player;
db.Chat_Room = Chat_Room;
db.Chat_Message = Chat_Message;
db.Achievement = Achievement;
db.UserAchievement = UserAchievement;


User.initiate(sequelize);     
Game.initiate(sequelize);
Friend.initiate(sequelize);
Room.initiate(sequelize);
Room_Player.initiate(sequelize);
Chat_Room.initiate(sequelize);
Chat_Message.initiate(sequelize);
Achievement.initiate(sequelize);
UserAchievement.initiate(sequelize);

User.associate(db);
Game.associate(db);
Friend.associate(db);
Room.associate(db);
Room_Player.associate(db);
Chat_Room.associate(db);
Chat_Message.associate(db);
Achievement.associate(db);
UserAchievement.associate(db);

module.exports = db;