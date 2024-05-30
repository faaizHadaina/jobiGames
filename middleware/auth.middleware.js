const model = require('../models');
const jwt = require('jsonwebtoken');

const Users = model.users;

const auth = async (req, res, next) => {
    try {
        const header = req.header("Authorization");

        if (!header) {
            return res.status(401).json({ msg: "No authentication token, access denied." });
        }

        const parts = header.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ msg: "Token format is 'Bearer <token>'." });
        }

        const token = parts[1];
        const decoded = jwt.verify(token, process.env.SECRET); 
        const user = await Users.findOne({ where: { sn: decoded.user_id } });

        if (!user) {
            return res.status(404).json({ msg: "User not found." });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ msg: "Token has expired, please login again." });
        } else if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ msg: "Invalid token." });
        }
        return res.status(500).json({ msg: "Server error: " + err.message });
    }
};

module.exports = auth;
