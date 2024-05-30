module.exports = (sequelize, Sequelize) => {
    const mygames = sequelize.define("mygames", {
        id: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          img: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          title: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          description: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          sn: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
          },
          owner: {
            type: Sequelize.STRING,
            allowNull: false,
          },
    });

    return mygames;
}