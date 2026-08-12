const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");
const History = require("../models/history");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Fallback in-memory stores for zero-config deployments when MongoDB is not attached
const inMemoryUsers = [];
const inMemoryHistory = [];

function isDbConnected() {
    return mongoose.connection && mongoose.connection.readyState === 1;
}

router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
        if (!passwordPattern.test(password)) {
            return res.status(400).json({
                message: "Password must contain at least one letter, one number, and be at least 6 characters long"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (isDbConnected()) {
            const existingUser = await User.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                return res.status(400).json({ message: "Username or email already exists" });
            }
            const newUser = new User({ username, email, password: hashedPassword });
            await newUser.save();
        } else {
            const existing = inMemoryUsers.find(u => u.username === username || u.email === email);
            if (existing) {
                return res.status(400).json({ message: "Username or email already exists" });
            }
            const newUser = {
                _id: "mem_" + Math.random().toString(36).substring(2, 9),
                username,
                email,
                password: hashedPassword,
                createdAt: new Date().toISOString()
            };
            inMemoryUsers.push(newUser);
        }

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let user = null;
        if (isDbConnected()) {
            user = await User.findOne({ username });
        } else {
            user = inMemoryUsers.find(u => u.username === username);
        }

        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const userId = user._id ? user._id.toString() : user.id;
        const token = jwt.sign(
            { id: userId, username: user.username },
            process.env.JWT_SECRET || "carbonly_super_secret_jwt_key_2026",
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: userId,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
});

router.get("/profile", authMiddleware, async (req, res) => {
    try {
        let user = null;
        if (isDbConnected()) {
            user = await User.findById(req.user.id).select("-password");
        } else {
            user = inMemoryUsers.find(u => u._id === req.user.id);
            if (user) {
                const { password, ...userWithoutPass } = user;
                user = userWithoutPass;
            }
        }

        if (!user) {
            // Fallback for profile token payload
            return res.json({
                _id: req.user.id,
                username: req.user.username || "Sustainability User",
                email: "user@carbonly.io"
            });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error retrieving profile" });
    }
});

router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const secret = process.env.RESET_TOKEN_SECRET || process.env.JWT_SECRET || "default_reset_secret";
        const token = jwt.sign({ email }, secret, { expiresIn: "15m" });

        res.json({
            message: "If that email exists in our system, a reset link has been generated.",
            token
        });
    } catch (error) {
        res.status(500).json({ message: "Server error generating reset link" });
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

        if (isDbConnected() && decoded.id) {
            await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });
        } else if (decoded.email) {
            const user = inMemoryUsers.find(u => u.email === decoded.email);
            if (user) user.password = hashedPassword;
        }

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(400).json({ message: "Invalid or expired reset token" });
    }
});

router.post("/save-history", authMiddleware, async (req, res) => {
    try {
        const { week, distance, screen, internet, water, air } = req.body;

        if (isDbConnected()) {
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
        } else {
            inMemoryHistory.push({
                userId: req.user.id,
                week: week || new Date().toISOString(),
                distance,
                screen,
                internet,
                water,
                air,
                timestamp: new Date().toISOString()
            });
        }

        res.status(201).json({ message: "History entry saved successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error saving history entry" });
    }
});

router.get("/history", authMiddleware, async (req, res) => {
    try {
        if (isDbConnected()) {
            const history = await History.find({ userId: req.user.id }).sort({ week: 1 });
            return res.json(history);
        } else {
            const history = inMemoryHistory.filter(h => h.userId === req.user.id);
            return res.json(history);
        }
    } catch (err) {
        res.status(500).json({ error: "Server error retrieving history" });
    }
});

router.delete("/history", authMiddleware, async (req, res) => {
    try {
        if (isDbConnected()) {
            await History.deleteMany({ userId: req.user.id });
        } else {
            const remaining = inMemoryHistory.filter(h => h.userId !== req.user.id);
            inMemoryHistory.length = 0;
            inMemoryHistory.push(...remaining);
        }
        res.json({ message: "History cleared successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error clearing history" });
    }
});

module.exports = router;