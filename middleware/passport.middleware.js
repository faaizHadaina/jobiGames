const model = require("../models");
const Users = model.users;
const { Strategy, ExtractJwt } = require("passport-jwt");

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET
};

module.exports = (passport) => {
    passport.use(
        new Strategy(options, async (jwtPayload, done) => {
            try {
                const user = await Users.findOne({ where: { sn: jwtPayload.user_id }});
                if (user) {
                    return done(null, user);
                }
                return done(null, false);
            } catch (error) {
                console.error('Error in passport strategy:', error);
                return done(error, false);
            }
        })
    );
}
