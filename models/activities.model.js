module.exports = (sequelize, Sequelize) => {
    const activities = sequelize.define("activities", {
        owner: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          msg: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          id: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          status: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          dateadded: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          timeadded: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          sn: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
          },
          colorcode: {
            type: Sequelize.STRING,
            allowNull: false,
          },
    });

    return activities;
}