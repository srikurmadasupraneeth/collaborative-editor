// server/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ username, email, password });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
});

router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully (client to clear token)" });
});

module.exports = router;
