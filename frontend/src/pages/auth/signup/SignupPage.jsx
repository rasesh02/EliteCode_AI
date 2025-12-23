import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


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
                "http://16.171.23.225:4000/v1/auth/signup",
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


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSignup}
                className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md"
            >
                <h2 className="text-2xl font-semibold mb-6 text-center">Create an account</h2>


                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>
                )}


                <label className="block mb-3">
                    <span className="text-gray-600">Name</span>
                    <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2"
                        placeholder="Your name"
                    />
                </label>


                <label className="block mb-3">
                    <span className="text-gray-600">Email</span>
                    <input
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2"
                        placeholder="you@example.com"
                    />
                </label>


                <label className="block mb-6">
                    <span className="text-gray-600">Password</span>
                    <input
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2"
                        placeholder="At least 6 characters"
                    />
                </label>
                    <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                    disabled={loading}
                    >
                    {loading ? "Creating..." : "Sign up"}
                    </button>
                <p className="text-center text-sm text-gray-500 mt-4">
                    Already have an account?{' '}
                    <a href="/login" className="text-indigo-600 underline">
                        Log in
                    </a>
                </p>
            </form>
        </div>
    );
};
export default SignupPage;