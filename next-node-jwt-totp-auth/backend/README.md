# 2FA Demo API Server

A secure Node.js API server implementing JWT authentication with Two-Factor Authentication (2FA) using Google Authenticator.

## 📁 Project Structure

```
project-root/
├── README.md                 # Main documentation
├── docs/
│   ├── API.md               # API endpoints documentation
│   ├── SETUP.md             # Setup and installation guide
│   └── SECURITY.md          # Security considerations
├── src/
│   ├── server.js            # Main application entry point
│   ├── config/
│   │   └── environment.js   # Environment variables configuration
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── mfa.js           # Multi-factor authentication routes
│   │   └── user.js          # User management routes
│   ├── services/
│   │   ├── authService.js   # Authentication business logic
│   │   ├── totpService.js   # TOTP/2FA business logic
│   │   └── cryptoService.js # Encryption/decryption utilities
│   └── storage/
│       └── memoryStore.js   # In-memory data storage
├── .env                     # Environment variables (create this)
└── package.json             # Project dependencies
```

## 🚀 Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create environment file:**

   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Start the server:**

   ```bash
   npm start
   ```

4. **Test the API:**
   - Server runs on: `http://localhost:3001`
   - Debug endpoint: `http://localhost:3001/api/debug`

## ✨ Features

- **JWT Authentication**: Secure token-based authentication
- **Two-Factor Authentication**: Google Authenticator integration
- **Password Hashing**: bcrypt for secure password storage
- **Secret Encryption**: AES-256-CBC encryption for TOTP secrets
- **Backup Codes**: Recovery codes for 2FA
- **CORS Support**: Cross-origin resource sharing enabled
- **Debug Endpoints**: Easy testing and debugging

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
JWT_SECRET=your-super-secret-jwt-key-here
ENCRYPTION_KEY=your-32-byte-encryption-key-as-hex-or-string
PORT=3001
NODE_ENV=development
```

## 📚 Documentation

- [📋 API Endpoints](docs/API.md) - Complete API documentation
- [⚙️ Setup Guide](docs/SETUP.md) - Detailed installation instructions
- [🔒 Security Notes](docs/SECURITY.md) - Security considerations and best practices

## 🧪 Testing the API

### 1. Register a User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Setup 2FA (requires JWT token)

```bash
curl -X POST http://localhost:3001/api/mfa/totp/setup \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## ⚠️ Important Notes

- **In-Memory Storage**: This demo uses in-memory storage. Data is lost when server restarts.
- **Development Only**: Not production-ready. Replace with proper database and security measures.
- **Environment Variables**: Always use proper environment variables in production.

## 🔒 Security Features

- Passwords hashed with bcrypt
- TOTP secrets encrypted with AES-256-CBC
- JWT tokens with expiration
- Backup codes for 2FA recovery
- Failed attempt tracking (partial implementation)

## 🚧 Production Considerations

Before using in production:

- Replace in-memory storage with proper database
- Add rate limiting
- Implement proper logging
- Add input validation
- Use HTTPS only
- Add proper error handling
- Implement account lockout policies
