/**
 * User Management Routes
 * Handles user profile and account information
 */

const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { getUserByEmail } = require("../services/authService");
const { getTOTPStatus } = require("../services/totpService");

const router = express.Router();

/**
 * GET /api/user/me
 * Get current authenticated user's profile information
 */
router.get("/me", authenticateToken, (req, res) => {
  try {
    const user = getUserByEmail(req.user.email);
    const totpStatus = getTOTPStatus(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      email: user.email,
      totpEnabled: totpStatus.enabled,
      totpVerified: totpStatus.verified,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
});

module.exports = router;
