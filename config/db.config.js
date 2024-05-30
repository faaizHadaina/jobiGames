module.exports = {
  HOST: "127.0.0.1",  // Use IPv4 loopback address
  USER: "jobiGames_user",
  PASSWORD: "Destination12@@",
  DB: "jobiusers",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
};