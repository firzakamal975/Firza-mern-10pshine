import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock } from 'react-icons/fi';

const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      toast.success('🚀 Account created successfully! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || '❌ Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] p-4">
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-[#00d2ff] via-[#4a00e0] to-[#8e2de2] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[550px] border border-white/10">
        
        {/* Left Side Content */}
        <div className="w-full md:w-5/12 p-12 flex flex-col justify-center text-white bg-black/10 backdrop-blur-sm">
          <h1 className="text-6xl font-black mb-6 tracking-tighter">Join Us</h1>
          <p className="text-white/80 text-lg font-medium leading-relaxed">
            Create an account to start <br/> organizing your thoughts today.
          </p>
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-7/12 p-12 bg-white/10 backdrop-blur-2xl flex flex-col justify-center border-l border-white/10">
          <form onSubmit={handleSignup} className="space-y-6">
            
            {/* Username Field */}
            <div>
              <label className="text-white/70 text-xs font-bold uppercase mb-2 block ml-1 tracking-widest">Username</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Enter your username" // FIXED: Generic placeholder
                  className="w-full bg-white rounded-xl pl-12 pr-5 py-4 text-slate-900 outline-none focus:ring-4 focus:ring-cyan-500/30 transition-all shadow-lg font-medium"
                  onChange={(e) => setFormData({...formData, username: e.target.value})} 
                  required 
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="text-white/70 text-xs font-bold uppercase mb-2 block ml-1 tracking-widest">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="name@example.com" // FIXED: Generic placeholder
                  className="w-full bg-white rounded-xl pl-12 pr-5 py-4 text-slate-900 outline-none focus:ring-4 focus:ring-cyan-500/30 transition-all shadow-lg font-medium"
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  required 
                />
              </div>
            </div>

            {/* Password Field with Show/Hide */}
            <div>
              <label className="text-white/70 text-xs font-bold uppercase mb-2 block ml-1 tracking-widest">Password</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full bg-white rounded-xl pl-12 pr-14 py-4 text-slate-900 outline-none focus:ring-4 focus:ring-cyan-500/30 transition-all shadow-lg font-medium"
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-2"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between">
              <Link to="/login" className="text-white/60 hover:text-white text-sm font-bold transition-all underline decoration-2 underline-offset-4">
                Already have an account?
              </Link>
              
              <button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-[#ec4899] via-[#3a7bd5] to-[#00d2ff] text-white font-black py-4 px-12 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Register Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;