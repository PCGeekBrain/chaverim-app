var express = require('express');
var config = require("../config/main");
var jwt = require('jsonwebtoken');
var passport = require('passport');
var Call = require('../app/models/call');

var CallRoutes = express.Router();

CallRoutes.get('/', function(req, res){
    Call.find({finished: false}, {__v: 0}, function(err, calls){
        if(err){return res.json({success: false, error: err})}
        res.json({success: true, calls: calls})
    });
});

CallRoutes.post('/', function(req, res){
    if (['dispatcher', 'moderator', 'admin'].indexOf(req.user.role) >= 0){
        let call = new Call({
            title: req.body.title,
            details: req.body.details,
            caller: {
                location: req.body.location,
                name: req.body.name,
                number: req.body.number,
            },
        });
        call.save();
        res.json({success: true, call: call})
        //TODO send notificaiton to all users
    } else {
        res.json({success: false, message: 'Invalid Account Permissions'})
    }
});

CallRoutes.delete('/', function(req, res){
    if (['moderator', 'admin'].indexOf(req.user.role) >= 0){
        Call.findOneAndRemove({_id: req.body.id}, function(err, call){
            if (err) {res.json({success: false, error, err})};
            res.json({success: true, call: call})
        });
        
        //TODO send notificaiton to all users
    } else {
        res.json({success: false, message: 'Invalid Account Permissions'})
    }
})

module.exports = CallRoutes