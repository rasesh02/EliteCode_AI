// pages/HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#070707] to-[#0b0b0b] text-white">
      {/* big hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 text-center relative">
        {/* subtle grid / radial lighting using pseudo background shapes (Tailwind classes used inline) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-48 top-1/4 w-96 h-96 rounded-full bg-purple-800/30 blur-3xl" />
          <div className="absolute -right-48 bottom-1/4 w-96 h-96 rounded-full bg-pink-800/25 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex justify-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full bg-[#21102b] text-xs text-pink-300 border border-pink-700">AI-Powered</span>
            <span className="px-3 py-1 rounded-full bg-[#2b1220] text-xs text-rose-300 border border-rose-700">Modern Platform</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight">
            Explore The <br />
            Craftmanship of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-500">
              Classic Coding
            </span>
          </h1>

          <p className="text-gray-300 max-w-2xl mx-auto mt-6">
            Master algorithms, solve challenging problems, and elevate your programming skills with our intelligent coding platform.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate("/practice")}
              className="px-6 py-3 rounded-full font-medium bg-gradient-to-r from-pink-500 to-violet-500 shadow-lg"
            >
              Start Practicing
            </button>

            <button
              onClick={() => navigate("/create")}
              className="px-5 py-3 rounded-full font-medium bg-gray-800 border border-gray-700 text-gray-200"
            >
              Create Problems
            </button>
          </div>

          {/* faux code window */}
          <div className="mt-12 mx-auto max-w-2xl bg-[#111111] border border-gray-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 bg-red-400 rounded-full" />
              <span className="w-3 h-3 bg-yellow-400 rounded-full" />
              <span className="w-3 h-3 bg-green-400 rounded-full" />
            </div>
            <div className="font-mono text-center text-gray-200">console.log("Hello World");</div>
          </div>

          {/* stats */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard title="500+" subtitle="Coding Problems" />
            <StatCard title="10k+" subtitle="Active Users" accent />
            <StatCard title="50+" subtitle="Companies Trust Us" />
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ title, subtitle, accent }) {
  return (
    <div className={`bg-gradient-to-b ${accent ? "from-[#23102d] to-[#1b1026]" : "from-[#0f0f0f] to-[#0b0b0b]"} border border-gray-800 rounded-xl p-6 text-center`}>
      <div className={`text-2xl sm:text-3xl font-bold ${accent ? "text-pink-400" : "text-gray-200"}`}>{title}</div>
      <div className="text-gray-400 mt-1 text-sm">{subtitle}</div>
    </div>
  );
}
