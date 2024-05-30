module.exports = (sequelize, Sequelize) => {
  const gamesessions = sequelize.define("sessions", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    room_owner: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    opponent_id: {
      type: Sequelize.INTEGER,
      defaultValue: null,
    },
    coin: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    game_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    room_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    room_pass: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    date_created: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  });

  return gamesessions;
};
