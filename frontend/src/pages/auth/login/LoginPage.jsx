// pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Code2, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2,
  AlertCircle
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api.elitecode-ai.club";

export default function LoginPage({ login }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation
  const validate = () => {
    if (!name.trim()) return setError("Please enter your username or email"), false;
    if (!password) return setError("Please enter your password"), false;
    return true;
  };

  // Login Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), password }),
      });

      if (!res.ok) throw new Error("Invalid credentials provided");

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      const user = {
        id: data._id,
        name: data.name
      };
      
      login(user);
      navigate("/", { replace: true });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden font-sans selection:bg-pink-500/30">
      
      {/* --- Left Side: Visual / Brand --- */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-[#0a0a0a] overflow-hidden border-r border-white/5">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -top-[20%] -left-[20%] w-[800px] h-[800px] rounded-full bg-purple-600/10 blur-[120px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 15, repeat: Infinity, delay: 2 }}
            className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-pink-600/10 blur-[100px]" 
          />
        </div>

        <div className="relative z-10 px-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center shadow-xl shadow-pink-500/20">
                <Code2 className="text-white w-7 h-7" />
              </div>
              <span className="text-3xl font-bold tracking-tight">EliteCode<span className="text-pink-400">Ai</span></span>
            </div>

            <h2 className="text-5xl font-extrabold leading-tight mb-6">
              Master the Art of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                Algorithmic Thinking
              </span>
            </h2>
            
            <p className="text-lg text-gray-400 max-w-md leading-relaxed">
              Join thousands of developers solving complex problems, competing in contests, and landing their dream jobs.
            </p>

            {/* Simulated Code Card */}
            <div className="mt-12 p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
               <div className="flex gap-2 mb-4">
                 <div className="w-3 h-3 rounded-full bg-red-500/50" />
                 <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                 <div className="w-3 h-3 rounded-full bg-green-500/50" />
               </div>
               <div className="space-y-2 font-mono text-sm">
                 <div className="text-gray-400">// Ready to start?</div>
                 <div className="text-purple-400">const <span className="text-blue-400">user</span> = <span className="text-yellow-300">await</span> login(credentials);</div>
                 <div className="text-purple-400">if <span className="text-white">(user.isAuthenticated)</span> {"{"}</div>
                 <div className="pl-4 text-pink-400">startCoding();</div>
                 <div className="text-white">{"}"}</div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- Right Side: Login Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Mobile Background Elements */}
        <div className="absolute inset-0 lg:hidden pointer-events-none">
           <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-600/20 blur-[100px]" />
           <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-600/20 blur-[100px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile Logo Show */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center">
              <Code2 className="text-white w-6 h-6" />
            </div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-gray-400">Enter your credentials to access your workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Username or Email</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-400 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
                  placeholder="john_doe"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <button type="button" className="text-xs text-pink-400 hover:text-pink-300 hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-400 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 ml-1">
              <input 
                type="checkbox" 
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-[#0a0a0a] text-pink-500 focus:ring-pink-500/50"
              />
              <label htmlFor="remember" className="text-sm text-gray-400 select-none cursor-pointer">Remember me for 30 days</label>
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 transition-all shadow-lg shadow-pink-900/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Login to Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500 text-sm">
            Don't have an account yet?{" "}
            <Link to="/signup" className="text-white font-medium hover:text-pink-400 transition-colors underline decoration-white/20 underline-offset-4">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}