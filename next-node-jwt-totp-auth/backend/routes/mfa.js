/**
 * Multi-Factor Authentication Routes
 * Handles TOTP/2FA setup, verification, and management
 */

const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  setupTOTP,
  verifyTOTPCode,
  getTOTPStatus,
  disableTOTP,
} = require("../services/totpService");

const router = express.Router();

/**
 * POST /api/mfa/totp/setup
 * Setup TOTP for the authenticated user
 * Returns QR code and backup codes
 */
router.post("/totp/setup", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const result = await setupTOTP(userId, userEmail);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error("TOTP setup error:", error);
    res.status(500).json({ error: "Failed to setup TOTP" });
  }
});

/**
 * POST /api/mfa/totp/verify
 * Verify TOTP code from Google Authenticator
 */
router.post("/totp/verify", authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "TOTP code required" });
    }

    console.log("CODE", code);

    const result = await verifyTOTPCode(req.user.id, code);
    res.json(result);
  } catch (error) {
    console.error("TOTP verify endpoint error:", error);
    res.status(500).json({ error: "Failed to verify TOTP" });
  }
});

/**
 * GET /api/mfa/totp/status
 * Get current TOTP status for the authenticated user
 */
router.get("/totp/status", authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const status = getTOTPStatus(userId);
    res.json(status);
  } catch (error) {
    console.error("TOTP status error:", error);
    res.status(500).json({ error: "Failed to get TOTP status" });
  }
});

/**
 * POST /api/mfa/totp/disable
 * Disable TOTP for the authenticated user
 */
router.post("/totp/disable", authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const result = disableTOTP(userId);
    res.json(result);
  } catch (error) {
    console.error("TOTP disable error:", error);
    res.status(500).json({ error: "Failed to disable TOTP" });
  }
});

module.exports = router;
