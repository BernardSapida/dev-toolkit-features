/**
 * Authentication Middleware
 * JWT token validation and user authentication
 */

const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/environment");

/**
 * Middleware to authenticate JWT tokens
 * Validates the Authorization header and verifies the JWT token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken,
};
