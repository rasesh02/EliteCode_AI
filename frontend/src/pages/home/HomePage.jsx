// pages/HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Code2, 
  Terminal, 
  Globe, 
  Zap, 
  ChevronRight, 
  Github, 
  Twitter, 
  Linkedin,
  CheckCircle2,
  PlusCircle,
  Sparkles
} from "lucide-react";

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-pink-500/30 overflow-x-hidden font-sans">
      {/* Navbar removed as requested */}
      
      <main>
        <HeroSection navigate={navigate} />
        <FeaturesSection />
        <StatsSection />
        <CallToAction navigate={navigate} />
      </main>

      <Footer />
    </div>
  );
}

// --- Components ---

function HeroSection({ navigate }) {
  return (
    <section className="relative pt-24 pb-20 lg:pt-36 lg:pb-32 px-6 overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-[20%] left-[20%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-pink-600/20 blur-[100px]" 
        />
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Text Content */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center lg:text-left"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-pink-300 mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
            </span>
            EliteCodeAi Platform
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
            Explore The <br />
            Craftsmanship of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
              Elite Coding
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Master algorithms, solve challenging problems, and elevate your programming skills with our intelligent coding platform.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            {/* Primary Button -> Create */}
            <button
              onClick={() => navigate("/create")}
              className="group relative px-8 py-4 rounded-full font-semibold bg-white text-black hover:bg-gray-100 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-purple-600" />
              Create your own problem now
            </button>

            {/* Secondary Button -> Practice */}
            <button
              onClick={() => navigate("/practice")}
              className="px-8 py-4 rounded-full font-semibold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all backdrop-blur-sm flex items-center justify-center gap-2"
            >
              View Problem Set
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          </motion.div>
        </motion.div>

        {/* Hero Visual / Code Window */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative lg:h-[500px] flex items-center justify-center"
        >
           <div className="w-full max-w-lg bg-[#0f0f0f] rounded-xl border border-white/10 shadow-2xl overflow-hidden relative group">
              {/* Window Header */}
              <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-2 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="ml-4 text-xs text-gray-500 font-mono">two_sum.js</div>
              </div>

              {/* Code Content */}
              <div className="p-6 font-mono text-sm leading-6 h-[300px] overflow-hidden">
                <div className="text-purple-400">function <span className="text-blue-400">twoSum</span>(nums, target) {"{"}</div>
                <div className="pl-4 text-gray-300">const map = <span className="text-yellow-300">new Map</span>();</div>
                <div className="pl-4 text-gray-300"><span className="text-purple-400">for</span> (let i = 0; i &lt; nums.length; i++) {"{"}</div>
                <div className="pl-8 text-gray-300">const complement = target - nums[i];</div>
                <div className="pl-8 text-gray-300"><span className="text-purple-400">if</span> (map.has(complement)) {"{"}</div>
                <div className="pl-12 text-gray-300"><span className="text-pink-400">return</span> [map.get(complement), i];</div>
                <div className="pl-8 text-gray-300">{"}"}</div>
                <div className="pl-8 text-gray-300">map.set(nums[i], i);</div>
                <div className="pl-4 text-gray-300">{"}"}</div>
                <div className="text-gray-300">{"}"}</div>
                
                {/* Cursor animation */}
                <motion.div 
                  className="mt-2 w-2 h-4 bg-pink-500"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </div>

              {/* Gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent pointer-events-none" />
           </div>

           {/* Decorative floating elements */}
           <motion.div 
            animate={{ y: [-10, 10, -10] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-8 -bottom-8 bg-[#1a1a1a] p-4 rounded-xl border border-white/10 shadow-xl"
           >
             <div className="flex items-center gap-3">
               <div className="bg-green-500/20 p-2 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-400" /></div>
               <div>
                 <div className="text-xs text-gray-400">Status</div>
                 <div className="text-sm font-bold text-white">Accepted</div>
               </div>
             </div>
           </motion.div>
        </motion.div>

      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { label: "Active Users", value: "100+" },
          { label: "Daily Submissions", value: "500+" },
          { label: "Problems", value: "100+" },
          { label: "Recruiters", value: "50+" },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <div className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <Terminal className="w-6 h-6 text-pink-400" />,
      title: "Built-in IDE",
      desc: "A powerful, browser-based code editor with syntax highlighting and auto-completion."
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-400" />,
      title: "Lightning Fast",
      desc: "Execute your code in milliseconds with our high-performance cloud runtime."
    },
    {
  icon: <Sparkles className="w-6 h-6 text-violet-400" />,
  title: "Instant Problem Synthesis",
  desc: "Turn a simple text prompt into a comprehensive coding challenge. Craft, customize, and share your unique algorithms in seconds."
}
  ];

  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to excel</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We provide the tools and environment for you to focus purely on problem-solving.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl bg-[#0f0f0f] border border-white/10 hover:border-pink-500/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:bg-pink-500/10 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
              <p className="text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction({ navigate }) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-white/10 text-center px-6 py-16">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to start your journey?</h2>
          <p className="text-gray-300 mb-8 text-lg max-w-xl mx-auto">
            Join the community today and get access to premium problems and detailed video solutions.
          </p>
          <button 
            onClick={() => navigate("/practice")}
            className="px-8 py-3 rounded-full bg-white text-black font-semibold hover:scale-105 transition-transform"
          >
            Get Started for Free
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#020202] pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-6 h-6 bg-gradient-to-tr from-pink-500 to-violet-600 rounded flex items-center justify-center">
              <Code2 className="text-white w-3 h-3" />
            </div>
            <span className="font-bold text-lg">EliteCodeAi</span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            The ultimate platform for sharpening your algorithmic skills and preparing for technical interviews.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Platform</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-pink-400 transition-colors">Browse Problems</a></li>
            <li><a href="#" className="hover:text-pink-400 transition-colors">Contests</a></li>
            <li><a href="#" className="hover:text-pink-400 transition-colors">IDE</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-pink-400 transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-pink-400 transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-pink-400 transition-colors">Blog</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Connect</h4>
          <div className="flex gap-4">
            <a href="https://github.com/rasesh02" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Github className="w-5 h-5 text-gray-400" />
            </a>
            <a href="https://x.com/RanaRasesh93278" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Twitter className="w-5 h-5 text-gray-400" />
            </a>
            <a href="https://www.linkedin.com/in/rasesh-rana-008302197/" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Linkedin className="w-5 h-5 text-gray-400" />
            </a>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
        <p>&copy; 2025 EliteCodeAi. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-gray-400">Privacy Policy</a>
          <a href="#" className="hover:text-gray-400">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}