var express = require('express');
var config = require("../config/main");
var jwt = require('jsonwebtoken');
var passport = require('passport');
var Call = require('../app/models/call');
var User = require('../app/models/user');

var CallRoutes = express.Router();

/**
 * GET -> Gets a list of all unfinished calls tied to that user
 */
CallRoutes.get('/', function(req, res){
    Call.find({finished: false, responderId: req.user._id}, {__v: 0}, function(err, call){
        if(err){return res.json({success: false, error: err})}
        res.json({success: true, calls: calls});
    });
});

/**
 * POST -> Allows user to take a call by passing its id in
 */
CallRoutes.post('/', function(req, res){
    //Validate that the user is not on a call
    Call.count({finished: false, responderId: req.user._id}, function(err, count){
        if (err){
            return res.json(500, {success: false, err: err, message: "Error during validation check"})
        } else if (count > 0){
            return res.json({success: false, err: count, message:"Alredy on call"})
        }
    });
    //Validate that the user is allowed to do this
    if (['responder', 'dispatcher', 'moderator', 'admin'].indexOf(req.user.role) >= 0 && req.body.id){
        Call.findOne({_id: req.body.id}, {__v: 0}, function(err, call){
            if (err){return res.json({success: false, error: err, message: "Error getting call"})};
            call.responder = {
                name: req.user.name,
                number: req.user.number,
            };
            call.responderId = req.user._id;
            call.save(function(err, call, numAffected){
                if(err){
                    res.json({success: false, error: err, message: "Error saving updated call"});
                }
                res.json({success: true, call: call});
            });
        });
        //TODO send notificaiton to all users
    } else {
        res.json({success: false, message: 'Invalid Account Permissions'});
    }
});

CallRoutes.put('/', function(req, res){
    //TODO allow user to mark call as compleated
});

/**
 * DELETE -> Allows user to drop a call that was picked up.
 */
CallRoutes.delete('/', function(req, res){
    if (['responder', 'dispatcher', 'moderator', 'admin'].indexOf(req.user.role) >= 0 && req.body.id){
        Call.findOne({_id: req.body.id}, function(err, call){
            if (err) {res.json({success: false, error: err})};
            call.responder = {},
            call.responderId = "",
            call.save(function(err, call, rows_affected){
                if (err) {res.json({success: false, error: err})};
                res.json({success: true, call: call, rows_affected: rows_affected})
            });
        });
        //TODO send notificaiton to all users
    } else {
        res.json({success: false, message: 'Invalid Account Permissions'})
    }
});

module.exports = CallRoutes