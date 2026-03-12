const express = require("express");
const router = express.Router();
const axios = require("axios");

const Carbon = require("../models/CarbonData");
const authMiddleware = require("../middleware/authMiddleware");


router.post("/add", authMiddleware, async (req, res) => {

    try {

        const {
            energy_kwh,
            transport_km,
            electricity_consumption,
            water_usage,
            flights_taken
        } = req.body;

        console.log("DATA SENT TO ML:", {
            energy_kwh,
            transport_km,
            electricity_consumption,
            water_usage,
            flights_taken
        });

        const mlResponse = await axios.post(
            "http://127.0.0.1:8000/predict-carbon",
            {
                energy_kwh,
                transport_km,
                electricity_consumption,
                water_usage,
                flights_taken
            }
        );

        console.log("ML RESPONSE:", mlResponse.data);

        const carbon = mlResponse.data.final_carbon_emission;

        const newEntry = new Carbon({
            userId: req.user.id,
            energy_kwh,
            transport_km,
            electricity_consumption,
            water_usage,
            flights_taken,
            carbonEmission: carbon
        });

        await newEntry.save();

        res.status(200).json({
            message: "Carbon calculated successfully",
            data: mlResponse.data
        });

    } catch (error) {

        console.log("ERROR:", error.response?.data || error.message);

        res.status(500).json({
            message: "ML prediction failed",
            error: error.response?.data || error.message
        });

    }

});


router.get("/my-data", authMiddleware, async (req, res) => {

    try {

        const data = await Carbon.find({
            userId: req.user.id
        });

        res.json(data);

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

});


module.exports = router;