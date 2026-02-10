import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', response.data.token); // Token save karne ke liye
      alert('🔑 Login Successful! Welcome back.');
      navigate('/dashboard'); // Login ke baad kahan jana hai
    } catch (err) {
      alert(err.response?.data?.message || '❌ Login Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] p-4">
      {/* Floating Card - Exactly matching Signup style */}
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-[#00d2ff] via-[#4a00e0] to-[#8e2de2] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[550px] border border-white/10">
        
        {/* Left Side: Text Content (Reversed Gradient for variety) */}
        <div className="w-full md:w-5/12 p-12 flex flex-col justify-center text-white bg-black/10 backdrop-blur-sm">
          <h1 className="text-6xl font-black mb-6 tracking-tighter">Login</h1>
          <p className="text-white/80 text-lg font-medium leading-relaxed">
            Welcome Back! <br/> Please enter your details to access your workspace.
          </p>
          <div className="mt-12">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
               <span className="text-3xl text-white">🔐</span>
            </div>
          </div>
        </div>

        {/* Right Side: Glass Form */}
        <div className="w-full md:w-7/12 p-12 bg-white/10 backdrop-blur-2xl flex flex-col justify-center border-l border-white/10">
          <form onSubmit={handleLogin} className="space-y-8">
            
            <div>
              <label className="text-white/70 text-xs font-bold uppercase mb-2 block ml-1 tracking-widest">Email Address</label>
              <input 
                type="email" 
                placeholder="email@example.com" 
                className="w-full bg-white rounded-xl px-5 py-4 text-slate-900 outline-none focus:ring-4 focus:ring-cyan-500/30 transition-all shadow-lg"
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>

            <div>
              <label className="text-white/70 text-xs font-bold uppercase mb-2 block ml-1 tracking-widest">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-white rounded-xl px-5 py-4 text-slate-900 outline-none focus:ring-4 focus:ring-cyan-500/30 transition-all shadow-lg"
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
              />
            </div>

            <div className="pt-6 flex items-center justify-between">
              <Link to="/signup" className="text-white/60 hover:text-white text-sm font-bold transition-all underline decoration-2 underline-offset-4">
                New here? Create account
              </Link>
              
              <button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-[#ec4899] via-[#3a7bd5] to-[#00d2ff] text-white font-black py-4 px-12 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
              >
                {loading ? 'Logging in...' : 'Login Button'}
              </button>
            </div>
          </form>
        </div>

        {/* Diagonal Shine Effect */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-12 transform scale-150"></div>
      </div>
    </div>
  );
};

export default Login;