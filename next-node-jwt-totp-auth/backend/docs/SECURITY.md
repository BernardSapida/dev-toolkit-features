# 🔒 Security Considerations

Important security aspects and recommendations for the 2FA Demo API.

## Current Security Features

### ✅ Implemented

- **Password Hashing**: Using bcrypt with salt rounds (10)
- **TOTP Secret Encryption**: AES-256-CBC encryption for storing TOTP secrets
- **JWT Authentication**: Secure token-based authentication
- **CORS Support**: Cross-origin resource sharing configured
- **Backup Codes**: SHA-256 hashed recovery codes for 2FA
- **Input Validation**: Basic validation for required fields

### ⚠️ Development-Only Features

- **In-Memory Storage**: Data is lost on server restart
- **Debug Endpoint**: Exposes system information
- **Permissive TOTP Window**: Large time window for easier testing

---

## Production Security Requirements

### 🔴 Critical (Must Fix)

#### 1. Replace In-Memory Storage

```javascript
// ❌ Current (Development Only)
const users = new Map();
const totpSettings = new Map();

// ✅ Production (Use proper database)
// PostgreSQL, MySQL, MongoDB, etc.
```

#### 2. Remove Debug Endpoints

```javascript
// ❌ Remove this endpoint in production
app.get("/api/debug", (req, res) => {
  // Exposes sensitive system information
});
```

#### 3. Secure Environment Variables

```bash
# ❌ Weak keys
JWT_SECRET=secret123
ENCRYPTION_KEY=key123

# ✅ Strong, randomly generated keys
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
ENCRYPTION_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### 🟡 Important (Should Fix)

#### 4. Add Rate Limiting

```javascript
const rateLimit = require("express-rate-limit");

// Login rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many login attempts, please try again later.",
});

app.use("/api/auth/login", loginLimiter);
```

#### 5. Implement Account Lockout

```javascript
// Track failed attempts
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes

// Lock account after too many failures
if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
  return { success: false, error: "Account temporarily locked" };
}
```

#### 6. Add Input Validation

```javascript
const validator = require("validator");

// Validate email format
if (!validator.isEmail(email)) {
  return { success: false, error: "Invalid email format" };
}

// Password strength validation
if (password.length < 8) {
  return { success: false, error: "Password must be at least 8 characters" };
}
```

#### 7. Secure Headers

```javascript
const helmet = require("helmet");
app.use(helmet());
```

---

## Encryption Details

### TOTP Secret Encryption

```javascript
// Algorithm: AES-256-CBC
// Key: 32 bytes (256 bits)
// IV: 16 bytes (128 bits), randomly generated per encryption
// Format: "iv:encrypted_data"
```

### Password Hashing

```javascript
// Algorithm: bcrypt
// Salt Rounds: 10 (configurable)
// Time: ~100ms per hash (acceptable for login)
```

### Backup Codes

```javascript
// Generation: 4 random bytes per code → 8 hex characters
// Storage: SHA-256 hash of the original code
// Count: 8 codes per user
```

---

## JWT Security

### Current Implementation

```javascript
// Signing algorithm: HS256
// Expiration: 24 hours
// Payload: { id, email, iat, exp }
```

### Production Recommendations

```javascript
// Use RS256 with public/private key pairs
// Shorter expiration (1-2 hours)
// Implement refresh tokens
// Add token blacklisting for logout
```

---

## Database Security (Production)

### Data Storage

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- TOTP settings table
CREATE TABLE totp_settings (
  user_id UUID REFERENCES users(id),
  totp_secret_encrypted TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  backup_codes_hash TEXT[], -- Array of hashed backup codes
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Connection Security

- Use SSL/TLS for database connections
- Implement connection pooling
- Use parameterized queries (SQL injection prevention)
- Regular database backups

---

## Network Security

### HTTPS Only

```javascript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.header("x-forwarded-proto") !== "https") {
    res.redirect(`https://${req.header("host")}${req.url}`);
  } else {
    next();
  }
});
```

### Secure Cookies

```javascript
// JWT in secure HTTP-only cookies
app.use(cookieParser());
res.cookie("token", jwt, {
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: "strict",
  maxAge: 3600000, // 1 hour
});
```

---

## Monitoring & Logging

### Security Events to Log

- Failed login attempts
- Successful logins
- 2FA setup/disable events
- Invalid TOTP codes
- JWT token validation failures
- Suspicious activity patterns

### Log Format

```javascript
const securityLog = {
  timestamp: new Date().toISOString(),
  event: "login_failure",
  userId: "user-id",
  ip: req.ip,
  userAgent: req.get("User-Agent"),
  details: { reason: "invalid_password" },
};
```

---

## TOTP Security

### Time Window

```javascript
// Current: window: 5 (5 * 30s = ±2.5 minutes)
// Production: window: 1 (1 * 30s = ±30 seconds)
```

### QR Code Security

- QR codes contain sensitive TOTP secrets
- Display only during setup
- Don't log or store QR code data
- Clear from memory after display

---

## Backup & Recovery

### Backup Codes

- Generate 8-10 codes per user
- Store as SHA-256 hashes
- Mark as used after consumption
- Regenerate after partial use

### Account Recovery

- Email-based password reset
- Security questions (optional)
- Admin-assisted recovery process

---

## Compliance Considerations

### Data Protection

- GDPR compliance for EU users
- Data retention policies
- User data deletion rights
- Privacy policy requirements

### Industry Standards

- OWASP security guidelines
- SOC 2 compliance (if applicable)
- PCI DSS (if handling payments)

---

## Security Checklist

### Before Production

- [ ] Replace in-memory storage with database
- [ ] Remove debug endpoints
- [ ] Generate strong encryption keys
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Set up HTTPS/TLS
- [ ] Add security headers
- [ ] Implement proper logging
- [ ] Set up monitoring
- [ ] Conduct security testing
- [ ] Code review by security team
- [ ] Penetration testing

### Regular Maintenance

- [ ] Update dependencies regularly
- [ ] Monitor for security advisories
- [ ] Review access logs
- [ ] Rotate encryption keys periodically
- [ ] Audit user accounts
- [ ] Test backup/recovery procedures
