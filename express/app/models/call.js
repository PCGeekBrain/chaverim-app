var mongoose = require("mongoose")
var Schema = mongoose.Schema;

// Call Schema
var CallSchema = new Schema({
    title: String,
    details: String,
    taken: {type: Boolean, default: false},
    finished: {type: Boolean, index: true, default: false},
    caller: {
        location: String,
        name: {type: String, default: ""},
        number: String,
    },
    responderId: String,
    responder: {
        name: String,
        number: String,
    },
    backupId: String,
    backup: {
        name: String,
        number: String,
    },
    createdAt: { type : Date, default: Date.now },
});


module.exports = mongoose.model('Call', CallSchema);