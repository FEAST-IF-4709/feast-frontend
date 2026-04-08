import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (username === 'admin123' && password === '12345') {
      navigate('/dashboard');
    } else {
      alert('Username atau Password salah! Silakan coba lagi.'); 
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-cardBg rounded-2xl shadow-xl border border-gray-800 p-8">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-4">
            <UtensilsCrossed size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-wider">FEAST</h2>
          <p className="text-gray-400 mt-2 text-sm">Welcome back! Please login to your account.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input 
              type="text" 
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-darkBg border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-darkBg border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-4"
          >
            Sign In
          </button>
        </form>
        
      </div>
    </div>
  );
};

export default Login;