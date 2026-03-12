const authMiddleware = require("../middleware/authMiddleware");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const History = require("../models/history");

const router = express.Router();


// ===================== Register User =====================
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Password validation
        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

        if (!passwordPattern.test(password)) {
            return res.status(400).json({
                message: "Password must contain at least one letter, one number, and be at least 6 characters long"
            });
        }

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});


// ===================== Login =====================
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign(
            {
                id: user._id,
                username: user.username
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            token
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// =================== Forgot Password ======================
router.post("/forgot-password", async (req, res) => {

    const { email } = req.body

    const user = await User.findOne({ email })

    if (!user) {
        return res.json({ message: "Email not registered" })
    }

    const token = jwt.sign({ id: user._id }, "resetSecret", { expiresIn: "15m" })

    res.json({
        message: "Reset link generated",
        resetLink: `http://localhost:5500/reset-password.html?token=${token}`
    })

    console.log("Forgot password route hit")

})

// =================== Reset Password =======================
router.post("/reset-password", async (req, res) => {

    const { token, password } = req.body

    try {

        const decoded = jwt.verify(token, "resetSecret")

        const hashed = await bcrypt.hash(password, 10)

        await User.findByIdAndUpdate(decoded.id, {
            password: hashed
        })

        res.json({ message: "Password updated successfully" })

    }
    catch (err) {

        res.json({ message: "Invalid or expired link" })

    }

})

// ================ User History ==================
router.post("/save-history", async (req, res) => {

    try {

        const { week, distance, screen, internet, water, air } = req.body;

        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const history = new History({
            userId: decoded.id,
            week,
            distance,
            screen,
            internet,
            water,
            air
        });

        await history.save();

        res.json({ message: "History saved" });

    } catch (err) {

        res.status(500).json({ error: "Server error" });

    }

});

// =============== Get History ===============
router.get("/history", async (req, res) => {

    try {

        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const history = await History.find({ userId: decoded.id }).sort({ week: 1 });

        res.json(history);

    } catch (err) {

        res.status(500).json({ error: "Server error" });

    }

});

// ============= Clear History ================
router.delete("/history", async (req,res)=>{

const token = req.headers.authorization.split(" ")[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);

await History.deleteMany({userId:decoded.id});

res.json({message:"History cleared"});

});

module.exports = router;