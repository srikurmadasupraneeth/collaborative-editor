const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  grammarCheck,
  enhanceText,
  summarizeText,
  smartAutocomplete,
} = require("../services/geminiService");

// Validate text before sending to AI
const validateText = (req, res, next) => {
  const { text } = req.body;
  if (!text || typeof text !== "string" || text.trim().length < 5) {
    return res.status(400).json({
      message: "Invalid or insufficient text provided for AI analysis.",
    });
  }
  next();
};

// Generic retry wrapper (2 attempts)
const runWithRetry = async (aiFunction, text, res, type) => {
  try {
    // First attempt
    const result = await aiFunction(text);
    return res.json(result);
  } catch (error) {
    console.log(`⚠️ AI Error on first attempt (${type}). Retrying in 1s...`);

    // Wait 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      // Second attempt
      const result = await aiFunction(text);
      return res.json(result);
    } catch (err) {
      console.log(`❌ AI failed again (${type}).`);
      return res.status(503).json({
        message: `AI Service Error: Failed to ${type}.`,
        error: err.message,
      });
    }
  }
};

// Grammar Check
router.post("/grammar-check", protect, validateText, async (req, res) => {
  return runWithRetry(
    async (txt) => ({ suggestion: await grammarCheck(txt) }),
    req.body.text,
    res,
    "check grammar"
  );
});

// Enhance Text
router.post("/enhance", protect, validateText, async (req, res) => {
  return runWithRetry(
    async (txt) => ({ suggestion: await enhanceText(txt) }),
    req.body.text,
    res,
    "enhance text"
  );
});

// Summarize Text
router.post("/summarize", protect, validateText, async (req, res) => {
  return runWithRetry(
    async (txt) => ({ summary: await summarizeText(txt) }),
    req.body.text,
    res,
    "summarize text"
  );
});

// Auto-complete
router.post("/complete", protect, validateText, async (req, res) => {
  return runWithRetry(
    async (txt) => ({ completion: await smartAutocomplete(txt) }),
    req.body.text,
    res,
    "auto-complete text"
  );
});

// Suggestions
router.post("/suggestions", protect, validateText, async (req, res) => {
  return runWithRetry(
    async (txt) => ({ suggestion: await smartAutocomplete(txt) }),
    req.body.text,
    res,
    "generate suggestions"
  );
});

module.exports = router;
