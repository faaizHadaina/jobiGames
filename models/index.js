const dbConfig = require('../config/db.config');

const Sequelize = require('sequelize');
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.users            = require('./user.model')(sequelize, Sequelize)
db.adminusers       = require('./admin.model')(sequelize, Sequelize)
db.activities       = require('./activities.model')(sequelize, Sequelize)
db.admincharges     = require('./admin_charges.model')(sequelize, Sequelize)
db.awards           = require('./award.model')(sequelize, Sequelize)
db.sessions     	  = require('./game_session.model')(sequelize, Sequelize)
db.games            = require('./games.model')(sequelize, Sequelize)
db.messages         = require('./messages.model')(sequelize, Sequelize)
db.mygames          = require('./my_games.model')(sequelize, Sequelize)
db.onlineusers      = require('./online_users.model')(sequelize, Sequelize)
db.transactions     = require('./transactions.model')(sequelize, Sequelize)
db.withdrawrequest  = require('./withdrawal_request.model')(sequelize, Sequelize)
db.wallet           = require('./wallet.model')(sequelize, Sequelize)

module.exports = db;