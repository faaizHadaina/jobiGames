module.exports = (sequelize, Sequelize) => {
    const admincharges = sequelize.define("admincharges", {
        owner: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          amount: {
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
          game: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          type: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          product: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          dateadded: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          sn: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
    }, {
      // Disable automatic management of createdAt and updatedAt
      timestamps: false,
  });

    return admincharges;
}