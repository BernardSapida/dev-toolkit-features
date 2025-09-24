# 📋 API Documentation

Complete reference for all API endpoints in the 2FA Demo server.

## Base URL

```
http://localhost:3001/api
```

## Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "uuid-here"
}
```

**Error Responses:**

- `400` - Missing email or password
- `409` - User already exists

---

### Login User

**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body (Basic Login):**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Request Body (With 2FA):**

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "totpCode": "123456"
}
```

**Response (Success):**

```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com"
  },
  "totpEnabled": false
}
```

**Response (2FA Required):**

```json
{
  "success": false,
  "requiresTOTP": true,
  "message": "Please enter your Google Authenticator code"
}
```

**Error Responses:**

- `400` - Missing email or password
- `401` - Invalid credentials or TOTP code

---

## Multi-Factor Authentication Endpoints

### Setup TOTP

**POST** `/mfa/totp/setup` 🔒

Setup two-factor authentication for the user.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "success": true,
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEU...",
  "backupCodes": ["A1B2C3D4", "E5F6G7H8", "..."],
  "manualEntryKey": "JBSWY3DPEHPK3PXP",
  "instructions": {
    "step1": "Install Google Authenticator app on your phone",
    "step2": "Scan the QR code or enter the manual key",
    "step3": "Enter the 6-digit code from the app to verify setup"
  }
}
```

---

### Verify TOTP Code

**POST** `/mfa/totp/verify` 🔒

Verify the TOTP code from Google Authenticator to enable 2FA.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "code": "123456"
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "TOTP verified"
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Invalid code"
}
```

---

### Get TOTP Status

**GET** `/mfa/totp/status` 🔒

Get current 2FA status for the user.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "enabled": true,
  "verified": true,
  "setupRequired": false
}
```

---

### Disable TOTP

**POST** `/mfa/totp/disable` 🔒

Disable two-factor authentication for the user.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "success": true,
  "message": "TOTP disabled successfully"
}
```

---

## User Management Endpoints

### Get Current User

**GET** `/user/me` 🔒

Get current authenticated user's profile information.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "id": "user-id",
  "email": "user@example.com",
  "totpEnabled": true,
  "totpVerified": true
}
```

---

## Debug Endpoints

### Debug Information

**GET** `/debug`

Get system information for debugging (development only).

**Response:**

```json
{
  "users": [
    {
      "email": "user@example.com",
      "id": "user-id",
      "hasPassword": true
    }
  ],
  "totpSettings": [
    {
      "userId": "user-id",
      "enabled": true,
      "verified": true,
      "failedAttempts": 0
    }
  ]
}
```

---

## Complete Flow Examples

### 1. User Registration and Basic Login

```bash
# 1. Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 2. Login user
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Setting Up 2FA

```bash
# 1. Get JWT token from login
TOKEN="your-jwt-token-here"

# 2. Setup TOTP
curl -X POST http://localhost:3001/api/mfa/totp/setup \
  -H "Authorization: Bearer $TOKEN"

# 3. Verify TOTP code (from Google Authenticator)
curl -X POST http://localhost:3001/api/mfa/totp/verify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"123456"}'
```

### 3. Login with 2FA

```bash
# Login with TOTP code
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","totpCode":"123456"}'
```

---

## Error Codes

| Code  | Meaning                                             |
| ----- | --------------------------------------------------- |
| `400` | Bad Request - Missing or invalid parameters         |
| `401` | Unauthorized - Invalid credentials or expired token |
| `403` | Forbidden - Invalid JWT token                       |
| `404` | Not Found - Resource not found                      |
| `409` | Conflict - Resource already exists                  |
| `500` | Internal Server Error - Server error                |

---

## Rate Limiting

Currently, there's no rate limiting implemented. In production, consider adding:

- Login attempt limits
- TOTP verification limits
- General API rate limiting

---

## Security Headers

The API should include these security headers in production:

- `X-Frame-Options`
- `X-Content-Type-Options`
- `X-XSS-Protection`
- `Strict-Transport-Security`

---

## Testing Tips

1. **Use Postman or similar tool** for easier API testing
2. **Save JWT tokens** for subsequent authenticated requests
3. **Test the complete flow** from registration to 2FA login
4. **Use the debug endpoint** to inspect stored data
5. **Test error cases** like invalid credentials or codes
