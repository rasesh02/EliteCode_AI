import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://16.171.23.225:4000";

export default function LoginPage({ login }) {   // ⭐ login() comes from App.jsx
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Basic validation
  const validate = () => {
    if (!name.trim()) return setError("Enter username or email"), false;
    if (!password) return setError("Password required"), false;
    return true;
  };

  // 🔥 Actual login request
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ⬅ store JWT cookie automatically
        body: JSON.stringify({ name: name.trim(), password }),
      });

      console.log(res)

      if (!res.ok) throw new Error("Invalid email/password");

      const User = await res.json();  // 📥 must return user {_id,name,email,...}

      // 🔥 tell App.jsx → user is logged in
      const user={
        id:User._id,
        name:User.name
      }
      login(user);

      navigate("/", { replace: true });  // redirect to dashboard

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If user already has jwt cookie → get user + auto login
  useEffect(() => {
    (async () => {
      try {

      } catch {}
    })();
  }, []);

  const bgImage =
    "https://plus.unsplash.com/premium_photo-1733342533441-c4309b51da17?q=80&w=2232&auto=format&fit=crop";

  return (
    <div
      className="min-h-screen flex items-center justify-center text-white"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover" }}
    >
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 w-full max-w-lg bg-black/60 p-8 shadow-xl rounded-2xl backdrop-blur">
        <h1 className="text-2xl font-bold mb-5 text-indigo-300">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username */}
          <div>
            <label className="text-gray-300">Username / Email</label>
            <input
              className="w-full mt-1 px-3 py-2 bg-white/10 rounded-lg outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="username"
              placeholder="john_42"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full mt-1 px-3 py-2 bg-white/10 rounded-lg pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-2 text-xs text-gray-400"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Extras */}
          <div className="flex justify-between">
            <label className="flex items-center gap-2 text-gray-300 text-sm">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <span className="text-indigo-300 text-sm cursor-pointer hover:underline">
              Forgot password?
            </span>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/30 p-2 rounded">{error}</p>
          )}

          <button
            disabled={loading}
            className="w-full py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          No account?{" "}
          <a href="/signup" className="text-indigo-300 hover:underline">
            Signup →
          </a>
        </p>
      </div>
    </div>
  );
}
