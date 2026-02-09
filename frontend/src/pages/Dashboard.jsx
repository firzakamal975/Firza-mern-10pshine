import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [editingNoteId, setEditingNoteId] = useState(null); 

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // 1. Fetch Notes Logic
  const fetchNotes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(res.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (loggedInUser && token) {
      setUser(loggedInUser);
      fetchNotes();
    } else {
      navigate('/login');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 2. SAVE Logic (Handle both Create and Edit)
  const handleSaveNote = async (e) => {
    e.preventDefault();
    try {
      if (editingNoteId) {
        // --- EDIT MODE ---
        const res = await axios.put(`http://localhost:5000/api/notes/${editingNoteId}`, newNote, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const updatedNote = res.data.note;
        setNotes(notes.map(n => n.id === editingNoteId ? updatedNote : n));
      } else {
        // --- CREATE MODE ---
        const res = await axios.post('http://localhost:5000/api/notes', newNote, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setNotes([res.data, ...notes]);
      }

      setIsModalOpen(false);
      setNewNote({ title: '', content: '' });
      setEditingNoteId(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Operation failed. Please check your connection.");
    }
  };

  // 3. Edit Click Handler
  const handleEditClick = (note) => {
    setNewNote({ title: note.title, content: note.content });
    setEditingNoteId(note.id);
    setIsModalOpen(true);
  };

  // 4. Delete Logic
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:5000/api/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotes(notes.filter(note => note.id !== id));
      } catch (err) {
        alert("Could not delete the note. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-8 relative">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-12 bg-white/5 p-6 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">
            Welcome, <span className="text-cyan-400">{user?.username || 'Guest'}</span>! ✨
          </h1>
          <p className="text-white/50 font-medium">Capture your thoughts and organize your day.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-2 rounded-full font-bold transition-all border border-red-500/30"
        >
          Logout
        </button>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Note Card */}
        <div 
          onClick={() => {
            setEditingNoteId(null);
            setNewNote({ title: '', content: '' });
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 border-2 border-dashed border-white/10 rounded-[2rem] p-8 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400/40 transition-all group min-h-[250px]"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform opacity-50 group-hover:opacity-100">＋</div>
          <span className="font-bold text-white/40 group-hover:text-white">Create New Note</span>
        </div>

        {/* Notes Mapping */}
        {notes.length === 0 ? (
          <div className="col-span-full text-center py-20 opacity-20">
            <p className="text-2xl font-bold italic">No notes found. Start by adding one!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 hover:translate-y-[-5px] transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-cyan-400 truncate pr-2">{note.title}</h3>
                  <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full text-white/40 whitespace-nowrap">
                    {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-white/70 leading-relaxed mb-6 line-clamp-4">{note.content}</p>
              </div>
              
              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button 
                  onClick={() => handleEditClick(note)}
                  className="text-sm font-bold text-white/30 hover:text-cyan-400 transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(note.id)}
                  className="text-sm font-bold text-red-400/40 hover:text-red-500 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161b2c] w-full max-w-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl scale-in-center">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">
              {editingNoteId ? "Update Note" : "New Note"}
            </h2>
            
            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="text-white/30 text-[10px] font-bold uppercase tracking-widest ml-1">Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter title..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-400 text-white transition-all mt-1"
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                />
              </div>

              <div>
                <label className="text-white/30 text-[10px] font-bold uppercase tracking-widest ml-1">Content</label>
                <textarea 
                  required
                  placeholder="Write something amazing..." 
                  rows="5"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-400 text-white transition-all resize-none mt-1"
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                ></textarea>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl font-bold transition-all border border-white/5 text-white/60"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 flex-[2] py-3 rounded-xl font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  {editingNoteId ? "Save Changes" : "Create Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;