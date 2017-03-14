var mongoose = require("mongoose")
var Schema = mongoose.Schema;

// Call Schema
var CallSchema = new Schema({
    title: String,
    details: String,
    taken: Boolean,
    finished: Boolean,
    Caller: {
        Location: String,
        Name: String,
        Number: String,
    },
    ResponderId: String,
});


module.exports = mongoose.model('Call', CallSchema);