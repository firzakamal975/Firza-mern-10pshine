import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import { TagsInput } from "react-tag-input-component";
import 'react-quill-new/dist/quill.snow.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: [] });
  const [editingNoteId, setEditingNoteId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchNotes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
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
    toast.success('Logged out');
    navigate('/login');
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    try {
      if (editingNoteId) {
        const res = await axios.put(`http://localhost:5000/api/notes/${editingNoteId}`, newNote, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotes(notes.map(n => n.id === editingNoteId ? res.data : n));
        toast.success('Note updated');
      } else {
        const res = await axios.post('http://localhost:5000/api/notes', newNote, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotes([res.data, ...notes]);
        toast.success('Note created');
      }
      setIsModalOpen(false);
      setNewNote({ title: '', content: '', tags: [] });
      setEditingNoteId(null);
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleEditClick = (note) => {
    setNewNote({ title: note.title, content: note.content, tags: note.tags || [] });
    setEditingNoteId(note.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this note?')) {
      try {
        await axios.delete(`http://localhost:5000/api/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotes(notes.filter(note => note.id !== id));
        toast.success('Note deleted');
      } catch {
        toast.error('Delete failed');
      }
    }
  };

  const filteredNotes = [...notes].filter(note => 
    (note.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 bg-white/5 p-6 rounded-3xl border border-white/10 gap-6">
        <div>
          <h1 className="text-3xl font-black">Welcome, <span className="text-cyan-400">{user?.username}</span></h1>
          <p className="text-white/50">Manage your formatted notes and tags.</p>
        </div>
        
        <input 
          type="text" 
          placeholder="Search by title or tags..."
          className="bg-white/5 border border-white/10 rounded-full px-6 py-2 outline-none focus:border-cyan-400 w-full md:w-72 transition"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button onClick={handleLogout} className="text-red-500 font-bold hover:text-red-400 transition">Logout</button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => { setIsModalOpen(true); setEditingNoteId(null); setNewNote({title:'', content:'', tags:[]}) }}
          className="border-2 border-dashed border-white/10 rounded-[2rem] p-8 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400/40 transition min-h-[250px]"
        >
          <span className="text-5xl opacity-30">＋</span>
          <span className="mt-4 font-bold text-white/30">Create Formatted Note</span>
        </div>

        {filteredNotes.map(note => (
          <div key={note.id} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:-translate-y-1 transition flex flex-col justify-between min-h-[250px]">
            <div>
              <h3 className="text-xl font-bold text-cyan-400 mb-2 truncate">{note.title}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {note.tags?.map(tag => (
                  <span key={tag} className="text-[10px] bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-400/20">#{tag}</span>
                ))}
              </div>
              <div className="text-white/70 prose prose-invert prose-sm line-clamp-4 overflow-hidden" dangerouslySetInnerHTML={{ __html: note.content }} />
            </div>
            
            <div className="flex gap-4 pt-4 border-t border-white/5 mt-4">
              <button onClick={() => handleEditClick(note)} className="text-sm font-bold text-white/30 hover:text-cyan-400">Edit</button>
              <button onClick={() => handleDelete(note.id)} className="text-sm font-bold text-red-400/30 hover:text-red-500">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b2c] w-full max-w-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">{editingNoteId ? 'Update Note' : 'New Note'}</h2>
            <form onSubmit={handleSaveNote} className="space-y-6">
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-400 text-white"
                placeholder="Note Title" 
                value={newNote.title} 
                onChange={e => setNewNote({...newNote, title: e.target.value})} 
                required 
              />
              
              <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10 min-h-[200px]">
                <ReactQuill 
                  theme="snow" 
                  value={newNote.content} 
                  onChange={val => setNewNote({...newNote, content: val})}
                  placeholder="Write your note here (use toolbar for formatting)..."
                />
              </div>

              <div className="custom-tag-input text-black">
                <TagsInput 
                  value={newNote.tags} 
                  onChange={tags => setNewNote({...newNote, tags})} 
                  name="tags" 
                  placeHolder="Enter tags and press enter" 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white/5 py-3 rounded-xl font-bold hover:bg-white/10 transition">Cancel</button>
                <button type="submit" className="flex-[2] bg-gradient-to-r from-cyan-500 to-blue-600 py-3 rounded-xl font-bold hover:brightness-110 transition">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;