// server/routes/documentRoutes.js
const express = require("express");
const router = express.Router();
const Document = require("../models/Document");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const mongoose = require("mongoose");

const checkPermission = (doc, userId, roles) => {
  const userPermission = doc.permissions.find((p) => {
    const permUserId = p.user && p.user._id ? p.user._id : p.user;
    return String(permUserId) === String(userId);
  });
  return userPermission && roles.includes(userPermission.role);
};

router.get("/", protect, async (req, res) => {
  try {
    const documents = await Document.find({ "permissions.user": req.user._id })
      .select("-content")
      .populate("permissions.user", "username email");

    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching documents" });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const newDoc = new Document({
      title: req.body.title || "Untitled Document",
      permissions: [{ user: req.user._id, role: "owner" }],
    });

    const createdDoc = await newDoc.save();
    res.status(201).json(createdDoc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error creating document" });
  }
});

router.get("/:id", protect, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Document not found" });
  }

  try {
    const document = await Document.findById(req.params.id).populate(
      "permissions.user",
      "username email"
    );

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (
      !checkPermission(document, req.user._id, ["owner", "editor", "viewer"])
    ) {
      return res.status(403).json({
        message:
          "Access denied: You do not have permission to view this document.",
      });
    }

    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching document" });
  }
});

router.put("/:id", protect, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Document not found" });
  }

  try {
    const document = await Document.findById(req.params.id).populate(
      "permissions.user",
      "username email"
    );

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (!checkPermission(document, req.user._id, ["owner", "editor"])) {
      return res
        .status(403)
        .json({ message: "Access denied: Only owners and editors can save." });
    }

    document.title = req.body.title || document.title;
    document.content = req.body.content || document.content;

    const updatedDoc = await document.save();

    res.json({ message: "Document saved successfully", doc: updatedDoc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error saving document" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Document not found" });
  }

  try {
    const document = await Document.findById(req.params.id).populate(
      "permissions.user",
      "username email"
    );

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (!checkPermission(document, req.user._id, ["owner"])) {
      return res.status(403).json({
        message: "Access denied: Only the owner can delete this document.",
      });
    }

    await document.deleteOne();
    res.json({ message: "Document removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error deleting document" });
  }
});

router.post("/:id/share", protect, async (req, res) => {
  const { email, role } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Document not found" });
  }

  try {
    const document = await Document.findById(req.params.id);
    const userToShareWith = await User.findOne({ email });

    if (!document || !userToShareWith) {
      return res.status(404).json({ message: "Document or user not found" });
    }

    if (!checkPermission(document, req.user._id, ["owner"])) {
      return res.status(403).json({
        message: "Access denied: Only the owner can manage sharing.",
      });
    }

    if (userToShareWith._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "Cannot change your own role via sharing endpoint.",
      });
    }

    const existingPermissionIndex = document.permissions.findIndex((p) => {
      const permUserId = p.user && p.user._id ? p.user._id : p.user;
      return String(permUserId) === String(userToShareWith._id);
    });

    if (existingPermissionIndex > -1) {
      document.permissions[existingPermissionIndex].role = role;
    } else {
      document.permissions.push({ user: userToShareWith._id, role });
    }

    await document.save();
    res.json({ message: `${userToShareWith.email} granted ${role} access.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error sharing document" });
  }
});

module.exports = router;
