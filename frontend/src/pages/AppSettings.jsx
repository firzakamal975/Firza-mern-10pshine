import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { FiUser, FiLock, FiBell, FiShield, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AppSettings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const API_BASE_URL = 'http://localhost:5000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (loggedInUser) {
      setUser(loggedInUser);
      // Backend se aane wali value ya local storage se check karein
      setIs2FAEnabled(loggedInUser.twoFactorEnabled || false);
    }
  }, []);

  // --- 2FA TOGGLE LOGIC ---
  const handleToggle2FA = async () => {
    if (!token) {
      return toast.error("Please login again. Token missing.");
    }

    const loadingToast = toast.loading('Updating security settings...');
    try {
      const newStatus = !is2FAEnabled;

      // URL updated to /api/auth/toggle-2fa to match your AuthRoutes
      const response = await axios.put(
        `${API_BASE_URL}/api/auth/toggle-2fa`, 
        { twoFactorEnabled: newStatus },
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          } 
        }
      );

      // Agar backend success return kare
      setIs2FAEnabled(newStatus);
      
      // Update local storage taake refresh par purana status na dikhe
      const updatedUser = { ...user, twoFactorEnabled: newStatus };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success(newStatus ? '2FA Activated! 🛡️' : '2FA Deactivated!', { id: loadingToast });
    } catch (err) {
      console.error("2FA Error Details:", err.response?.data);
      const msg = err.response?.data?.message || 'Could not update 2FA status';
      toast.error(msg, { id: loadingToast });
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API Call for profile update
    setTimeout(() => {
      toast.success('Profile updated successfully!');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-800">Settings</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Manage your account preferences and security.</p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Profile Section */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <FiUser size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Public Profile</h2>
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Personal Information</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                    <input 
                      type="text" 
                      defaultValue={user?.username}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue={user?.email}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 font-bold text-slate-700"
                      disabled
                    />
                  </div>
                </div>
                <button 
                  disabled={loading}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                  <FiShield size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Security & Privacy</h2>
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Protection Settings</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* 2FA SWITCH */}
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400"><FiLock /></div>
                    <div>
                      <p className="font-bold text-slate-700">Two-Factor Authentication</p>
                      <p className="text-xs text-slate-400">Security code required during login.</p>
                    </div>
                  </div>
                  
                  {/* Toggle Switch */}
                  <div 
                    onClick={handleToggle2FA}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${is2FAEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${is2FAEnabled ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>

                {/* NOTIFICATIONS SWITCH */}
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400"><FiBell /></div>
                    <div>
                      <p className="font-bold text-slate-700">Email Notifications</p>
                      <p className="text-xs text-slate-400">Get notified about important account activity.</p>
                    </div>
                  </div>
                  <div 
                    onClick={() => setNotifications(!notifications)}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${notifications ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${notifications ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppSettings;