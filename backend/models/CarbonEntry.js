const mongoose = require("mongoose");

const carbonEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    activityData: {
        transportKm: { type: Number, default: 0 },
        vehicleType: { type: String, default: "default" },
        electricityKwh: { type: Number, default: 0 },
        region: { type: String, default: "GLOBAL" },
        flightsTaken: { type: Number, default: 0 },
        flightType: { type: String, default: "short" },
        waterLiters: { type: Number, default: 0 },
        screenHours: { type: Number, default: 0 },
        internetGb: { type: Number, default: 0 }
    },
    emissions: {
        totalKg: { type: Number, required: true },
        totalTonnes: { type: Number, required: true },
        scopes: {
            scope1: {
                kg: { type: Number, default: 0 },
                percentage: { type: Number, default: 0 },
                category: { type: String, default: "Direct Fleet & Vehicle Transport" }
            },
            scope2: {
                kg: { type: Number, default: 0 },
                percentage: { type: Number, default: 0 },
                category: { type: String, default: "Purchased Electricity" }
            },
            scope3: {
                kg: { type: Number, default: 0 },
                percentage: { type: Number, default: 0 },
                categories: {
                    flights: { type: Number, default: 0 },
                    water: { type: Number, default: 0 },
                    digital: { type: Number, default: 0 }
                }
            }
        },
        breakdown: {
            transportKg: { type: Number, default: 0 },
            electricityKg: { type: Number, default: 0 },
            flightsKg: { type: Number, default: 0 },
            waterKg: { type: Number, default: 0 },
            digitalKg: { type: Number, default: 0 }
        }
    },
    anomalyReport: {
        isAnomaly: { type: Boolean, default: false },
        zScore: { type: Number, default: 0 },
        variancePercentage: { type: Number, default: 0 },
        primaryContributor: { type: String, default: null },
        message: { type: String, default: "" }
    },
    recommendations: [{
        type: String
    }],
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

carbonEntrySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model("CarbonEntry", carbonEntrySchema);
