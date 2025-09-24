// utils/errorHandler.js - Global error handling utilities

/**
 * Sets up error handling middleware for the Express app
 * @param {Object} app - Express application instance
 */
function setupErrorHandlers(app) {
  // 404 handler for undefined routes
  app.use("*", (req, res) => {
    res.status(404).json({
      error: "Endpoint not found",
      message: `Cannot ${req.method} ${req.originalUrl}`,
      availableEndpoints: [
        "POST /api/auth/register",
        "POST /api/auth/login",
        "POST /api/mfa/totp/setup",
        "POST /api/mfa/totp/verify",
        "GET /api/mfa/totp/status",
        "POST /api/mfa/totp/disable",
        "GET /api/user/me",
      ],
    });
  });

  // Global error handler
  app.use((error, req, res, next) => {
    console.error("❌ Unhandled error:", error);

    res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  });
}

module.exports = {
  setupErrorHandlers,
};
