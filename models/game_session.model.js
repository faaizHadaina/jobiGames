module.exports = (sequelize, Sequelize) => {
  const gamesessions = sequelize.define("sessions", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    strid: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    room_owner: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    opponent_id: {
      type: Sequelize.INTEGER,
      defaultValue: null,
    },
    coin: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    game_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    room_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    room_pass: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    duration: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    winner: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    winreason: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    date_created: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    timestarted: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  });

  return gamesessions;
};
