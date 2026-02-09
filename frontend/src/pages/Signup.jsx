import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert('✨ Registration Successful!');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || '❌ Signup Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      {/* Floating Gradient Card Container */}
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[550px] border border-white/10">
        
        {/* Left Side Content */}
        <div className="w-full md:w-5/12 p-12 flex flex-col justify-center text-white bg-black/5">
          <h1 className="text-6xl font-black mb-6 tracking-tighter">Signup</h1>
          <p className="text-white/80 text-lg font-medium leading-relaxed">
            Join us today! <br/> Start organizing your tasks with our colorful workspace.
          </p>
          <div className="mt-12">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
               <span className="text-3xl">📝</span>
            </div>
          </div>
        </div>

        {/* Right Side Glass Form */}
        <div className="w-full md:w-7/12 p-12 bg-white/10 backdrop-blur-2xl flex flex-col justify-center border-l border-white/10">
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label className="text-white/70 text-sm font-bold ml-1 uppercase tracking-wider">Username</label>
              <input 
                type="text" 
                placeholder="firzakamal" 
                className="w-full bg-white rounded-2xl px-6 py-4 text-slate-900 placeholder-slate-400 outline-none focus:ring-4 focus:ring-purple-500/30 transition-all shadow-xl"
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-white/70 text-sm font-bold ml-1 uppercase tracking-wider">Email</label>
              <input 
                type="email" 
                placeholder="email@example.com" 
                className="w-full bg-white rounded-2xl px-6 py-4 text-slate-900 placeholder-slate-400 outline-none focus:ring-4 focus:ring-purple-500/30 transition-all shadow-xl"
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-white/70 text-sm font-bold ml-1 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-white rounded-2xl px-6 py-4 text-slate-900 placeholder-slate-400 outline-none focus:ring-4 focus:ring-purple-500/30 transition-all shadow-xl"
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
              />
            </div>

            <div className="pt-6 flex items-center justify-between">
              <Link to="/login" className="text-white/60 hover:text-white text-sm font-bold transition-all underline underline-offset-4 decoration-2">
                Already a member?
              </Link>
              
              <button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 text-white font-black py-4 px-10 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? '...' : 'Signup Button'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;