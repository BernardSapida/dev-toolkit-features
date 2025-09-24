# 🔧 Setup Guide

This guide will walk you through setting up the 2FA Demo API server step by step.

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- **Google Authenticator** app (for testing 2FA)

## Installation Steps

### 1. Install Dependencies

```bash
npm install express cors bcryptjs jsonwebtoken speakeasy qrcode dotenv
```

Or if you have a `package.json`:

```bash
npm install
```

### 2. Create Environment Variables

Create a `.env` file in your project root:

```env
# JWT Secret - Use a strong, random string
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Encryption Key - Use a 32-byte key (64 hex characters) or any string
ENCRYPTION_KEY=abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789

# Server Port (optional)
PORT=3001

# Environment (optional)
NODE_ENV=development
```

**Important:** Never commit your `.env` file to version control!

### 3. Generate Secure Keys

For production, generate secure keys:

```bash
# Generate JWT Secret (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Encryption Key (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Project Structure

Organize your files according to this structure:

```
project-root/
├── .env                     # Environment variables (create this)
├── .env.example            # Example environment file
├── package.json            # Dependencies
├── README.md              # Main documentation
├── docs/                  # Documentation
│   ├── API.md
│   ├── SETUP.md
│   └── SECURITY.md
└── src/                   # Source code
    ├── server.js          # Main entry point
    ├── config/
    │   └── environment.js
    ├── middleware/
    │   └── auth.js
    ├── routes/
    │   ├── auth.js
    │   ├── mfa.js
    │   └── user.js
    ├── services/
    │   ├── authService.js
    │   ├── totpService.js
    │   └── cryptoService.js
    └── storage/
        └── memoryStore.js
```

### 5. Create Package.json

If you don't have a `package.json`, create one:

```json
{
  "name": "2fa-demo-api",
  "version": "1.0.0",
  "description": "A Node.js API server with JWT authentication and 2FA",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "echo \"No tests specified\" && exit 0"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "qrcode": "^1.5.3",
    "speakeasy": "^2.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
```

### 6. Start the Server

```bash
npm start
```

Or for development with auto-restart:

```bash
npm install -g nodemon
npm run dev
```

## Verification

1. **Check server startup:**

   - You should see: `🚀 Backend server running on port 3001`
   - No critical error messages

2. **Test the debug endpoint:**

   ```bash
   curl http://localhost:3001/api/debug
   ```

   Should return: `{"users":[],"totpSettings":[]}`

3. **Test user registration:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

## Common Issues & Solutions

### Port Already in Use

```bash
# Kill process using port 3001
lsof -ti:3001 | xargs kill -9

# Or use a different port
PORT=3002 npm start
```

### Missing Dependencies

```bash
# Install all dependencies
npm install

# Install specific missing dependency
npm install <package-name>
```

### Environment Variable Issues

- Make sure `.env` file is in the root directory
- Check for typos in variable names
- Ensure no spaces around `=` in `.env` file

### Permission Issues

```bash
# Fix file permissions (Unix/macOS)
chmod 755 src/server.js
```

## Next Steps

1. Read the [API Documentation](API.md)
2. Review [Security Considerations](SECURITY.md)
3. Test the 2FA flow with Google Authenticator
4. Consider database integration for production use

## Development Tips

- Use `nodemon` for auto-restart during development
- Check server logs for detailed error messages
- Use the debug endpoint to inspect stored data
- Test with tools like Postman or curl
