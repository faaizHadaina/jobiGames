module.exports = (sequelize, Sequelize) => {
    const withdrawrequest = sequelize.define("withdrawrequest", {
        owner: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          id: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          amount: {
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
          status: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          approvedby: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          adminid: {
            type: Sequelize.STRING,
            allowNull: false,
          },
    });

    return withdrawrequest;
}