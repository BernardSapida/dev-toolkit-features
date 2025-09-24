/**
 * In-Memory Storage
 * Simple in-memory storage for users and TOTP settings
 *
 * ⚠️  WARNING: This is for development/demo purposes only!
 * In production, replace with a proper database (PostgreSQL, MongoDB, etc.)
 */

// In-memory storage maps
const users = new Map();
const totpSettings = new Map();

module.exports = {
  users,
  totpSettings,
};
