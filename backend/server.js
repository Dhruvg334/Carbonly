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
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/carbonly")
    .then(() => {
        console.log("Database connection established.");
    })
    .catch((err) => {
        console.error("Database connection error:", err.message);
    });

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});