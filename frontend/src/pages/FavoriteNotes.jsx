import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { FiStar, FiCalendar, FiInbox } from 'react-icons/fi';

const FavoriteNotes = () => {
  const [favorites, setFavorites] = useState([]);
  const token = localStorage.getItem('token');
  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/notes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Sirf wahi notes filter kar rahe hain jo favorite hain
        const favNotes = res.data.filter(note => note.isFavorite === 1 || note.isFavorite === true);
        setFavorites(favNotes);
      } catch (err) {
        console.error('Error fetching favorites:', err);
      }
    };
    fetchFavorites();
  }, [token]);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-10 flex items-center gap-5 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
              <FiStar size={30} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800">Favorite Notes</h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Your starred collection</p>
            </div>
          </div>

          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map(note => (
                <div key={note.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-7 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                  {/* Floating Star Icon */}
                  <div className="absolute top-7 right-7">
                    <FiStar size={20} fill="#f59e0b" className="text-amber-500" />
                  </div>
                  
                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-slate-300 mb-4">
                    <FiCalendar size={12} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">
                      {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Title & Content */}
                  <h3 className="text-lg font-bold text-slate-800 mb-3 truncate pr-12">{note.title}</h3>
                  <div className="text-slate-500 text-sm line-clamp-4 mb-5" dangerouslySetInnerHTML={{ __html: note.content }} />
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                    {note.tags?.map(tag => (
                      <span key={tag} className="text-[9px] font-black bg-slate-50 text-slate-400 px-2.5 py-1 rounded-lg uppercase border border-slate-100">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-32 bg-white rounded-[3.5rem] border border-dashed border-slate-200 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiInbox size={40} className="text-slate-200" />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No favorites found!</p>
              <p className="text-slate-300 text-sm mt-2 font-medium">Star some notes to see them here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FavoriteNotes;