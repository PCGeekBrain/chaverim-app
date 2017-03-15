var mongoose = require("mongoose")
var Schema = mongoose.Schema;

// Call Schema
var CallSchema = new Schema({
    title: String,
    details: String,
    taken: Boolean,
    finished: {type: Boolean, index: true, default: false},
    caller: {
        location: String,
        name: String,
        number: String,
    },
    responderId: String,
    responder: {
        name: String,
        number: String,
    },
});


module.exports = mongoose.model('Call', CallSchema);