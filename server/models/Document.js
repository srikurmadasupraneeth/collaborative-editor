// server/models/Document.js
const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      // role-based access control (owner, editor, viewer)
      type: String,
      enum: ["owner", "editor", "viewer"],
      required: true,
    },
  },
  { _id: false }
);

const DocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: "Untitled Document",
    },
    content: {
      type: Object,
      default: [{ insert: "Start typing here..." }],
    },
    permissions: [PermissionSchema],
  },
  { timestamps: true }
);

DocumentSchema.virtual("owner").get(function () {
  return this.permissions.find((p) => p.role === "owner");
});

const Document = mongoose.model("Document", DocumentSchema);

module.exports = Document;
