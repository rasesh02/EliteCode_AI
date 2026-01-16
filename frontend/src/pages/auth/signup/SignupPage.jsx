import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
    
const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api.elitecode-ai.club";

const SignupPage = ({login}) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();


    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await axios.post(
                `${API_BASE}/v1/auth/signup`,
                { name, email, password }
            );
            setLoading(false);
            const data = res.data; // expects {_id, name, email, token}
			
            if (data.token) {
                localStorage.setItem("token", data.token);
            }
            const user={
                id:data._id,
                name:data.name
              }
            login(user);
            navigate("/");
        } catch (err) {
            setLoading(false);
            setError(err?.response?.data?.error || "Signup failed");
        }
    };


    const bgImage =
        "https://plus.unsplash.com/premium_photo-1733342533441-c4309b51da17?q=80&w=2232&auto=format&fit=crop";

    return (
        <div
            className="min-h-screen flex items-center justify-center text-white"
            style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover" }}
        >
            <div className="absolute inset-0 bg-black/70" />

            <div className="relative z-10 w-full max-w-lg bg-black/60 p-8 shadow-xl rounded-2xl backdrop-blur">
                <h1 className="text-2xl font-bold mb-5 text-indigo-300">Create an account</h1>

                <form onSubmit={handleSignup} className="space-y-4">
                    {error && (
                        <p className="text-sm text-red-400 bg-red-900/30 p-2 rounded">{error}</p>
                    )}

                    <div>
                        <label className="text-gray-300">Name</label>
                        <input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full mt-1 px-3 py-2 bg-white/10 rounded-lg outline-none"
                            placeholder="Your name"
                        />
                    </div>

                    <div>
                        <label className="text-gray-300">Email</label>
                        <input
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            className="w-full mt-1 px-3 py-2 bg-white/10 rounded-lg outline-none"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="text-gray-300">Password</label>
                        <input
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            className="w-full mt-1 px-3 py-2 bg-white/10 rounded-lg outline-none"
                            placeholder="At least 6 characters"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Sign up"}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <a href="/login" className="text-indigo-300 hover:underline">
                        Log in
                    </a>
                </p>
            </div>
        </div>
    );
};
export default SignupPage;