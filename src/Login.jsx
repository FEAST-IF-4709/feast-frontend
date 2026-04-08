import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
	
	const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
	const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Reset error setiap kali tombol ditekan
    setIsLoading(true);

    try {
      // 4. Tembak API Backend Django
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 5. Jika sukses, simpan Token JWT di localStorage browser
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        
        // 6. Arahkan ke halaman dashboard
        navigate('/dashboard');
      } else {
        // 7. Jika ditolak oleh Django (kredensial salah atau bukan is_staff)
        setError(data.detail || 'Email atau password salah! Silakan coba lagi.');
      }
    } catch (err) {
      // 8. Jika server Django mati / belum di-run
      setError('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
    } finally {
      setIsLoading(false);
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

        {/* Notifikasi Error Kustom yang estetik */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center text-red-500 text-sm">
            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Karyawan</label>
            <input 
              type="email" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-darkBg border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-darkBg border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors mt-4 text-white flex justify-center items-center ${
              isLoading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-primary hover:bg-purple-600'
            }`}
          >
            {isLoading ? (
               <span className="flex items-center">
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Memverifikasi...
               </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
      </div>
    </div>
  );
};

export default Login;