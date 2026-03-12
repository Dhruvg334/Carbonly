const authRoutes = require("./routes/auth");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);

const carbonRoutes = require("./routes/carbon");
app.use("/api/carbon", carbonRoutes);

app.use("/api", authRoutes)

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected ✅"))
.catch((err) => console.log("DB Error:", err));

app.get("/", (req, res) => {
    res.send("Server running successfully 🚀");
});

app.listen(5000, () => {
    console.log("Server started on port 5000");
});