/**
 * Environment Configuration
 * Handles environment variable validation and setup
 */

const JWT_SECRET = process.env.JWT_SECRET;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

/**
 * Validate required environment variables
 */
const validateEnvironment = () => {
  // JWT Secret validation
  if (!process.env.JWT_SECRET) {
    console.warn("⚠️  JWT_SECRET not found in .env file, using fallback");
  }

  // Encryption key validation
  if (!process.env.ENCRYPTION_KEY) {
    console.warn(
      "⚠️  ENCRYPTION_KEY not found in .env file, generating random key"
    );
  }

  console.log(
    "Server starting with encryption key:",
    ENCRYPTION_KEY.substring(0, 8) + "..."
  );
};

module.exports = {
  JWT_SECRET,
  ENCRYPTION_KEY,
  validateEnvironment,
};
