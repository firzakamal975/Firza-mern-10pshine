import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [file, setFile] = useState(null);
  // Preview logic: if user has a pic, show it; otherwise null
  const [preview, setPreview] = useState(user?.profilePic ? `http://localhost:5000${user.profilePic}` : null);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    gender: user?.gender || '',
    dob: user?.dob || '',
    newPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile)); // Create a temporary local URL for preview
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Updating profile...');
    
    try {
      const token = localStorage.getItem('token');
      
      // We MUST use FormData to send files to the backend
      const data = new FormData();
      data.append('username', formData.username);
      data.append('gender', formData.gender);
      data.append('dob', formData.dob);
      data.append('newPassword', formData.newPassword);
      if (file) {
        data.append('profilePic', file);
      }

      const res = await axios.put('http://localhost:5000/api/auth/update-profile', data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' // Tell axios we are sending a file
        }
      });
      
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      toast.success('Profile updated successfully!', { id: loadingToast });
      setFormData(prev => ({ ...prev, newPassword: '' })); // Clear password field
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed', { id: loadingToast });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      <Sidebar />
      <main className="flex-1 ml-64 p-10">
        <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Header & Avatar Section */}
          <div className="bg-indigo-600 p-10 text-white flex items-center gap-6">
            <div className="relative group">
              <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30 overflow-hidden shadow-inner">
                {preview ? (
                  <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.username?.charAt(0).toUpperCase()
                )}
              </div>
              
              {/* Overlay for Image Upload */}
              <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-all duration-300">
                <span className="text-[10px] font-black uppercase tracking-widest">Change</span>
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            </div>

            <div>
              <h2 className="text-3xl font-black tracking-tight">{user?.username}</h2>
              <p className="opacity-70 font-medium">{user?.email}</p>
              <span className="inline-block mt-2 text-[10px] bg-white/20 px-3 py-1 rounded-full font-bold uppercase tracking-tighter">Verified Member</span>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleUpdate} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-widest">Username</label>
              <input name="username" value={formData.username} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-widest">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 transition-all">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-widest">Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-widest">Update Password</label>
              <input type="password" name="newPassword" value={formData.newPassword} placeholder="Enter new password" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 transition-all" />
            </div>

            <div className="md:col-span-2 pt-6">
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 tracking-widest uppercase text-sm">
                Save All Changes
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;