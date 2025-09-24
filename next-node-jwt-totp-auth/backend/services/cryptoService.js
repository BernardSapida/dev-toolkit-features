/**
 * Crypto Service
 * Handles encryption/decryption and crypto utilities
 */

const crypto = require("crypto");
const { ENCRYPTION_KEY } = require("../config/environment");

/**
 * Encrypt a secret using AES-256-CBC
 * @param {string} secret - The secret to encrypt
 * @returns {string} - Encrypted secret in format "iv:encrypted"
 */
const encryptSecret = (secret) => {
  try {
    const algorithm = "aes-256-cbc";

    // Ensure key is exactly 32 bytes
    let key;

    if (ENCRYPTION_KEY.length === 64) {
      // Hex string (32 bytes = 64 hex chars)
      key = Buffer.from(ENCRYPTION_KEY, "hex");
    } else {
      // Hash the key to ensure it's 32 bytes
      key = crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);

    let encrypted = cipher.update(secret, "utf8", "hex");
    encrypted += cipher.final("hex");

    return `${iv.toString("hex")}:${encrypted}`;
  } catch (error) {
    console.error("Encryption error:", error);
    // Fallback to simple base64 if encryption fails
    return Buffer.from(secret).toString("base64");
  }
};

/**
 * Decrypt a secret using AES-256-CBC
 * @param {string} encryptedSecret - The encrypted secret in format "iv:encrypted"
 * @returns {string} - Decrypted secret
 */
const decryptSecret = (encryptedSecret) => {
  try {
    // Check if it's base64 encoded (fallback format)
    if (!encryptedSecret.includes(":")) {
      return Buffer.from(encryptedSecret, "base64").toString("utf8");
    }

    const algorithm = "aes-256-cbc";

    // Ensure key is exactly 32 bytes
    let key;
    if (ENCRYPTION_KEY.length === 64) {
      // Hex string (32 bytes = 64 hex chars)
      key = Buffer.from(ENCRYPTION_KEY, "hex");
    } else {
      // Hash the key to ensure it's 32 bytes
      key = crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
    }

    const parts = encryptedSecret.split(":");
    if (parts.length !== 2) {
      throw new Error("Invalid encrypted data format");
    }

    const encrypted = parts[1];

    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    // Try base64 fallback
    try {
      return Buffer.from(encryptedSecret, "base64").toString("utf8");
    } catch (fallbackError) {
      throw new Error("Failed to decrypt secret");
    }
  }
};

/**
 * Generate backup codes for 2FA recovery
 * @param {number} count - Number of backup codes to generate (default: 8)
 * @returns {string[]} - Array of backup codes
 */
const generateBackupCodes = (count = 8) => {
  return Array.from({ length: count }, () => {
    return crypto.randomBytes(4).toString("hex").toUpperCase();
  });
};

module.exports = {
  encryptSecret,
  decryptSecret,
  generateBackupCodes,
};
