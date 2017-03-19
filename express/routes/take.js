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
    Call.find({finished: false, responderId: req.user._id}, {__v: 0}, function(err, calls){
        if(err){return res.status(500).json({success: false, error: err, message: "Internal Server Error"})}
        res.status(200).json({success: true, calls: calls});
    });
});

CallRoutes.get('/all', function(req, res){
    Call.find({responderId: req.user._id}, {__v: 0}, function(err, calls){
        if(err){return res.status(500).json({success: false, error: err, message: "Internal Server Error"})}
        res.status(200).json({success: true, calls: calls});
    });
});

CallRoutes.get('/count', function(req, res){
    Call.count({responderId: req.user._id}, function(err, count){
        if(err){
            res.status(500).json({success: false, error: err, message: "Internal Server Error"});
        } else {
            res.status(200).json({success: true, count: count});
        }
    });
});

/**
 * POST -> Allows user to take a call by passing its id in
 */
CallRoutes.post('/', function(req, res){
    //Validate that the user is allowed to do this
    if (['responder', 'dispatcher', 'moderator', 'admin'].indexOf(req.user.role) >= 0){
        if(req.body.id){
            Call.findOne({finished: false, _id: req.body.id}, {__v: 0}, function(err, call){
                if (err){
                    return res.status(500).json({success: false, error: err, message: "Internal Server Error"})
                };
                if (call == null){
                    return res.status(400).json({success: false, message:"Call does not exist"})
                } else if (call.responderId != "") {
                    return res.status(400).json({success: false, message:"Call Already Taken"})
                } else {
                    call.responder = {
                        name: req.user.name,
                        number: req.user.number,
                    };
                    call.responderId = req.user._id;
                    call.taken = true;
                    call.save(function(err, call, numAffected){
                        if(err){
                            return res.status(500).json({success: false, error: err, message: "Internal Server Error"});
                        }
                        return res.status(200).json({success: true, call: call});
                    });
                }
            });
            //TODO send notificaiton to all users
        } else {
            console.log(req.body);
            return res.status(400).json({success: false, message: 'No ID given'});
        }
    } else {
        return res.status(403).json({success: false, message: 'Invalid Account Permissions'});
    }
});

/**
 * PUT -> update call as compleated
 */
CallRoutes.put('/', function(req, res){
    Call.findOne({_id: req.body.id}, function(err, call){
        if (err) {
            return res.status(500).json({success: false, message: "Internal Server Error"});
        } else if (call == null) {
            return res.status(400).json({success: false, message: "Call Does Not Exist"})
        } else if (call.responderId == req.user._id || ['dispatcher', 'moderator', 'admin'].indexOf(req.user.role) >= 0){
            if (call.finished){
                return res.status(400).json({success: false, message: "Call already compleated"});
            }
            call.finished = true;
            call.save(function(err, call, rows_affected){
                if (err) {return res.status(500).json({success: false, message: "Internal Server Error"})};
                res.status(200).json({success: true, message: "Call completed", call: call, rows_affected: rows_affected});
            });
        } else {
            res.status(400).json({
                success: false,
                message: "You cannot complete other responders calls",
            })
        }
    });
});

/**
 * DELETE -> Allows user to drop a call that was picked up.
 */
CallRoutes.delete('/', function(req, res){
    if (['responder', 'dispatcher', 'moderator', 'admin'].indexOf(req.user.role) >= 0 && req.headers.id){
        Call.findOne({_id: req.headers.id}, function(err, call){
            if (err) {res.status(500).json({success: false, error: err, message: "Internal Server Error"})};
            if (call === null){
                return res.status(400).json({success: false, message: "Call does not exist"});
            }
            if (call.responderId == req.user._id || ['dispatcher', 'moderator', 'admin'].indexOf(req.user.role) >= 0){
                call.responder = {};
                call.responderId = "";
                call.taken = false;
                call.save(function(err, call, rows_affected){
                    if (err) {res.status(500).json({success: false, error: err , message: "Internal Server Error"})};
                    res.status(200).json({success: true, call: call, rows_affected: rows_affected});
                });
            } else {
                return res.status(400).json({success: false, message: "Cannot drop other responders calls"});
            }
        });
        //TODO send notificaiton to all users
    } else {
        res.status(403).json({success: false, message: 'Invalid Account Permissions'});
    }
});

module.exports = CallRoutes