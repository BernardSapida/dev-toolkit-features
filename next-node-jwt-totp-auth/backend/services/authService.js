/**
 * Authentication Service
 * Handles user registration, login, and JWT token generation
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { JWT_SECRET } = require("../config/environment");
const { users } = require("../storage/memoryStore");

/**
 * Register a new user
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Object} - Registration result
 */
const registerUser = async (email, password) => {
  try {
    if (!email || !password) {
      return { success: false, error: "Email and password required" };
    }

    if (users.has(email)) {
      return { success: false, error: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    users.set(email, {
      id: userId,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    console.log(`User registered: ${email}`);

    return {
      success: true,
      message: "User registered successfully",
      userId,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Registration failed" };
  }
};

/**
 * Authenticate user credentials
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Object} - Authentication result with user data
 */
const authenticateUser = async (email, password) => {
  try {
    if (!email || !password) {
      return { success: false, error: "Email and password required" };
    }

    const user = users.get(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return { success: false, error: "Invalid credentials" };
    }

    return {
      success: true,
      user: { id: user.id, email: user.email },
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return { success: false, error: "Authentication failed" };
  }
};

/**
 * Generate JWT token for authenticated user
 * @param {Object} user - User object with id and email
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "24h",
  });
};

/**
 * Get user by email
 * @param {string} email - User's email address
 * @returns {Object|null} - User object or null if not found
 */
const getUserByEmail = (email) => {
  return users.get(email);
};

module.exports = {
  registerUser,
  authenticateUser,
  generateToken,
  getUserByEmail,
};
