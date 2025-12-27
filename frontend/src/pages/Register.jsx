import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Check,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import "./Login.css";

const Register = () => {
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Auth functions
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };

    let score = 0;
    const checks = {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    if (checks.length) score++;
    if (checks.lowercase) score++;
    if (checks.uppercase) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    if (score <= 2) return { score, label: "Weak", color: "#ef4444", checks };
    if (score <= 3) return { score, label: "Fair", color: "#f59e0b", checks };
    if (score <= 4) return { score, label: "Good", color: "#3b82f6", checks };
    return { score, label: "Strong", color: "#10b981", checks };
  }, [password]);

  // Form validation
  const validateForm = () => {
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters long");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(name.trim(), email.toLowerCase(), password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = confirmPassword && password === confirmPassword;
  const passwordsMismatch = confirmPassword && password !== confirmPassword;

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <UserPlus size={32} />
            </div>
            <h2>Create Account</h2>
            <p className="auth-subtitle">
              Join SkillSwap and start learning today
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={submitHandler} className="auth-form">
            <div className="form-group">
              <label>
                <User size={16} /> Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                minLength={2}
              />
            </div>

            <div className="form-group">
              <label>
                <Mail size={16} /> Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>
                <Lock size={16} /> Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="password-strength">
                  <div className="strength-bar-container">
                    <div
                      className="strength-bar"
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: passwordStrength.color,
                      }}
                    />
                  </div>
                  <span
                    className="strength-label"
                    style={{ color: passwordStrength.color }}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
              )}

              {/* Password Requirements */}
              {password && passwordStrength.score < 4 && (
                <div className="password-requirements">
                  <p className="requirements-title">Password should have:</p>
                  <ul>
                    <li
                      className={passwordStrength.checks?.length ? "met" : ""}
                    >
                      At least 6 characters
                    </li>
                    <li
                      className={
                        passwordStrength.checks?.uppercase ? "met" : ""
                      }
                    >
                      One uppercase letter
                    </li>
                    <li
                      className={
                        passwordStrength.checks?.lowercase ? "met" : ""
                      }
                    >
                      One lowercase letter
                    </li>
                    <li
                      className={passwordStrength.checks?.number ? "met" : ""}
                    >
                      One number
                    </li>
                    <li
                      className={passwordStrength.checks?.special ? "met" : ""}
                    >
                      One special character
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>
                <Lock size={16} /> Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className={
                  passwordsMatch
                    ? "input-success"
                    : passwordsMismatch
                    ? "input-error"
                    : ""
                }
              />
              {passwordsMatch && (
                <span className="input-feedback success">
                  <Check size={14} /> Passwords match
                </span>
              )}
              {passwordsMismatch && (
                <span className="input-feedback error">
                  <X size={14} /> Passwords do not match
                </span>
              )}
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading || passwordsMismatch}
            >
              <UserPlus size={18} />
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
