// server/routes/aiRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  grammarCheck,
  enhanceText,
  summarizeText,
  smartAutocomplete,
} = require("../services/geminiService");

const validateText = (req, res, next) => {
  const { text } = req.body;
  if (!text || typeof text !== "string" || text.length < 5) {
    return res.status(400).json({
      message: "Invalid or insufficient text provided for AI analysis.",
    });
  }
  next();
};

router.post("/grammar-check", protect, validateText, async (req, res) => {
  try {
    const result = await grammarCheck(req.body.text);
    res.json({ suggestion: result });
  } catch (error) {
    res.status(503).json({
      message: "AI Service Error: Failed to check grammar.",
      error: error.message,
    });
  }
});

router.post("/enhance", protect, validateText, async (req, res) => {
  try {
    const result = await enhanceText(req.body.text);
    res.json({ suggestion: result });
  } catch (error) {
    res.status(503).json({
      message: "AI Service Error: Failed to enhance text.",
      error: error.message,
    });
  }
});

router.post("/summarize", protect, validateText, async (req, res) => {
  try {
    const result = await summarizeText(req.body.text);
    res.json({ summary: result });
  } catch (error) {
    res.status(503).json({
      message: "AI Service Error: Failed to summarize text.",
      error: error.message,
    });
  }
});

router.post("/complete", protect, validateText, async (req, res) => {
  try {
    const result = await smartAutocomplete(req.body.text);
    res.json({ completion: result });
  } catch (error) {
    res.status(503).json({
      message: "AI Service Error: Failed to get auto-completion.",
      error: error.message,
    });
  }
});

router.post("/suggestions", protect, validateText, async (req, res) => {
  try {
    const result = await smartAutocomplete(req.body.text);
    res.json({ suggestion: result });
  } catch (error) {
    res.status(503).json({
      message: "AI Service Error: Failed to get suggestions.",
      error: error.message,
    });
  }
});

module.exports = router;
