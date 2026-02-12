const express = require('express');
const router = express.Router();
const { 
    createNote, 
    getNotes, 
    deleteNote, 
    updateNote, 
    downloadNotePDF,  
    downloadNoteText,
    downloadNoteWord,
    getPublicNote,
    downloadNotePDFPublic // Naya public download function
} = require('../controllers/noteController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// --- Standard CRUD Routes (Login required) ---
router.post('/', auth, upload.single('attachment'), createNote);
router.get('/', auth, getNotes);
router.put('/:id', auth, upload.single('attachment'), updateNote);
router.delete('/:id', auth, deleteNote);

// --- Public Access Routes (NO Login required) ---
router.get('/share/public/:id', getPublicNote); 
router.get('/download-pdf-public/:id', downloadNotePDFPublic); 

// --- Private Download Routes ---
router.get('/download-pdf/:id', auth, downloadNotePDF);
router.get('/download-txt/:id', auth, downloadNoteText);
router.get('/download-word/:id', auth, downloadNoteWord);

module.exports = router;