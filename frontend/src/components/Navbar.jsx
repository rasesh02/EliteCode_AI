// components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Code2, 
  Menu, 
  X, 
  LogOut, 
  User, 
  Sparkles, 
  Terminal,
  Cpu,
  PlusCircle
} from "lucide-react";

export default function Navbar({ auth, logout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if we are on the homepage
  const isHomePage = location.pathname === "/";

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/", icon: <Terminal className="w-4 h-4" /> },
    { name: "Practice", path: "/practice", icon: <Cpu className="w-4 h-4" /> },
    { name: "Create", path: "/create", icon: <PlusCircle className="w-4 h-4" /> },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        // FIX: Use 'fixed' for Home (overlay), 'sticky' for others (natural flow)
        className={`top-0 w-full z-50 transition-all duration-300 border-b ${
          isHomePage ? "fixed" : "sticky"
        } ${
          isScrolled || !isHomePage
            ? "bg-[#050505]/80 backdrop-blur-md border-white/10 py-3 shadow-lg shadow-purple-900/5" 
            : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* --- Logo Section --- */}
          <Link to="/" className="flex items-center gap-2 group z-50">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-violet-600 shadow-lg shadow-pink-500/20 group-hover:shadow-pink-500/40 transition-all duration-300">
              <Code2 className="text-white w-6 h-6" />
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-white leading-none">
                EliteCode<span className="text-pink-400">Ai</span>
              </span>
            </div>
          </Link>

          {/* --- Desktop Navigation --- */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-sm">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                    isActive ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/10 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* --- Auth Section (Desktop) --- */}
          <div className="hidden md:flex items-center gap-4">
            {!auth.loggedIn ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="group relative px-6 py-2.5 rounded-xl font-semibold text-sm text-white overflow-hidden bg-white/5 border border-white/10 hover:border-pink-500/50 transition-colors"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  Login <Sparkles className="w-3 h-3 text-pink-400" />
                </span>
              </motion.button>
            ) : (
              <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                    {auth.user?.name ? auth.user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  {/* FIX: Removed Free Plan text, centered name */}
                  <div className="hidden lg:block text-sm">
                    <p className="text-white font-medium leading-none">{auth.user?.name || "Developer"}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    logout();
                    navigate("/", { replace: true });
                  }}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* --- Mobile Menu Toggle --- */}
          <button 
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.header>

      {/* --- Mobile Menu Overlay --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed top-[70px] left-0 w-full bg-[#0a0a0a] border-b border-white/10 z-40 overflow-hidden shadow-2xl"
          >
            <div className="p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    location.pathname === link.path 
                      ? "bg-white/10 text-white" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
              
              <div className="h-px bg-white/10 my-4" />

              {!auth.loggedIn ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate("/login");
                  }}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold text-center"
                >
                  Login / Sign Up
                </button>
              ) : (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                    navigate("/");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIX: Removed the spacer div completely. 
         'sticky' handles the spacing automatically now. */}
    </>
  );
}