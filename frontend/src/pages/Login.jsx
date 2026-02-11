import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast'; // Toast notifications for better UI

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  
  // --- 2FA STATES ---
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempUser, setTempUser] = useState(null); // Login ke baad user data temporarily yahan save hoga

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      // Agar backend bole ke 2FA enabled hai
      if (response.data.requires2FA) {
        setTempUser(response.data); // OTP verify hone tak data save rakho
        setShowOtpModal(true);
        toast.success('🛡️ 2FA Required: OTP sent to your email!');
      } else {
        // Normal Login Process
        localStorage.setItem('token', response.data.token); 
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('🔑 Login Successful!');
        navigate('/dashboard'); 
      }
      
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || '❌ Login Failed');
    } finally {
      setLoading(false);
    }
  };

  // --- OTP VERIFICATION LOGIC ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email: formData.email,
        otp: otp
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('✅ Verification Successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || '❌ Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] p-4">
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-[#00d2ff] via-[#4a00e0] to-[#8e2de2] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[550px] border border-white/10">
        
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

        <div className="w-full md:w-7/12 p-12 bg-white/10 backdrop-blur-2xl flex flex-col justify-center border-l border-white/10">
          <form onSubmit={handleLogin} className="space-y-6">
            
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
              <div className="flex justify-end mt-2">
                <Link 
                  to="/forgot-password" 
                  className="text-white/50 hover:text-cyan-400 text-xs font-bold transition-colors tracking-tight"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between">
              <Link to="/signup" className="text-white/60 hover:text-white text-sm font-bold transition-all underline decoration-2 underline-offset-4">
                New here? Create account
              </Link>
              
              <button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-[#ec4899] via-[#3a7bd5] to-[#00d2ff] text-white font-black py-4 px-12 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login Now'}
              </button>
            </div>
          </form>
        </div>

        {/* --- OTP MODAL SECTION --- */}
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-300">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-4xl">🛡️</div>
                <h2 className="text-2xl font-black text-slate-800">Verify Identity</h2>
                <p className="text-slate-400 text-sm mt-2">Enter the 6-digit code sent to your email.</p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <input 
                  type="text" 
                  maxLength="6"
                  placeholder="000000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-center text-3xl font-black tracking-[0.5em] text-slate-700 outline-none focus:border-indigo-500 transition-all"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
                >
                  {loading ? 'Verifying...' : 'Verify & Access'}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="w-full text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-rose-500 transition-all"
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-12 transform scale-150"></div>
      </div>
    </div>
  );
};

export default Login;