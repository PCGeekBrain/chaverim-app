var mongoose = require("mongoose")
var bcrypt = require("bcrypt")

// User Schema
var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    number: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['viewer', 'responder', 'dispatcher', 'moderator', 'admin'],
        default: 'responder',
        lowercase: true,
    },
    devices: [String],
});

//Hasing of the password
UserSchema.pre('save', function(next) {
    var user = this;
    if (this.isModified('password') || this.isNew){
        bcrypt.genSalt(10, function(err, salt){
            if (err){
                return next(err)
            }
            bcrypt.hash(user.password, salt, function(err, hash){
                if (err){
                    return next(err)
                }
                user.password = hash;
                next()
            });
        });
    } else{
        return next();
    }
});

//Compare password to database
UserSchema.methods.comparePassword = function(pw, cb) {  
    bcrypt.compare(pw, this.password, function(err, isMatch) {
        if (err) {
            return cb(err);
        }
            cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);