// client/src/api/document.js
import api from "./api";

export const getDocuments = () => api.get("/documents");
export const createDocument = (title) => api.post("/documents", { title });
export const getDocumentById = (id) => api.get(`/documents/${id}`);
export const saveDocument = (id, data) => api.put(`/documents/${id}`, data);
export const deleteDocument = (id) => api.delete(`/documents/${id}`);
export const shareDocument = (id, email, role) =>
  api.post(`/documents/${id}/share`, { email, role });

export const checkGrammar = (text) => api.post("/ai/grammar-check", { text });
export const enhanceText = (text) => api.post("/ai/enhance", { text });
export const summarizeText = (text) => api.post("/ai/summarize", { text });
export const getAutocomplete = (text) => api.post("/ai/complete", { text });
export const getSuggestions = (text) => api.post("/ai/suggestions", { text });
