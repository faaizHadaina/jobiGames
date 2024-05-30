module.exports = (sequelize, Sequelize) => {
    const adminusers = sequelize.define("adminusers", {
        email: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          password: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          role: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          dateadded: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          sn: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
          },
    });

    return adminusers;
}