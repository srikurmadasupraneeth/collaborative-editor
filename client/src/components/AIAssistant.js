// client/src/components/AIAssistant.js
import React, { useState } from "react";
import {
  checkGrammar,
  enhanceText,
  summarizeText,
  getSuggestions,
  getAutocomplete,
} from "../api/document";
import "bootstrap/dist/css/bootstrap.min.css";

const AIAssistant = ({ selectedText, documentContent }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const textToAnalyze = selectedText || documentContent;

  const handleAction = async (apiCall, isSummary = false) => {
    if (!textToAnalyze || textToAnalyze.length < 5) {
      setError("Select some text in the editor or type more content first.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await apiCall(textToAnalyze);
      if (isSummary) {
        setResult({ type: "Summary", text: res.data.summary });
      } else {
        setResult({
          type: "Suggestion/Correction",
          text:
            res.data.suggestion ||
            res.data.completion ||
            res.data.summary ||
            "",
        });
      }
    } catch (err) {
      console.error("AI Error:", err);
      setError(
        err.response?.data?.message ||
          "AI service is unavailable right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-info text-white">
        <span className="me-2">🧠</span> AI Writing Assistant
      </div>
      <div className="card-body">
        <p className="small text-muted">
          {selectedText
            ? `Using selected text: "${selectedText.substring(0, 50)}..."`
            : "You can do any of this tasks."}
        </p>

        <div className="d-grid gap-2 mb-3">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => handleAction(checkGrammar)}
            disabled={loading}
          >
            <span className="me-1">✍️</span> Grammar & Style Check
          </button>
          <button
            className="btn btn-outline-success btn-sm"
            onClick={() => handleAction(enhanceText)}
            disabled={loading}
          >
            <span className="me-1">✨</span> Enhance Writing
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => handleAction(summarizeText, true)}
            disabled={loading}
          >
            <span className="me-1">📚</span> Summarize (Document)
          </button>
          <button
            className="btn btn-outline-warning btn-sm"
            onClick={() => handleAction(getSuggestions)}
            disabled={loading}
          >
            <span className="me-1">💡</span> Smart Suggestions
          </button>
          <button
            className="btn btn-outline-dark btn-sm"
            onClick={() => handleAction(getAutocomplete)}
            disabled={loading}
          >
            <span className="me-1">⚡</span> Smart Auto-complete
          </button>
        </div>

        {loading && (
          <div className="text-center">
            <div
              className="spinner-border spinner-border-sm"
              role="status"
            ></div>{" "}
            Loading...
          </div>
        )}

        {error && <div className="alert alert-danger mt-3 small">{error}</div>}

        {result && (
          <div className="mt-3 p-3 border rounded bg-light">
            <h6 className="mb-1">{result.type}</h6>
            <p className="mb-0 small text-dark">{result.text}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
