var express = require('express');
var config = require("../config/main");
var jwt = require('jsonwebtoken');
var passport = require('passport');
var CallRoutes = require('./calls.js')
var User = require('../app/models/user')

//Create The Router
var apiRoutes = express.Router();

// Protect dashboard route with JWT
apiRoutes.use(passport.authenticate('jwt', { session: false }));

// Add the calling api
apiRoutes.use('/calls', CallRoutes);

apiRoutes.get('/profile', function(req, res) {
  res.json({
      "id" : req.user._id,
      "name": req.user.name,
      "number": req.user.number,
      "email": req.user.email,
      "role" : req.user.role,
    });
});


module.exports = apiRoutes;