// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Import configuration and routes
const { validateEnvironment } = require("./config/environment");
const authRoutes = require("./routes/auth");
const mfaRoutes = require("./routes/mfa");
const userRoutes = require("./routes/user");

const app = express();

// ================================================================
// MIDDLEWARE SETUP
// ================================================================

app.use(cors());
app.use(express.json());

// ================================================================
// ENVIRONMENT VALIDATION
// ================================================================

validateEnvironment();

// ================================================================
// ROUTES
// ================================================================

// Authentication routes
app.use("/api/auth", authRoutes);

// Multi-factor authentication routes
app.use("/api/mfa", mfaRoutes);

// User management routes
app.use("/api/user", userRoutes);

// Debug endpoint to see all data (development only)
app.get("/api/debug", (req, res) => {
  const { users, totpSettings } = require("./storage/memoryStore");

  res.json({
    users: Array.from(users.entries()).map(([email, user]) => ({
      email,
      id: user.id,
      hasPassword: !!user.password,
    })),
    totpSettings: Array.from(totpSettings.entries()).map(
      ([userId, settings]) => ({
        userId,
        enabled: settings.is_enabled,
        verified: settings.is_verified,
        failedAttempts: settings.failed_attempts,
      })
    ),
  });
});

// ================================================================
// START SERVER
// ================================================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📱 Test the API at http://localhost:${PORT}`);
  console.log(`🔍 Debug endpoint: http://localhost:${PORT}/api/debug`);
  console.log("\n📋 Quick Test:");
  console.log("1. Register: POST /api/auth/register");
  console.log("2. Login: POST /api/auth/login");
  console.log("3. Setup TOTP: POST /api/mfa/totp/setup");
  console.log("4. Verify TOTP: POST /api/mfa/totp/verify");
});

module.exports = app;
