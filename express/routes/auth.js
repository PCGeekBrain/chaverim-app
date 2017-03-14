var express = require('express');
var User = require('../app/models/user');
var config = require("../config/main");
var jwt = require('jsonwebtoken');
var passport = require('passport');

//Create The Router
var authRoutes = express.Router();

// Authenticate the user and get a JSON Web Token to include in the header of future requests.
authRoutes.post('/authenticate', function(req, res) {  
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.send({ success: false, message: 'Authentication failed. User not found.' });
    } else {
      // Check if password matches
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (isMatch && !err) {
          // Create token if the password matched and no error was thrown
          var token = jwt.sign(user, config.secret, {
            expiresIn: 10080 // in seconds
          });
          res.json({ success: true, token: 'JWT ' + token });
        } else {
          res.send({ success: false, message: 'Authentication failed. Passwords did not match.' });
        }
      });
    }
  });
});

// Protect editing routes with JWT
authRoutes.use('/edit', passport.authenticate('jwt', { session: false }));

authRoutes.post('/edit/change', function(req, res){
  if ((req.user.role == "Admin" || req.user.role == "Manager") && (!req.body.field || !req.body.value || !req.body.useremail)) {
    res.json({
      "Status": "Coming Soon",
      "Request": {
        "User": req.body.useremail,
        "Field": req.body.field,
        "Value": req.body.value,
      }
    });
  } else {
    res.json({success: false, message: "Invalid Request"})
  }
});

/* GET users listing. */
authRoutes.post('/edit/add', function(req, res) {  
  if(req.user.role != "Admin"){
    res.status(403).json({success: false, message: 'You do not have permission to add users'});
  } else if(!req.body.email || !req.body.password || !req.body.name || !req.body.number){
    res.json({success: false, message: 'Please submit email, password, name and number'});
  } else {
    var newUser = new User({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      number: req.body.number,
    });

    newUser.save(function(err){
      if (err) {
        return res.json({success: false, message: 'That email address already exists.'});
      }
      res.json({
        success: true, message: 'Successfully created a new user.'
      });
    })
  }
});

module.exports = authRoutes;