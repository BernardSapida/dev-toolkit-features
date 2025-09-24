/**
 * Authentication Routes
 * Handles user registration and login endpoints
 */

const express = require("express");
const {
  registerUser,
  authenticateUser,
  generateToken,
} = require("../services/authService");
const { verifyTOTPCode, isTOTPRequired } = require("../services/totpService");

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user account
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await registerUser(email, password);

    if (!result.success) {
      const statusCode = result.error === "User already exists" ? 409 : 400;
      return res.status(statusCode).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * Supports two-factor authentication
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password, totpCode } = req.body;

    // 1. Verify credentials
    const authResult = await authenticateUser(email, password);
    if (!authResult.success) {
      return res.status(401).json({ error: authResult.error });
    }

    const user = authResult.user;

    // 2. Check if TOTP is required
    const totpRequired = isTOTPRequired(user.id);

    if (totpRequired) {
      if (!totpCode) {
        return res.json({
          success: false,
          requiresTOTP: true,
          message: "Please enter your Google Authenticator code",
        });
      }

      // 3. Verify TOTP code
      const totpResult = await verifyTOTPCode(user.id, totpCode);
      if (!totpResult.success) {
        return res.status(401).json(totpResult);
      }
    }

    // 4. Generate JWT token
    const token = generateToken(user);

    console.log(`User logged in: ${email} (TOTP: ${totpRequired})`);

    res.json({
      success: true,
      token,
      user: user,
      totpEnabled: totpRequired,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
