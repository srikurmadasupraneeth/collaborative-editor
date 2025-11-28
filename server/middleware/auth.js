// server/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // get token from header
      token = req.headers.authorization.split(" ")[1];

      // verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // attach user to the request object (excluding password)
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

const roleCheck = (requiredRole) => (req, res, next) => {

  // simple user/admin role check for general APIs
  if (req.user && req.user.role === requiredRole) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized for this action" });
  }
};

module.exports = { protect, roleCheck };
