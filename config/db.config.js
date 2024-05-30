module.exports = {
    HOST: "localhost",
    USER: "jobiGames_user",  //jobiusr
    PASSWORD: "Destination12@@", //Destination1@@ jobiGames_pwd
    DB: "jobiusers", //jobi_db
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  };