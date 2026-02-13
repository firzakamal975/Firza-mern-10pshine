import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReactQuill, { Quill } from 'react-quill-new';
import { TagsInput } from "react-tag-input-component";
import Sidebar from '../components/Sidebar';
import { 
  FiPaperclip, FiX, FiFile, FiSearch, FiPlus, 
  FiTrash2, FiEdit3, FiCalendar, FiFilter,
  FiMapPin, FiStar, FiDownload, FiShare2, FiFileText 
} from 'react-icons/fi';
import 'react-quill-new/dist/quill.snow.css';

// Quill configurations
const ColorStyle = Quill.import('attributors/style/color');
const BackgroundStyle = Quill.import('attributors/style/background');
const SizeStyle = Quill.import('attributors/style/size');
const FontStyle = Quill.import('attributors/style/font');

SizeStyle.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '32px'];
FontStyle.whitelist = ['sans-serif', 'serif', 'monospace'];

Quill.register(ColorStyle, true);
Quill.register(BackgroundStyle, true);
Quill.register(SizeStyle, true);
Quill.register(FontStyle, true);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: [] });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const quillRef = useRef(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const API_BASE_URL = 'http://localhost:5000';

  const quillModules = {
    toolbar: {
      container: [
        [{ 'font': FontStyle.whitelist }],
        [{ 'size': SizeStyle.whitelist }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['undo', 'redo', 'clean']
      ],
      handlers: {
        undo: function() { this.quill.history.undo(); },
        redo: function() { this.quill.history.redo(); }
      }
    },
    history: { delay: 500, maxStack: 100, userOnly: true }
  };

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(res.data);
    } catch (err) { console.error('Fetch error:', err); }
  };

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (loggedInUser && token) {
      setUser(loggedInUser);
      fetchNotes();
    } else { navigate('/login'); }
  }, []);

  const handleDownload = async (id, title, type) => {
    const loadingToast = toast.loading(`Preparing your ${type.toUpperCase()}...`);
    try {
      let endpoint = `download-${type}`;
      if (type === 'word') endpoint = 'download-word';
      
      const response = await axios.get(`${API_BASE_URL}/api/notes/${endpoint}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const mimeTypes = {
        word: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        pdf: 'application/pdf',
        txt: 'text/plain'
      };

      const extension = type === 'word' ? 'docx' : (type === 'pdf' ? 'pdf' : 'txt');
      const blob = new Blob([response.data], { type: mimeTypes[type] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.replace(/\s+/g, '_')}.${extension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`${type.toUpperCase()} Downloaded!`, { id: loadingToast });
    } catch (err) {
      toast.error('Download failed', { id: loadingToast });
    }
  };

  const handleShare = async (note) => {
    const shareUrl = `${window.location.origin}/view-note/${note.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: `Check out my note: ${note.title}`,
          url: shareUrl
        });
        toast.success('Shared successfully!');
      } catch (err) { console.log('Share cancelled'); }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Public link copied to clipboard!');
    }
  };

  // FIX: Sorting based on updatedAt instead of createdAt
  const filteredAndSortedNotes = notes
    .filter(note => 
      (note.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    )
    .sort((a, b) => {
      if (b.isPinned !== a.isPinned) return b.isPinned - a.isPinned;
      if (sortBy === 'latest') return new Date(b.updatedAt) - new Date(a.updatedAt);
      if (sortBy === 'oldest') return new Date(a.updatedAt) - new Date(b.updatedAt);
      if (sortBy === 'alphabetical') return (a.title || "").localeCompare(b.title || "");
      return 0;
    });

  const handleToggleFeature = async (id, field) => {
    try {
      const noteToUpdate = notes.find(n => n.id === id);
      const res = await axios.put(`${API_BASE_URL}/api/notes/${id}`, 
        { [field]: !noteToUpdate[field] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(notes.map(n => n.id === id ? res.data : n));
      toast.success(field === 'isPinned' ? (res.data.isPinned ? 'Pinned' : 'Unpinned') : (res.data.isFavorite ? 'Starred' : 'Unstarred'));
    } catch (err) { toast.error('Update failed'); }
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Syncing...');
    try {
      const formData = new FormData();
      formData.append('title', newNote.title);
      formData.append('content', newNote.content);
      formData.append('tags', JSON.stringify(newNote.tags));
      if (file) formData.append('attachment', file);

      let res;
      if (editingNoteId) {
        res = await axios.put(`${API_BASE_URL}/api/notes/${editingNoteId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        setNotes(notes.map(n => n.id === editingNoteId ? res.data : n));
      } else {
        res = await axios.post(`${API_BASE_URL}/api/notes`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        setNotes([res.data, ...notes]);
      }
      toast.success('Note Saved!', { id: loadingToast });
      closeModal();
    } catch (err) { toast.error('Save failed', { id: loadingToast }); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.filter(n => n.id !== id));
      toast.success('Removed');
    } catch { toast.error('Delete failed'); }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewNote({ title: '', content: '', tags: [] });
    setEditingNoteId(null);
    setFile(null);
  };

  const handleEditClick = (note) => {
    setNewNote({ 
      title: note.title, 
      content: note.content, 
      tags: Array.isArray(note.tags) ? note.tags : JSON.parse(note.tags || '[]') 
    });
    setEditingNoteId(note.id);
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Hello, {user?.username} 👋</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
              Showing {filteredAndSortedNotes.length} Notes
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 group">
              <FiFilter className="text-slate-400 group-focus-within:text-indigo-600" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent pl-2 pr-4 py-3 text-[11px] font-black text-slate-500 uppercase outline-none cursor-pointer">
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
            <div className="relative group flex-1 md:flex-none">
              <FiSearch className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input type="text" placeholder="Search notes..." className="pl-11 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 w-full md:w-64 transition-all font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div onClick={() => { setIsModalOpen(true); setEditingNoteId(null); }} className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all min-h-[250px] group shadow-sm">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner"><FiPlus size={24} /></div>
            <span className="mt-4 font-black text-[11px] uppercase tracking-widest text-slate-400 group-hover:text-indigo-600">Create New Note</span>
          </div>

          {filteredAndSortedNotes.map(note => (
            <div key={note.id} className={`bg-white border ${note.isPinned ? 'border-indigo-200 ring-4 ring-indigo-50' : 'border-slate-100'} rounded-[2.5rem] p-7 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group relative`}>
              <div className="absolute top-7 right-7 flex items-center gap-2">
                <button onClick={() => handleToggleFeature(note.id, 'isPinned')} className={`p-2 rounded-xl transition-all ${note.isPinned ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300 hover:text-indigo-500'}`}><FiMapPin size={16} fill={note.isPinned ? "white" : "none"} /></button>
                <button onClick={() => handleToggleFeature(note.id, 'isFavorite')} className={`p-2 rounded-xl transition-all ${note.isFavorite ? 'bg-amber-400 text-white shadow-lg' : 'bg-slate-50 text-slate-300 hover:text-amber-500'}`}><FiStar size={16} fill={note.isFavorite ? "white" : "none"} /></button>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-slate-300 mb-4">
                  <FiCalendar size={12} />
                  {/* FIX: Showing updatedAt for accurate tracking */}
                  <span className="text-[10px] font-black uppercase tracking-tighter">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 leading-tight mb-3 truncate pr-20">{note.title}</h3>
                {note.attachment && (
                  <a href={`${API_BASE_URL}${note.attachment}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-[9px] font-black mb-4 border border-indigo-100"><FiPaperclip size={10}/> ATTACHMENT</a>
                )}
                <div className="text-slate-500 text-sm line-clamp-4 mb-4" dangerouslySetInnerHTML={{ __html: note.content }} />
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(note.tags) ? note.tags : []).map(tag => (
                    <span key={tag} className="text-[9px] font-black bg-slate-50 text-slate-400 px-2 py-1 rounded-md uppercase border border-slate-100">#{tag}</span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-slate-50 mt-6">
                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(note)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><FiEdit3 size={16}/></button>
                  <button onClick={() => handleDelete(note.id)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-all"><FiTrash2 size={16}/></button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleDownload(note.id, note.title, 'pdf')} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl" title="PDF"><FiFileText size={16}/></button>
                  <button onClick={() => handleDownload(note.id, note.title, 'word')} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl" title="Word"><FiFile size={16}/></button>
                  <button onClick={() => handleDownload(note.id, note.title, 'txt')} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl" title="Text"><FiDownload size={16}/></button>
                  <button onClick={() => handleShare(note)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl" title="Share"><FiShare2 size={16}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] p-10 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800">{editingNoteId ? '✏️ Update Thought' : '✨ New Note'}</h2>
              <button onClick={closeModal} className="p-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all text-slate-400"><FiX size={20}/></button>
            </div>
            <form onSubmit={handleSaveNote} className="space-y-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Note Title</label>
                  <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 focus:bg-white font-bold text-slate-700" placeholder="Capture your thought..." value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} required />
                </div>
                <div className="mb-1">
                  <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current.click()} className={`p-4 rounded-2xl border transition-all ${file ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-400'}`}><FiPaperclip size={24} /></button>
                </div>
              </div>
              {file && (
                <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-3 text-indigo-700"><FiFile size={16}/><span className="text-sm font-bold">{file.name}</span></div>
                  <FiX className="cursor-pointer text-indigo-300 hover:text-rose-500" onClick={() => setFile(null)} />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Content Editor</label>
                <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 quill-wrapper">
                  <style>{`.quill-wrapper .ql-container { min-height: 250px; font-size: 16px; background: white; border: none !important; } .quill-wrapper .ql-toolbar { background: #fcfcfd; border:none !important; border-bottom: 1px solid #f1f5f9 !important; padding: 12px !important; }`}</style>
                  <ReactQuill ref={quillRef} theme="snow" placeholder="Start typing your story..." modules={quillModules} value={newNote.content} onChange={val => setNewNote({...newNote, content: val})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tags</label>
                <TagsInput value={newNote.tags} onChange={tags => setNewNote({...newNote, tags})} placeHolder="Tag it..." />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 bg-slate-50 text-slate-500 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-slate-200">Discard</button>
                <button type="submit" className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl transition-all">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;