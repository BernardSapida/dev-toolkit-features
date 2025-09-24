// utils/gracefulShutdown.js - Graceful server shutdown handling

/**
 * Sets up graceful shutdown handlers for the server
 * @param {Object} server - HTTP server instance
 */
function setupGracefulShutdown(server) {
  // Handle SIGTERM signal (typically from process managers)
  process.on("SIGTERM", () => {
    console.log("🛑 SIGTERM received, shutting down gracefully");
    server.close(() => {
      console.log("✅ Server closed");
      process.exit(0);
    });
  });

  // Handle SIGINT signal (Ctrl+C)
  process.on("SIGINT", () => {
    console.log("🛑 SIGINT received, shutting down gracefully");
    server.close(() => {
      console.log("✅ Server closed");
      process.exit(0);
    });
  });
}

module.exports = {
  setupGracefulShutdown,
};
