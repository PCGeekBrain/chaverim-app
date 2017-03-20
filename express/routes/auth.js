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
      res.status(403).json({ success: false, message: 'Authentication failed.' });
    } else {  //We have a correct username now...
      // Check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // Create token if the password matched and no error was thrown
          var token = jwt.sign({ id: user._id.toString() }, config.secret, {
            expiresIn: '1h',
          });
          //Yey! we have a token for some time. here it is along will all your information becuase if a hacker gets this far he deserves it too no? (Chill its for debugging)
          res.status(200).json({ success: true, name: user.name, number: user.number, role: user.role, token: 'JWT ' + token });
        } else {
          // should we tell him the username is good?
          res.status(403).json({ success: false, message: 'Authentication failed.' });
        }
      });
    }
  });
});

// Protect editing routes with JWT
authRoutes.use('/users', passport.authenticate('jwt', { session: false }));

/** GET all the users (admin, moderator)*/
authRoutes.get('/users', function (req, res) {
  if (req.user.role == "admin" || req.user.role == 'moderator') {
    User.find({}, { password: 0, __v: 0 }, function (err, users) {
      if (err) throw err;
      res.status(200).json({ success: true, message: "Successfull listing of users", users: users })
    })
  } else {
    res.status(403).json({ success: false, message: "Invalid Account Permissions" })
  }
});

let updateField = function (user, field, value, admin, res) {
  if (field === 'name') {
    user.name = value;
    user.save(function (err) {
      if (err) { return res.status(500).json({ success: false, message: 'Error updating name', error: err }); }
      res.status(202).json({ success: true, message: 'Successfully updated name', user: user });
    });
  } else if (field === 'number') {
    user.number = value;
    user.save(function (err) {
      if (err) { return res.status(500).json({ success: false, message: 'Error updating number', error: err }); }
      res.status(202).json({ success: true, message: 'Successfully updated number', user: user });
    });
  } else if (field === 'password') {
    user.password = value;
    user.save(function (err) {
      if (err) { return res.status(500).json({ success: false, message: 'Error updating password', error: err }); }
      res.status(202).json({ success: true, message: 'Successfully updated password', user: user });
    });
  } else if (field === 'role' && admin) {    //only admins can change roles
    if (user.schema.path('role').enumValues.indexOf(value) >= 0) {
      user.role = value;
      user.save(function (err) {
        if (err) { return res.status(500).json({ success: false, message: 'Error updating role', error: err }); }
        res.status(202).json({ success: true, message: 'Successfully updated role', user: user });
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid role' });
    }
  } else {
    res.status(400).json({ success: false, message: 'Invalid Field' });
  }
}

/** PUT updates user data (admin, moderator)
 * Needs user, field, value
 */
authRoutes.put('/users', (req, res) => {
  // If the request is from an admin editing a user
  if (['admin', 'moderator'].indexOf(req.user.role) >= 0 && req.body.user) {
    User.findOne({ email: req.body.user }, { password: 0, __v: 0 }, (err, user) => {
      if (err) { return res.status(500).json({ success: false, message: "Internal Server Error" }) }
      else if (!user) {
        return res.status(500).json({ success: false, message: "User Does Not Exist" })
      } else if (user.role == 'admin' && user._id != req.user._id) {
        res.status(403).json({ success: false, message: "You Cannot edit other admins" })
      } else {
        console.log(req.body.field);
        updateField(user, req.body.field, req.body.value, true, res);
      }
    });
    //otherwise if it is the user itself
  } else if (req.body.value && (['name', 'number', 'password'].indexOf(req.body.field) >= 0)) {
    User.findOne({ _id: req.user._id }, { password: 0, __v: 0 }, (err, user) => {
      if (err) { return res.status(500).json({ success: false, message: "Internal Server Error" }) }
      updateField(user, req.body.field, req.body.value, false, res);
    });
  } else {
    console.log(req.body.field);
    res.status(400).json({ success: false, message: "Invalid Request" })
  }
});

/** POST a new user. (Admin)
 * Needs email, password, name, number
 */
authRoutes.post('/users', function (req, res) {
  if (req.user.role == 'admin') {
    if (!req.body.email || !req.body.password || !req.body.name || !req.body.number) {
      res.status(400).json({ success: false, message: 'Missing Information', request_body: req.body })
    } else {
      var newUser = new User({
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        number: req.body.number,
      });

      newUser.save(function (err) {
        if (err) {
          return res.status(409).json({ success: false, message: 'That email address already exists.' });
        }
        res.status(201).json({ success: true, message: 'Successfully created a new user.' });
      });
    };
  } else {
    res.status(403).json({ success: false, message: 'Invalid Account Permissions', current_role: req.user.role });
  };
});

/** Delete an exisiting user (Admin)
 * Needs user
*/
authRoutes.delete('/users', function (req, res) {
  if (req.user.role == 'admin') {
    if (req.headers.user) {
      User.findOneAndRemove({ email: req.headers.user }, { password: 0, __v: 0 }, function (err, user) {
        if (err) { return res.status(500).json({ success: false, message: "Error getting user", user: req.headers.user }) };
        if (user === null) {
          return res.status(404).json({ success: false, message: "No Such User" });
        } else {
          res.status(200).json({ success: true, message: "Successfully deleted user", user: user });
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'No User Given' });
    }
  } else {
    res.status(403).json({ success: false, message: 'Invalid Account Permissions', role: req.user.role });
  }
});

module.exports = authRoutes;