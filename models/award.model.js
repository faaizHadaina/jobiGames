module.exports = (sequelize, Sequelize) => {
    const awards = sequelize.define("awards", {
        id: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          sn: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
          },
          title: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          comment: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          likes: {
            type: Sequelize.STRING,
            allowNull: false,
          },
    });

    return awards;
}