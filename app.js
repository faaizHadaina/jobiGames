require("dotenv").config();
const express = require('express');
const db = require('./models');
const cors = require('cors');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');
const passport = require("passport");
const routes = require('./routes/index');
const passportMiddleware = require('./middleware/passport.middleware');
const SocketServer = require('./socketServer');
const { ExpressPeerServer } = require('peer');
const morgan = require('morgan');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');

const app = express();

db.sequelize.sync();

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 100
});

const httpServer = require('http').createServer(app);
const io = new Server(httpServer, {
    cors: {
      origin: "*", 
      methods: ['GET', 'POST'],
      credentials: true,
      transports: ['websocket', 'polling'], 
    },
});

io.on('connection', socket => {
    SocketServer(socket);
});

app.use(helmet());
app.use(xssClean());
app.use(limiter);

const corsOptions = {
    origin: '*'
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
passportMiddleware(passport);
app.use(cookieParser());
app.use(morgan('dev'));

app.use(routes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const peerServer = ExpressPeerServer(httpServer, { path: '/' });
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.send('Welcome to JobiGames Api');
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
