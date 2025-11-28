// client/src/pages/DocumentList.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getDocuments, createDocument, deleteDocument } from "../api/document";
import { useAuth } from "../hooks/useAuth";
import "bootstrap/dist/css/bootstrap.min.css";

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("Untitled Document");
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await getDocuments();
      setDocuments(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch documents. Please try logging in again.");
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await createDocument(newTitle);
      navigate(`/documents/${res.data._id}`);
    } catch (err) {
      setError("Failed to create document.");
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteDocument(id);
        setDocuments((docs) => docs.filter((doc) => doc._id !== id));
      } catch (err) {
        setError("Failed to delete document. You must be the owner.");
      }
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status"></div>
      </div>
    );

  return (
    <div className="container mt-4">
      <h1 className="mb-4">
        <span className="me-2">📁</span>My Documents
      </h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card mb-4 p-3 shadow-sm">
        <form onSubmit={handleCreate} className="d-flex align-items-center">
          <input
            type="text"
            className="form-control me-2"
            placeholder="New Document Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-success">
            <span className="me-1">➕</span> Create New Document
          </button>
        </form>
      </div>

      <div className="list-group">
        {documents.length === 0 ? (
          <div className="alert alert-info text-center">
            No documents found. Create one above!
          </div>
        ) : (
          documents.map((doc) => {
            const userPermission = doc.permissions.find(
              (p) => p.user._id === user._id
            );
            const role = userPermission ? userPermission.role : "viewer";

            return (
              <div
                key={doc._id}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              >
                <div>
                  <Link
                    to={`/documents/${doc._id}`}
                    className="h5 text-primary text-decoration-none"
                  >
                    {doc.title}
                  </Link>
                  <small className="ms-3 badge bg-secondary">
                    {role.toUpperCase()}
                  </small>
                  <small className="ms-3 text-muted">
                    Last Updated: {new Date(doc.updatedAt).toLocaleDateString()}
                  </small>
                </div>
                <div>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(doc._id, doc.title)}
                    disabled={role !== "owner"}
                  >
                    <span className="me-1">🗑️</span>Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DocumentList;
