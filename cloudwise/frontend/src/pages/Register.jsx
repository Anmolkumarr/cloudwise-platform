import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Cloud, User, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { isValidEmail, validatePassword } from "../utils/validators.js";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Name is required";
    if (!email.trim()) errors.email = "Email is required";
    else if (!isValidEmail(email)) errors.email = "Enter a valid email address";
    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const data = await register(name, email, password);
      showToast(`Account created — welcome, ${data.name}`, "success");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass-card p-8 fade-in">
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Cloud size={22} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-white">CloudWise</h1>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-1">Create your account</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Start managing your cloud infrastructure</p>

        {error && (
          <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm rounded-xl px-4 py-2.5 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="text-xs text-gray-400 font-medium">Full Name</label>
            <div className={`flex items-center gap-2 bg-white/5 border rounded-xl px-3 py-2.5 mt-1 focus-within:border-primary/50 ${fieldErrors.name ? "border-accent-red/50" : "border-border"}`}>
              <User size={16} className="text-gray-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setFieldErrors((f) => ({ ...f, name: "" })); }}
                className="bg-transparent outline-none text-sm text-gray-200 w-full"
                placeholder="Your name"
              />
            </div>
            {fieldErrors.name && <p className="text-xs text-accent-red mt-1">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="text-xs text-gray-400 font-medium">Email</label>
            <div className={`flex items-center gap-2 bg-white/5 border rounded-xl px-3 py-2.5 mt-1 focus-within:border-primary/50 ${fieldErrors.email ? "border-accent-red/50" : "border-border"}`}>
              <Mail size={16} className="text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((f) => ({ ...f, email: "" })); }}
                className="bg-transparent outline-none text-sm text-gray-200 w-full"
                placeholder="you@company.com"
              />
            </div>
            {fieldErrors.email && <p className="text-xs text-accent-red mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="text-xs text-gray-400 font-medium">Password</label>
            <div className={`flex items-center gap-2 bg-white/5 border rounded-xl px-3 py-2.5 mt-1 focus-within:border-primary/50 ${fieldErrors.password ? "border-accent-red/50" : "border-border"}`}>
              <Lock size={16} className="text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((f) => ({ ...f, password: "" })); }}
                className="bg-transparent outline-none text-sm text-gray-200 w-full"
                placeholder="At least 6 characters"
              />
            </div>
            {fieldErrors.password && <p className="text-xs text-accent-red mt-1">{fieldErrors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark transition-colors text-white font-medium py-2.5 rounded-xl disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-light font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;