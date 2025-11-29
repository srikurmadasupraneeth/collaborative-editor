const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  grammarCheck,
  enhanceText,
  summarizeText,
  smartAutocomplete,
} = require("../services/geminiService");

/**
 * Helper: call an async fn with retries
 * @param {Function} fn - async function to call
 * @param {Array} args - arguments array
 * @param {number} retries - number of retries (default 1 retry)
 * @param {number} delayMs - delay between retries in ms
 */
const callWithRetry = async (fn, args = [], retries = 1, delayMs = 1000) => {
  try {
    return await fn(...args);
  } catch (err) {
    if (retries <= 0) throw err;
    console.warn("AI call failed, retrying...", { message: err.message });
    await new Promise((r) => setTimeout(r, delayMs));
    return callWithRetry(fn, args, retries - 1, delayMs);
  }
};

const validateText = (req, res, next) => {
  const { text } = req.body;
  if (!text || typeof text !== "string" || text.length < 5) {
    return res.status(400).json({
      message: "Invalid or insufficient text provided for AI analysis.",
    });
  }
  next();
};

// grammar-check
router.post("/grammar-check", protect, validateText, async (req, res) => {
  try {
    const result = await callWithRetry(grammarCheck, [req.body.text], 1, 1000);
    res.json({ suggestion: result });
  } catch (error) {
    console.error("AI grammar-check error:", error);
    res.status(503).json({
      message: "AI Service Error: Failed to check grammar.",
      error: error.message,
    });
  }
});

// enhance
router.post("/enhance", protect, validateText, async (req, res) => {
  try {
    const result = await callWithRetry(enhanceText, [req.body.text], 1, 1000);
    res.json({ suggestion: result });
  } catch (error) {
    console.error("AI enhance error:", error);
    res.status(503).json({
      message: "AI Service Error: Failed to enhance text.",
      error: error.message,
    });
  }
});

// summarize
router.post("/summarize", protect, validateText, async (req, res) => {
  try {
    const result = await callWithRetry(summarizeText, [req.body.text], 1, 1000);
    res.json({ summary: result });
  } catch (error) {
    console.error("AI summarize error:", error);
    res.status(503).json({
      message: "AI Service Error: Failed to summarize text.",
      error: error.message,
    });
  }
});

// complete (autocomplete)
router.post("/complete", protect, validateText, async (req, res) => {
  try {
    const result = await callWithRetry(
      smartAutocomplete,
      [req.body.text],
      1,
      1000
    );
    res.json({ completion: result });
  } catch (error) {
    console.error("AI autocomplete error:", error);
    res.status(503).json({
      message: "AI Service Error: Failed to get auto-completion.",
      error: error.message,
    });
  }
});

// suggestions (smart suggestions)
router.post("/suggestions", protect, validateText, async (req, res) => {
  try {
    const result = await callWithRetry(
      smartAutocomplete,
      [req.body.text],
      1,
      1000
    );
    res.json({ suggestion: result });
  } catch (error) {
    console.error("AI suggestions error:", error);
    res.status(503).json({
      message: "AI Service Error: Failed to get suggestions.",
      error: error.message,
    });
  }
});

module.exports = router;
