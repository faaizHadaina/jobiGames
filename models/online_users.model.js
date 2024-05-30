module.exports = (sequelize, Sequelize) => {
    const onlineusers = sequelize.define("onlineusers", {
        sn: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
          },
          username: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          status: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          sessionid: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          game: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          tableid: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          amount: {
            type: Sequelize.STRING,
            allowNull: false,
          },
    });

    return onlineusers;
}