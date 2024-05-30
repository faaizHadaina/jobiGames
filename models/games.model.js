module.exports = (sequelize, Sequelize) => {
    const games = sequelize.define("games", {
        title: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          id: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          description: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          owner: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          players: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          sn: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
          },
          imgs: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          category: {
            type: Sequelize.STRING,
            allowNull: false,
          },
    });

    return games;
}