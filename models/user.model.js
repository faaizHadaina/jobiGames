module.exports = (sequelize, Sequelize) => {
  const users = sequelize.define("users", {
      ID: {
          type: Sequelize.STRING,
          defaultValue: null,
      },
      email: {
          type: Sequelize.STRING,
          defaultValue: null,
      },
      phone: {
          type: Sequelize.STRING,
          defaultValue: null,
      },
      accttype: {
          type: Sequelize.STRING,
          defaultValue: null,
      },
      fullname: {
          type: Sequelize.STRING,
          defaultValue: null,
      },
      nick: {
          type: Sequelize.STRING,
          defaultValue: null,
      },
      balance: {
          type: Sequelize.DECIMAL(15, 2), 
          defaultValue: 0.00,
      },        
      lastlogin: {
          type: Sequelize.STRING,
          defaultValue: null,
      },
      lastrecharge: {
          type: Sequelize.STRING,
          defaultValue: null,
      },
      sn: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true
      },
      country: {
          type: Sequelize.STRING,
          defaultValue: null,
      },
      password: {
          type: Sequelize.STRING,
          defaultValue: null,
      },
      realmoney: {
          type: Sequelize.STRING,
          defaultValue: null,
      },
      dateadded: {
          type: Sequelize.STRING,
          defaultValue: null,
      },
      status: {
          type: Sequelize.STRING,
          defaultValue: null,
      },
      bank: {
          type: Sequelize.STRING,
          defaultValue: null,
      },
      banknumber: {
          type: Sequelize.STRING,
          defaultValue: null,
      },
      fbid: {
          type: Sequelize.STRING,
          defaultValue: null,
      },
      dob: {
          type: Sequelize.STRING,
          defaultValue: null,
      },
      sex: {
          type: Sequelize.STRING,
          defaultValue: null,
      },
      notid: {
          type: Sequelize.STRING,
          defaultValue: null,
      },
      passwordupdate: {
          type: Sequelize.STRING,
          defaultValue: null,
      },
      verificationCode: {
          type: Sequelize.INTEGER,
      },
      isEmailVerified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
      },
      passwordResetCode: {
          type: Sequelize.STRING
      }
  }, {
      // Disable automatic management of createdAt and updatedAt
      timestamps: false,
  });

  return users;
};
