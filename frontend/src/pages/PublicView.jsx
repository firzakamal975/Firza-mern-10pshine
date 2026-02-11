import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiCalendar, FiTag, FiFileText, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PublicView = () => {
    const { id } = useParams();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_BASE_URL = 'http://localhost:5000';

    useEffect(() => {
        const fetchPublicNote = async () => {
            try {
                // Bina token ke request
                const res = await axios.get(`${API_BASE_URL}/api/notes/share/public/${id}`);
                setNote(res.data);
            } catch (err) {
                console.error("Note not found or private access restricted.");
            } finally {
                setLoading(false);
            }
        };
        fetchPublicNote();
    }, [id]);

    const handlePublicDownload = async () => {
        const loadingToast = toast.loading("Preparing PDF...");
        try {
            const response = await axios.get(`${API_BASE_URL}/api/notes/download-pdf-public/${id}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${note.title.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            toast.success("Downloaded!", { id: loadingToast });
        } catch (err) {
            toast.error("Download failed", { id: loadingToast });
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!note) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 text-center">
            <div>
                <h1 className="text-4xl font-black text-slate-800 mb-2">404</h1>
                <p className="text-slate-500 font-bold">Oops! This note is no longer public or doesn't exist.</p>
            </div>
        </div>
    );

    // Tags check logic (taake crash na ho)
    const renderTags = () => {
        if (!note.tags) return null;
        const tagsArray = typeof note.tags === 'string' ? JSON.parse(note.tags) : note.tags;
        
        return tagsArray.map(tag => (
            <span key={tag} className="bg-slate-50 text-[10px] px-2 py-0.5 rounded border border-slate-100 uppercase font-bold text-slate-400">
                #{tag}
            </span>
        ));
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] py-12 px-6">
            <div className="max-w-3xl mx-auto bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-100">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-4">
                            <FiFileText /> Shared Thought
                        </div>
                        {/* Download Button for Public View */}
                        <button 
                            onClick={handlePublicDownload}
                            className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                            <FiDownload size={18} />
                        </button>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight mb-4">
                        {note.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm border-b border-slate-50 pb-6">
                        <div className="flex items-center gap-1.5">
                            <FiCalendar size={14} />
                            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiTag size={14} />
                            <div className="flex gap-1">
                                {renderTags()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div 
                    className="prose prose-indigo max-w-none text-slate-600 leading-relaxed min-h-[300px] public-content"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                />

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-slate-50 text-center">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        Created via Firza Notes App
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PublicView;