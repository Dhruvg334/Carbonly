const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const History = require("../models/history");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        if (!passwordPattern.test(password)) {
            return res.status(400).json({
                message: "Password must contain at least one letter, one number, and be at least 6 characters long"
            });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username or email already exists" });
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
            { id: user._id, username: user.username },
            process.env.JWT_SECRET || "default_jwt_secret",
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: "If that email exists in our system, a reset link has been generated." });
        }

        const secret = process.env.RESET_TOKEN_SECRET || process.env.JWT_SECRET || "default_reset_secret";
        const token = jwt.sign({ id: user._id }, secret, { expiresIn: "15m" });

        res.json({
            message: "Reset token generated",
            token
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/reset-password", async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ message: "Token and new password are required" });
        }

        const secret = process.env.RESET_TOKEN_SECRET || process.env.JWT_SECRET || "default_reset_secret";
        const decoded = jwt.verify(token, secret);

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(400).json({ message: "Invalid or expired reset token" });
    }
});

router.post("/save-history", authMiddleware, async (req, res) => {
    try {
        const { week, distance, screen, internet, water, air } = req.body;

        const history = new History({
            userId: req.user.id,
            week,
            distance,
            screen,
            internet,
            water,
            air
        });

        await history.save();
        res.status(201).json({ message: "History entry saved successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error saving history entry" });
    }
});

router.get("/history", authMiddleware, async (req, res) => {
    try {
        const history = await History.find({ userId: req.user.id }).sort({ week: 1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: "Server error retrieving history" });
    }
});

router.delete("/history", authMiddleware, async (req, res) => {
    try {
        await History.deleteMany({ userId: req.user.id });
        res.json({ message: "History cleared successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error clearing history" });
    }
});

module.exports = router;