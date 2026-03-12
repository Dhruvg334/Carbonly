const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    week: Number,
    distance: Number,
    screen: Number,
    internet: Number,
    water: String,
    air: String,

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("History", historySchema);