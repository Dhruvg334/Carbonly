const mongoose = require("mongoose");

const carbonSchema = new mongoose.Schema({
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    energy_kwh: {
        type: Number,
        required: true
    },

    transport_km: {
        type: Number,
        required: true
    },

    electricity_consumption: {
        type: Number,
        required: true
    },

    water_usage: {
        type: Number,
        required: true
    },

    flights_taken: {
        type: Number,
        required: true
    },

    energy_carbon: {
        type: Number
    },

    activity_carbon: {
        type: Number
    },

    carbonEmission: {
        type: Number,
        required: true
    },

    weeklyCarbonEstimate: {
        type: Number
    },

    recommendations: {
        type: [String]
    },

    timestamp: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("CarbonData", carbonSchema);