module.exports = {
    HOST: "localhost",
    USER: "jobiGames_user",  //jobiusr
    PASSWORD: "jobiGames_pwd", //Destination1@@
    DB: "jobiusers", //jobi_db
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  };