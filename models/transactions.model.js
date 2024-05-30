module.exports = (sequelize, Sequelize) => {
  const transactions = sequelize.define(
    "transactions",
    {
      owner: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      product: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      game: {
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
        primaryKey: true,
      },
      id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      // Disable automatic management of createdAt and updatedAt
      timestamps: false,
    }
  );

  return transactions;
};
