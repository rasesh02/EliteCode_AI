// components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ auth, logout }) {
  const navigate = useNavigate();

  return (
    <header className="bg-black/90 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-pink-400 font-semibold">
            <span className="text-lg">{'</>'}</span>
            <span className="hidden sm:inline">QuickCode</span>
          </Link>

          <nav className="ml-8 space-x-4">
            <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
            <Link to="/create" className="text-gray-300 hover:text-white">Create</Link>
            <Link to="/practice" className="text-gray-300 hover:text-white">Practice</Link>
          </nav>
        </div>

        <div>
          {!auth.loggedIn ? (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-1 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 text-white font-medium"
            >
              Login
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-gray-300 hidden sm:inline">Hi, {auth.user?.name || "User"}</span>
              <button
                onClick={() => {
                  logout();
                  navigate("/", { replace: true });
                }}
                className="px-4 py-1 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
