import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, LogOut, Star, Settings } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen w-64 bg-white border-r border-slate-200 flex flex-col p-6 fixed left-0 top-0 z-40">
      {/* Logo Section */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-200">
          N
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-800">NotesApp</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        <SidebarLink 
          to="/dashboard" 
          icon={<LayoutDashboard size={20}/>} 
          label="Dashboard" 
          active={isActive('/dashboard')} 
        />
        {/* Updated: My Notes to Favorite Notes */}
        <SidebarLink 
          to="/favorites" 
          icon={<Star size={20}/>} 
          label="Favorite Notes" 
          active={isActive('/favorites')} 
        />
        <SidebarLink 
          to="/profile" 
          icon={<User size={20}/>} 
          label="Profile" 
          active={isActive('/profile')} 
        />
        <SidebarLink 
          to="/settings" 
          icon={<Settings size={20}/>} 
          label="Settings" 
          active={isActive('/settings')} 
        />
      </nav>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="flex items-center gap-3 p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-bold mt-auto"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
};

const SidebarLink = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 p-3 rounded-xl transition-all font-bold ${
      active 
        ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
        : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default Sidebar;