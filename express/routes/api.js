var express = require('express');
var config = require("../config/main");
var jwt = require('jsonwebtoken');
var passport = require('passport');
var User = require('../app/models/user')

//Create The Router
var apiRoutes = express.Router();

// Protect dashboard route with JWT
apiRoutes.use(passport.authenticate('jwt', { session: false }));

apiRoutes.get('/profile', function(req, res) { 
  console.log(req.user) 
  res.json({
      "id" : req.user._id,
      "email": req.user.email,
      "role" : req.user.role,
    });
});


module.exports = apiRoutes;