import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from './api/client';
import { saveTokens } from './api/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/staff/login/', { email, password });

      // Save JWT tokens
      saveTokens({
        access: data.data.access,
        refresh: data.data.refresh,
      });

      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const apiData = err.response?.data;

      if (status === 401) {
        setError('Email atau password salah. Silakan coba lagi.');
      } else if (status === 400 && apiData?.errors) {
        // Show first validation error
        const firstError = apiData.errors[0];
        setError(firstError?.detail || 'Input tidak valid.');
      } else if (status === 429) {
        setError('Terlalu banyak percobaan login. Tunggu beberapa saat.');
      } else if (!err.response) {
        setError('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
      } else {
        setError(apiData?.message || 'Terjadi kesalahan. Coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-feast-bg font-vietnam flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }} 
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-feast-amber/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }} 
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-feast-sunset/8 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" 
      />

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-jakarta text-feast-sunset tracking-wider">
              FEAST
            </h1>
            <p className="text-feast-dark-muted text-xs uppercase tracking-[0.25em] mt-1 font-medium">
              The Kinetic Kitchen
            </p>
          </div>

          {/* Welcome */}
          <h2 className="text-2xl font-bold font-jakarta text-feast-dark mb-8">
            Welcome Back
          </h2>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 rounded-xl p-4 flex items-center gap-3 text-red-600 text-sm">
              <AlertCircle size={18} className="flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-feast-dark-muted mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-feast-dark-muted/50" />
                <input
                  type="email"
                  placeholder="chef@feast.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-feast-bg rounded-xl pl-11 pr-4 py-3.5 text-feast-dark font-vietnam text-sm placeholder-feast-dark-muted/40 focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-feast-dark-muted mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-feast-dark-muted/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-feast-bg rounded-xl pl-11 pr-12 py-3.5 text-feast-dark font-vietnam text-sm placeholder-feast-dark-muted/40 focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 transition-all"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-feast-dark-muted/50 hover:text-feast-dark-muted transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-full text-white font-semibold text-sm transition-all duration-300 mt-2 ${
                isLoading
                  ? 'bg-feast-dark-muted cursor-not-allowed'
                  : 'bg-gradient-to-r from-feast-sunset to-feast-sunset-light hover:shadow-lg hover:shadow-feast-sunset/25 hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin w-5 h-5" />
                  Verifying...
                </span>
              ) : (
                'Login'
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;