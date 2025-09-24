/**
 * TOTP Service
 * Handles Two-Factor Authentication using Google Authenticator
 */

const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const crypto = require("crypto");
const {
  encryptSecret,
  decryptSecret,
  generateBackupCodes,
} = require("./cryptoService");
const { totpSettings } = require("../storage/memoryStore");

/**
 * Setup TOTP for a user
 * @param {string} userId - User's unique identifier
 * @param {string} userEmail - User's email address
 * @returns {Object} - Setup result with QR code and backup codes
 */
const setupTOTP = async (userId, userEmail) => {
  try {
    // 1. Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `2FA Demo (${userEmail})`,
      issuer: "2FA Demo App",
      length: 32,
    });

    console.log("Generated TOTP secret for user:", userId);

    // 2. Encrypt and store secret
    const encryptedSecret = encryptSecret(secret.base32);

    // 3. Generate backup codes
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = backupCodes.map((code) =>
      crypto.createHash("sha256").update(code).digest("hex")
    );

    // 4. Store in memory (replace with database)
    totpSettings.set(userId, {
      totp_secret_encrypted: encryptedSecret,
      is_enabled: false,
      is_verified: false,
      backup_codes_hash: hashedBackupCodes,
      failed_attempts: 0,
      locked_until: null,
      created_at: new Date(),
    });

    console.log("SETUP userId", totpSettings);

    // 5. Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

    return {
      success: true,
      qrCode: qrCodeDataURL,
      backupCodes: backupCodes,
      manualEntryKey: secret.base32,
      instructions: {
        step1: "Install Google Authenticator app on your phone",
        step2: "Scan the QR code or enter the manual key",
        step3: "Enter the 6-digit code from the app to verify setup",
      },
    };
  } catch (error) {
    console.error("TOTP setup error:", error);
    return { success: false, error: "Failed to setup TOTP" };
  }
};

/**
 * Verify TOTP code
 * @param {string} userId - User's unique identifier
 * @param {string} userInputCode - 6-digit TOTP code from user
 * @returns {Object} - Verification result
 */
const verifyTOTPCode = async (userId, userInputCode) => {
  console.log(`🔍 Verifying TOTP: ${userInputCode}`);

  const userTotpSettings = totpSettings.get(userId);

  console.log("SETUP userId", totpSettings);

  if (!userTotpSettings) {
    return { success: false, error: "TOTP not set up" };
  }

  const decryptedSecret = decryptSecret(userTotpSettings.totp_secret_encrypted);

  // Generate current expected code for comparison
  const expectedCode = speakeasy.totp({
    secret: decryptedSecret,
    encoding: "base32",
  });

  console.log(`📱 User code: ${userInputCode}`);
  console.log(`🖥️  Expected: ${expectedCode}`);

  // Very permissive verification
  const verified = speakeasy.totp.verify({
    secret: decryptedSecret,
    token: userInputCode,
    window: 5, // Large window for testing
    encoding: "base32",
  });

  if (verified) {
    userTotpSettings.is_verified = true;
    userTotpSettings.is_enabled = true;
    userTotpSettings.failed_attempts = 0;
    totpSettings.set(userId, userTotpSettings);

    console.log("✅ TOTP verification successful!");
    return { success: true, message: "TOTP verified" };
  } else {
    console.log("❌ TOTP verification failed");
    return { success: false, error: "Invalid code" };
  }
};

/**
 * Get TOTP status for a user
 * @param {string} userId - User's unique identifier
 * @returns {Object} - TOTP status information
 */
const getTOTPStatus = (userId) => {
  const userTotpSettings = totpSettings.get(userId);

  return {
    enabled: userTotpSettings?.is_enabled || false,
    verified: userTotpSettings?.is_verified || false,
    setupRequired: !userTotpSettings,
  };
};

/**
 * Disable TOTP for a user
 * @param {string} userId - User's unique identifier
 * @returns {Object} - Disable result
 */
const disableTOTP = (userId) => {
  totpSettings.delete(userId);

  console.log(`TOTP disabled for user: ${userId}`);

  return {
    success: true,
    message: "TOTP disabled successfully",
  };
};

/**
 * Check if TOTP is required for login
 * @param {string} userId - User's unique identifier
 * @returns {boolean} - True if TOTP is required
 */
const isTOTPRequired = (userId) => {
  const userTotpSettings = totpSettings.get(userId);
  return userTotpSettings?.is_enabled && userTotpSettings?.is_verified;
};

module.exports = {
  setupTOTP,
  verifyTOTPCode,
  getTOTPStatus,
  disableTOTP,
  isTOTPRequired,
};
