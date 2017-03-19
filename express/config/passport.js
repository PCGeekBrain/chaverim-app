var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var User = require('../app/models/user');
var config = require('../config/main');

module.exports = function(passport){
    var opts = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
    opts.secretOrKey = config.secret;
    passport.use(new JwtStrategy(opts, function(jwt_payload, done){
        User.findOne({_id: jwt_payload.id,}, { password: 0, __v: 0}, function(err, user){
            if (err){
                return done(err);
            } if (user) {
                done(null, user);
            } else{
                done(null, false);
            }
        });
    }));
}