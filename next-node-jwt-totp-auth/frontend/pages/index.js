import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("login");

  // Auth states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [requiresTOTP, setRequiresTOTP] = useState(false);

  // TOTP setup states
  const [qrCode, setQrCode] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [setupStep, setSetupStep] = useState(1);

  // Error/success states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check if user is logged in on page load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = Cookies.get("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_API}/user/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data);
      setCurrentView("dashboard");
    } catch (error) {
      console.error("Auth check failed:", error);
      Cookies.remove("token");
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API}/auth/register`,
        {
          email,
          password,
        }
      );

      setSuccess("Registration successful! Please log in.");
      setCurrentView("login");
      setEmail("");
      setPassword("");
    } catch (error) {
      setError(error.response?.data?.error || "Registration failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API}/auth/login`,
        {
          email,
          password,
          totpCode,
        }
      );

      if (response.data.requiresTOTP) {
        setRequiresTOTP(true);
        setError("");
        return;
      }

      if (response.data.success) {
        Cookies.set("token", response.data.token, { expires: 1 });
        setUser(response.data.user);
        setCurrentView("dashboard");
        setRequiresTOTP(false);
        setTotpCode("");
      }
    } catch (error) {
      setError(error.response?.data?.error || "Login failed");
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    setUser(null);
    setCurrentView("login");
    setRequiresTOTP(false);
    setTotpCode("");
    setEmail("");
    setPassword("");
  };

  const setupTOTP = async () => {
    setError("");
    const token = Cookies.get("token");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API}/mfa/totp/setup`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setQrCode(response.data.qrCode);
      setManualKey(response.data.manualEntryKey);
      setBackupCodes(response.data.backupCodes);
      setCurrentView("totp-setup");
      setSetupStep(1);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to setup TOTP");
    }
  };

  const verifyTOTPSetup = async (e) => {
    e.preventDefault();
    setError("");
    const token = Cookies.get("token");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API}/mfa/totp/verify`,
        {
          code: totpCode,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccess("TOTP setup completed successfully!");
        setSetupStep(3);
        setTotpCode("");
        // Update user status
        checkAuthStatus();
      }
    } catch (error) {
      setError(error.response?.data?.error || "Invalid TOTP code");
    }
  };

  const disableTOTP = async () => {
    setError("");
    const token = Cookies.get("token");

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API}/mfa/totp/disable`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("TOTP disabled successfully");
      checkAuthStatus();
      setCurrentView("dashboard");
    } catch (error) {
      setError(error.response?.data?.error || "Failed to disable TOTP");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              2FA (Google Authenticator)
            </h1>
            <p className="text-gray-600 mt-2">
              Two-Factor Authentication with Google Authenticator
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          {/* Login/Register View */}
          {(currentView === "login" || currentView === "register") && !user && (
            <div>
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => {
                    setCurrentView("login");
                    setError("");
                    setSuccess("");
                  }}
                  className={`px-4 py-2 mr-2 rounded ${
                    currentView === "login"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setCurrentView("register");
                    setError("");
                    setSuccess("");
                  }}
                  className={`px-4 py-2 rounded ${
                    currentView === "register"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Register
                </button>
              </div>

              <form
                onSubmit={
                  currentView === "login" ? handleLogin : handleRegister
                }
              >
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {requiresTOTP && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Google Authenticator Code
                    </label>
                    <input
                      type="text"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      maxLength="6"
                      pattern="[0-9]{6}"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
                >
                  {currentView === "login" ? "Login" : "Register"}
                </button>
              </form>
            </div>
          )}

          {/* Dashboard View */}
          {currentView === "dashboard" && user && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Welcome, {user.email}</h2>

              <div className="mb-6 p-4 bg-gray-100 rounded">
                <h3 className="font-semibold mb-2">Account Status:</h3>
                <p>Email: {user.email}</p>
                <p>
                  2FA Status: {user.totpEnabled ? "✅ Enabled" : "❌ Disabled"}
                </p>
              </div>

              <div className="space-y-3">
                {!user.totpEnabled ? (
                  <button
                    onClick={setupTOTP}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                  >
                    🔒 Enable 2FA (Google Authenticator)
                  </button>
                ) : (
                  <button
                    className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                    onClick={() => {
                      if (confirm("Are you sure you want to disable 2FA?")) {
                        disableTOTP();
                      }
                    }}
                  >
                    🔓 Disable 2FA
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {/* TOTP Setup View */}
          {currentView === "totp-setup" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Setup Google Authenticator
              </h2>

              {setupStep === 1 && (
                <div>
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">
                      Step 1: Install Google Authenticator
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Download Google Authenticator from your app store, then
                      scan the QR code below:
                    </p>

                    {qrCode && (
                      <div className="text-center mb-4">
                        <img
                          src={qrCode}
                          alt="QR Code"
                          className="mx-auto border"
                        />
                      </div>
                    )}

                    <div className="bg-gray-100 p-3 rounded mb-4">
                      <p className="text-xs font-semibold mb-1">
                        Manual entry key (if QR doesn't work):
                      </p>
                      <code className="text-xs break-all">{manualKey}</code>
                    </div>
                  </div>

                  <button
                    onClick={() => setSetupStep(2)}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                  >
                    I've Scanned the QR Code
                  </button>
                </div>
              )}

              {setupStep === 2 && (
                <div>
                  <h3 className="font-semibold mb-2">Step 2: Verify Setup</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Enter the 6-digit code from your Google Authenticator app:
                  </p>

                  <form onSubmit={verifyTOTPSetup}>
                    <div className="mb-4">
                      <input
                        type="text"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-center text-2xl tracking-widest"
                        maxLength="6"
                        pattern="[0-9]{6}"
                        autoComplete="off"
                        required
                      />
                    </div>

                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setSetupStep(1)}
                        className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                      >
                        Verify & Enable
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {setupStep === 3 && (
                <div>
                  <h3 className="font-semibold mb-2 text-green-600">
                    ✅ Setup Complete!
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Your 2FA is now enabled. Please save these backup codes in a
                    safe place:
                  </p>

                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
                    <h4 className="font-semibold mb-2 text-yellow-800">
                      ⚠️ Backup Codes
                    </h4>
                    <p className="text-xs text-yellow-700 mb-2">
                      Save these codes safely. You can use them to access your
                      account if you lose your phone.
                    </p>
                    <div className="grid grid-cols-2 gap-1 font-mono text-sm">
                      {backupCodes.map((code, index) => (
                        <div
                          key={index}
                          className="bg-white p-1 rounded text-center"
                        >
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentView("dashboard")}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  ← Cancel and go back
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="font-semibold mb-3">
            How to use Google Authenticator:
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              1. <strong>Download</strong> Google Authenticator from your app
              store
            </p>
            <p>
              2. <strong>Open</strong> the app and tap "+" to add an account
            </p>
            <p>
              3. <strong>Scan</strong> the QR code or enter the manual key
            </p>
            <p>
              4. <strong>Enter</strong> the 6-digit code that appears in the app
            </p>
            <p>
              5. <strong>Save</strong> your backup codes in a safe place
            </p>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              <strong>💡 Pro tip:</strong> The codes in Google Authenticator
              refresh every 30 seconds. If a code doesn't work, wait for the
              next one!
            </p>
          </div>
        </div>

        {/* Debug info */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 bg-gray-100 p-4 rounded">
            <h4 className="font-semibold mb-2">Debug Info:</h4>
            <p className="text-xs text-gray-600">Current view: {currentView}</p>
            <p className="text-xs text-gray-600">
              Requires TOTP: {requiresTOTP.toString()}
            </p>
            <p className="text-xs text-gray-600">Setup step: {setupStep}</p>
            {user && (
              <p className="text-xs text-gray-600">User: {user.email}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
