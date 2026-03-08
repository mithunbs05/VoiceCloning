import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Navigate to home page
    navigate('/home');
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden dark">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-slate-950 to-blue-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div
          className="w-full max-w-md"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Logo/Brand */}
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold glow-text">VoiceClone AI</h1>
            </div>
            <p className="text-slate-400">Multilingual Voice Cloning Platform</p>
          </motion.div>

          {/* Login Card */}
          <motion.div className="glow-card p-8" variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
            <p className="text-slate-400 mb-6">Sign in to access your voice cloning workspace</p>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium mb-2 text-slate-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg pl-10 pr-4 py-3 text-slate-50 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition"
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium mb-2 text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg pl-10 pr-4 py-3 text-slate-50 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition"
                  />
                </div>
              </motion.div>

              {/* Remember & Forgot */}
              <motion.div
                className="flex items-center justify-between text-sm"
                variants={itemVariants}
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 bg-slate-800/50 border border-purple-500/20 rounded cursor-pointer accent-purple-500"
                  />
                  <span className="text-slate-400">Remember me</span>
                </label>
                <a href="#" className="text-purple-400 hover:text-purple-300 transition">
                  Forgot password?
                </a>
              </motion.div>

              {/* Login Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <motion.div className="relative my-6" variants={itemVariants}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-purple-500/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900/50 text-slate-400">Or</span>
              </div>
            </motion.div>

            {/* Sign Up Link */}
            <motion.p className="text-center text-slate-400" variants={itemVariants}>
              Don't have an account?{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300 font-semibold transition">
                Sign up free
              </a>
            </motion.p>
          </motion.div>

          {/* Footer */}
          <motion.p
            className="text-center text-xs text-slate-500 mt-6"
            variants={itemVariants}
          >
            Protected by enterprise-grade security
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
