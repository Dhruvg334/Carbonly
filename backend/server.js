const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const carbonRoutes = require("./routes/carbon");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/carbon", carbonRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        databaseConnected: mongoose.connection && mongoose.connection.readyState === 1,
        timestamp: new Date().toISOString()
    });
});

// Attempt MongoDB Connection if MONGO_URI is provided
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log("MongoDB Database connection established.");
        })
        .catch((err) => {
            console.warn("MongoDB connection warning (falling back to in-memory store):", err.message);
        });
} else {
    console.log("No MONGO_URI provided. Operating with in-memory zero-config store fallback.");
}

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});