module.exports = (sequelize, Sequelize) => {
    const messages = sequelize.define("messages", {
        owner: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          message: {
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
          sn: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
          },
          dateadded: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          source: {
            type: Sequelize.STRING,
            allowNull: false,
          },
    });

    return messages;
}