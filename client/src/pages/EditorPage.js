// client/src/pages/EditorPage.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import QuillCursors from "quill-cursors";
import { useParams } from "react-router-dom";
import { getDocumentById, saveDocument, shareDocument } from "../api/document";
import { initializeSocket, disconnectSocket } from "../services/socketService";
import AIAssistant from "../components/AIAssistant";
import "bootstrap/dist/css/bootstrap.min.css";

// Register the cursors module once on the underlying Quill
Quill.register("modules/cursors", QuillCursors);

const EditorPage = () => {
  const { id: documentId } = useParams();

  const [documentTitle, setDocumentTitle] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [selectedText, setSelectedText] = useState("");
  const [initialQuillContent, setInitialQuillContent] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const [liveAISuggestion, setLiveAISuggestion] = useState("");

  const socketRef = useRef(null);
  const quillRef = useRef(null);
  const cursorsRef = useRef(null);
  const currentUserId = localStorage.getItem("user_id");
  const aiDebounceRef = useRef(null);

  // Fetch document (title, content, permissions)
  const fetchAndLoadDocument = useCallback(async () => {
    try {
      const res = await getDocumentById(documentId);
      setDocumentTitle(res.data.title);
      setInitialQuillContent(res.data.content);
      setCollaborators(res.data.permissions || []);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load document or access denied."
      );
      setLoading(false);
    }
  }, [documentId]);

  // Real-time AI suggestions (debounced)
  const getLiveAISuggestion = useCallback(async (text) => {
    if (text.length < 10) {
      setLiveAISuggestion("");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/ai/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setLiveAISuggestion(data.suggestion || "");
    } catch (err) {
      setLiveAISuggestion("");
    }
  }, []);

  // Save handler (auto + manual)
  const handleAutoSave = useCallback(
    async (content) => {
      try {
        setSaveStatus("Saving...");
        await saveDocument(documentId, {
          title: documentTitle,
          content,
        });
        setSaveStatus("All changes saved");
        if (socketRef.current) {
          socketRef.current.emit("document-saved", documentId);
        }
      } catch (err) {
        console.error("Save failed:", err);
        setSaveStatus("Save failed");
      }
    },
    [documentId, documentTitle]
  );

  // Load initial content into Quill and grab cursors module
  useEffect(() => {
    if (initialQuillContent && quillRef.current) {
      try {
        const editor = quillRef.current.getEditor();
        editor.setContents(initialQuillContent, "silent");
        cursorsRef.current = editor.getModule("cursors");
        console.log("Quill content and cursors module loaded successfully.");
      } catch (e) {
        console.error("Content loading failed:", e);
      }
    }
  }, [initialQuillContent]);

  // Fetch document on mount / id change
  useEffect(() => {
    fetchAndLoadDocument();
  }, [fetchAndLoadDocument]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (loading || error || !quillRef.current) return;

    const interval = setInterval(() => {
      const editor = quillRef.current.getEditor();
      handleAutoSave(editor.getContents());
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, error, handleAutoSave]);

  // Socket.io realtime collaboration (create socket ONCE per document)
  useEffect(() => {
    if (loading || error || !quillRef.current) return;

    const socket = initializeSocket();
    if (!socket) {
      console.error("Socket init failed, skipping realtime features.");
      return;
    }

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-document", documentId);
    });

    socket.on("active-users", (users) => {
      setActiveUsers(users);
    });

    socket.on("user-joined", (user) => {
      console.log(`${user.username} joined.`);
      setActiveUsers((prev) => [
        ...prev.filter((u) => u.socketId !== user.socketId),
        user,
      ]);
    });

    socket.on("user-left", ({ userId, socketId }) => {
      setActiveUsers((prev) =>
        prev.filter((user) => user.socketId !== socketId)
      );
      if (cursorsRef.current && userId) {
        cursorsRef.current.removeCursor(userId);
      }
    });

    socket.on("text-change", (delta) => {
      if (quillRef.current) {
        quillRef.current.getEditor().updateContents(delta, "silent");
      }
    });

    socket.on("cursor-move", ({ userId, cursorPosition }) => {
      if (!cursorsRef.current || !quillRef.current) return;
      if (!userId || !cursorPosition) return;

      setActiveUsers((current) => {
        const remoteUser = current.find((u) => u.userId === userId);
        const editor = quillRef.current.getEditor();

        if (remoteUser) {
          const color = stringToColor(remoteUser.username || remoteUser.userId);
          try {
            cursorsRef.current.createCursor(
              userId,
              remoteUser.username || "User",
              color
            );
          } catch (e) {
            // ignore if already exists
          }
          cursorsRef.current.moveCursor(userId, cursorPosition);
          editor.update();
        }
        return current;
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-document", documentId);
        disconnectSocket(socketRef.current);
        socketRef.current = null;
      }
      if (cursorsRef.current) {
        try {
          cursorsRef.current.cursors().forEach((c) => {
            cursorsRef.current.removeCursor(c.id);
          });
        } catch (e) {}
      }
    };
  }, [documentId, loading, error]);

  // Quill change handler with real-time AI
  const handleQuillChange = (content, delta, source, editor) => {
    const selection = editor.getSelection();
    if (selection) {
      const text = editor.getText(selection.index, selection.length).trim();
      setSelectedText(text);
    } else {
      setSelectedText("");
    }

    // Real-time AI suggestions (debounced 1.5s)
    if (source === "user") {
      if (aiDebounceRef.current) {
        clearTimeout(aiDebounceRef.current);
      }
      aiDebounceRef.current = setTimeout(() => {
        getLiveAISuggestion(editor.getText());
      }, 1500);

      if (socketRef.current) {
        socketRef.current.emit("text-change", delta);
        const range = editor.getSelection();
        if (range) {
          socketRef.current.emit("cursor-move", range);
        }
      }
    }
  };

  const handleManualSave = () => {
    if (quillRef.current) {
      handleAutoSave(quillRef.current.getEditor().getContents());
    }
  };

  const handleShare = () => {
    const email = window.prompt("Enter collaborator email:");
    if (!email) return;

    const role = window.prompt(
      "Enter role for collaborator (editor/viewer):",
      "editor"
    );
    if (!role || !["editor", "viewer"].includes(role)) {
      setShareStatus("Invalid role. Use 'editor' or 'viewer'.");
      return;
    }

    setShareStatus("Sharing...");
    shareDocument(documentId, email, role)
      .then(() => {
        setShareStatus(`Shared with ${email} as ${role}.`);
        fetchAndLoadDocument();
      })
      .catch((err) => {
        setShareStatus(
          err.response?.data?.message ||
            "Failed to share document. Only owners can share."
        );
      });
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status"></div>
        <div className="mt-2">Loading document...</div>
      </div>
    );

  if (error)
    return <div className="alert alert-danger text-center mt-5">{error}</div>;

  // Derive online/offline status
  const onlineUserIds = new Set(activeUsers.map((u) => u.userId));

  return (
    <div className="container-fluid mt-4">
      {/* Top bar */}
      <div className="row mb-3 align-items-center">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control form-control-lg border-0 fw-semibold"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            placeholder="Document Title"
          />
        </div>
        <div className="col-md-6 text-md-end mt-2 mt-md-0">
          <button className="btn btn-success me-2" onClick={handleManualSave}>
            <span className="me-1">💾</span> Manual Save
          </button>
          <span className="text-muted small me-3">{saveStatus}</span>
          <span className="badge bg-primary me-2">
            Users Online: {activeUsers.length}
          </span>
          <button className="btn btn-outline-secondary" onClick={handleShare}>
            Share
          </button>
          {shareStatus && (
            <div className="small text-muted mt-1">{shareStatus}</div>
          )}
        </div>
      </div>

      <div className="row">
        {/* Editor Column */}
        <div className="col-lg-9 mb-3">
          <div className="editor-container border rounded shadow-sm bg-white p-3">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              onChange={handleQuillChange}
              placeholder="Start writing your collaborative document here... (AI suggestions appear automatically)"
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ["bold", "italic", "underline", "strike", "blockquote"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["link", "image"],
                  ["clean"],
                ],
                cursors: true,
              }}
              formats={[
                "header",
                "bold",
                "italic",
                "underline",
                "strike",
                "blockquote",
                "list",
                "bullet",
                "link",
                "image",
                "clean",
              ]}
            />

            {/* Live AI Suggestion */}
            {liveAISuggestion && (
              <div className="mt-3 p-3 border rounded bg-light border-warning">
                <small className="text-muted mb-1 d-block">
                  💡 Live AI Suggestion:
                </small>
                <small className="text-warning fw-semibold">
                  {liveAISuggestion}
                </small>
              </div>
            )}
          </div>
        </div>

        {/* AI Assistant + Collaborators */}
        <div className="col-lg-3">
          <AIAssistant
            selectedText={selectedText}
            documentContent={
              quillRef.current && quillRef.current.getEditor
                ? quillRef.current.getEditor().getText()
                : ""
            }
          />

          {/* Single Collaborators list with status + role */}
          <div className="mt-4 p-3 border rounded bg-light shadow-sm">
            <h6 className="mb-3">Collaborators</h6>
            <ul className="list-unstyled small mb-0">
              {collaborators.length === 0 && (
                <li className="text-muted">Only you have access.</li>
              )}
              {collaborators.map((perm) => {
                const userName =
                  perm.user && perm.user.username
                    ? perm.user.username
                    : String(perm.user);
                const id =
                  perm.user && perm.user._id
                    ? String(perm.user._id)
                    : String(perm.user);
                const isOnline = onlineUserIds.has(id);
                return (
                  <li
                    key={perm._id || id}
                    className="mb-2 d-flex justify-content-between align-items-center"
                  >
                    <div className="d-flex align-items-center">
                      <span
                        className={`me-2 ${
                          isOnline ? "text-success" : "text-muted"
                        }`}
                      >
                        {isOnline ? "🟢" : "⚪"}
                      </span>
                      <span className="fw-semibold me-2">
                        {userName.charAt(0).toUpperCase() + userName.slice(1)}
                      </span>

                      {id === String(currentUserId) && (
                        <span className="badge bg-info text-dark small">
                          You
                        </span>
                      )}
                    </div>
                    <span className="badge bg-secondary text-uppercase small">
                      {perm.role}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple deterministic color generator for usernames
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

export default EditorPage;
