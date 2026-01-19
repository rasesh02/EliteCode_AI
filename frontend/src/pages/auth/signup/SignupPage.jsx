// pages/SignupPage.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Code2, 
  User, 
  Mail,
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2,
  Sparkles,
  CheckCircle2
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api.elitecode-ai.club";

const SignupPage = ({ login }) => {
    const navigate = useNavigate();
    
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        
        try {
            const res = await axios.post(
                `${API_BASE}/v1/auth/signup`,
                { name, email, password }
            );
            
            const data = res.data; 
            
            if (data.token) {
                localStorage.setItem("token", data.token);
            }
            
            const user = {
                id: data._id,
                name: data.name
            };
            
            login(user);
            navigate("/");
            
        } catch (err) {
            setError(err?.response?.data?.error || "Signup failed. Please try again.");
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
                        className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" 
                    />
                    <motion.div 
                        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 15, repeat: Infinity, delay: 2 }}
                        className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-pink-600/10 blur-[100px]" 
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
                            Join the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                                Elite Community
                            </span>
                        </h2>
                        
                        <div className="space-y-4 text-lg text-gray-400 max-w-md">
                            <div className="flex items-center gap-3">
                                <div className="p-1 rounded-full bg-green-500/10 text-green-400">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <span>Access premium coding challenges</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-1 rounded-full bg-green-500/10 text-green-400">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <span>Track your progress with AI analytics</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-1 rounded-full bg-green-500/10 text-green-400">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <span>Compete on the global leaderboard</span>
                            </div>
                        </div>

                        {/* Visual Card */}
                        <div className="mt-12 p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden group hover:border-pink-500/30 transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex gap-2 mb-4">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="font-mono text-sm space-y-2">
                                <div className="text-purple-400">class <span className="text-yellow-300">Developer</span> {"{"}</div>
                                <div className="pl-4 text-blue-400">constructor<span className="text-white">(passion)</span> {"{"}</div>
                                <div className="pl-8 text-gray-400">this.skills = [];</div>
                                <div className="pl-8 text-pink-400">this.status = "Elite";</div>
                                <div className="pl-4 text-white">{"}"}</div>
                                <div className="text-white">{"}"}</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* --- Right Side: Signup Form --- */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
                {/* Mobile Background Elements */}
                <div className="absolute inset-0 lg:hidden pointer-events-none">
                   <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-purple-600/20 blur-[100px]" />
                   <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-indigo-600/20 blur-[100px]" />
                </div>

                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
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

                    <div className="mb-8 text-center lg:text-left">
                        <h1 className="text-3xl font-bold mb-2">Create an account</h1>
                        <p className="text-gray-400">Start your journey to mastering algorithms today.</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-5">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Name Input */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-400 transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-400 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-400 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
                                    placeholder="At least 6 characters"
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 transition-all shadow-lg shadow-pink-900/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Sign Up Free
                                    <Sparkles className="w-4 h-4 fill-white/20" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-500 text-sm">
                        Already have an account?{" "}
                        <Link to="/login" className="text-white font-medium hover:text-pink-400 transition-colors underline decoration-white/20 underline-offset-4">
                            Log in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default SignupPage;