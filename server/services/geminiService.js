// server/services/geminiService.js
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
const model = "gemini-2.5-flash";

const getGeminiResponse = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to get response from AI assistant.");
  }
};

const grammarCheck = async (text) => {
  const prompt = `Please act as a grammar and style checker. Review the following text and return ONLY the corrected text. Do not add any extra explanations, notes, or preambles: "${text}"`;
  return getGeminiResponse(prompt);
};

const enhanceText = async (text) => {
  const prompt = `Please enhance the following text for clarity, tone, and readability. Return ONLY the improved text. Do not add any extra explanations or preambles: "${text}"`;
  return getGeminiResponse(prompt);
};

const summarizeText = async (text) => {
  const prompt = `Please summarize the following text concisely. Return ONLY the summary. Do not add any extra explanations or preambles: "${text}"`;
  return getGeminiResponse(prompt);
};

const smartAutocomplete = async (text) => {
  const prompt = `Based on the preceding text, provide a smart, context-aware auto-completion or continuation for the last sentence/phrase. Return ONLY the completion text (e.g., 'to the office' or 'is a challenging task'). Preceding text: "${text}"`;
  return getGeminiResponse(prompt);
};

module.exports = {
  grammarCheck,
  enhanceText,
  summarizeText,
  smartAutocomplete,
};
