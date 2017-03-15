var express = require('express');
var User = require('../app/models/user');
var config = require("../config/main");
var jwt = require('jsonwebtoken');
var passport = require('passport');
var morgan = require('morgan');

//Create The Router
var authRoutes = express.Router();

// Authenticate the user and get a JSON Web Token to include in the header of future requests.
authRoutes.post('/authenticate', function (req, res) {
  //Find the user
  User.findOne({ email: req.body.email }, function (err, user) { //When found
    if (err) morgan(err); //if there is an error burn the world why not?

    if (!user) {  //if there is no user send a letter home saying that it failed.
      res.send(403, { success: false, message: 'Authentication failed.' });
    } else {  //We have a correct username now...
      // Check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // Create token if the password matched and no error was thrown
          var token = jwt.sign({id: user._id.toString()}, config.secret, {
            expiresIn: '1h',
          });
          //Yey! we have a token for some time. here it is along will all your information becuase if a hacker gets this far he deserves it too no? (Chill its for debugging)
          res.json({ success: true, name: user.name, number: user.number, role: user.role, token: 'JWT ' + token });
        } else {
          // should we tell him the username is good?
          res.send(403, { success: false, message: 'Authentication failed.' });
        }
      });
    }
  });
});

// Protect editing routes with JWT
authRoutes.use('/users', passport.authenticate('jwt', { session: false }));

/** GET all the users (admin, moderator)*/
authRoutes.get('/users', function(req, res){
  if (req.user.role == "admin" || req.user.role == 'moderator'){
    User.find({}, { password: 0, __v: 0}, function(err, users){
      if (err) throw err;
      res.json(200, {success: true, message: "Successfull listing of users", users: users})
    })
  } else {
    res.json(403, {success: false, message: "Invalid Account Permissions"})
  }
});

/** PUT updates user data (admin, moderator)
 * Needs user, field, value
 */
authRoutes.put('/users', function (req, res) { 
  if (req.user.role == "admin" || req.user.role == 'moderator') { //Only admins and mods past this point
    if (req.body.field && req.body.value && req.body.user) {  //make sure we have what we need
      User.findOne({ email: req.body.user }, { password: 0, __v: 0}, function (err, user) {  //find the user with that email address
        if (err) throw err;
        if (!user) {  // user does not exist
          res.send(500, { success: false, message: 'User not found.' });
        } else if(user.role == 'admin' && user._id != req.user._id){
          res.json(403, {success: false, message: "Invalid Account Permissions"})
        } else {
          let field = req.body.field;

          if (field == 'name') {
            user.name = req.body.value;
            user.save(function (err) {
              if (err) { return res.json(500, { success: false, message: 'Error updating name', error: err}); }
              res.json(202, { success: true, message: 'Successfully updated name', user: user });
            });
          } else if (field == 'number') {
            user.number = req.body.value;
            user.save(function (err) {
              if (err) { return res.json(500, { success: false, message: 'Error updating number', error: err}); }
              res.json(202, { success: true, message: 'Successfully updated number', user: user });
            });
          } else if (field == 'password'){
            user.password = req.body.value;
            user.save(function (err) {
              if (err) { return res.json(500, { success: false, message: 'Error updating password', error: err}); }
              res.json(202, { success: true, message: 'Successfully updated password', user: user });
            });
          } else if (field == 'role'){
            if (user.schema.path('role').enumValues.indexOf(req.body.value) >= 0){
              user.role = req.body.value;
              user.save(function (err) {
                if (err) { return res.json(500, { success: false, message: 'Error updating role', error: err }); }
                res.json(202, { success: true, message: 'Successfully updated role', user: user });
              });
            } else {
              res.json(400, { success: false, message: 'Invalid role' });
            }
          } else {
            res.json(400, { success: false, message: 'Invalid Field' });
          }
        }
      });
    } else {
      res.json(400, {success: false, message: "Missing header info"});
    }
  } else {
    res.json(403, { success: false, message: "Invalid Account Permissions" })
  }
});

/** POST a new user. (Admin)
 * Needs email, password, name, number
 */
authRoutes.post('/users', function (req, res) {  //
  if (req.user.role == 'admin') {
    if (!req.body.email || !req.body.password || !req.body.name || !req.body.number) {
      res.json(400, { success: false, message: 'Missing Information', request_body: req.body })
    } else {
      var newUser = new User({
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        number: req.body.number,
      });

      newUser.save(function (err) {
        if (err) {
          return res.json(409, { success: false, message: 'That email address already exists.' });
        }
        res.json(201, {success: true, message: 'Successfully created a new user.'});
      });
    };
  } else {
    res.json(403, { success: false, message: 'Invalid Account Permissions', current_role: req.user.role });
  };
});

/** Delete an exisiting user (Admin)
 * Needs user
*/
authRoutes.delete('/users', function(req, res){
  if (req.user.role == 'admin'){
    if (req.body.user){
      User.findOneAndRemove({email: req.body.user}, { password: 0, __v: 0}, function(err, user){
        if(err) {return res.json(500, {success: false, message: "Error getting user", user: req.body.user})};
        if (user === null){
          return res.json(404, {success: false, message:"No Such User"});
        } else {
          res.json(200, {success: true, message:"Successfully deleted user", user: user});
        }
      });
    } else{
      res.json(400, { success: false, message: 'No User Given' });
    }
  } else {
    res.json(403, { success: false, message: 'Invalid Account Permissions', role: req.user.role });
  }
});

module.exports = authRoutes;