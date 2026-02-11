const express = require('express');
const router = express.Router();
const { createNote, getNotes, deleteNote, updateNote } = require('../controllers/noteController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', auth, upload.single('attachment'), createNote);
router.get('/', auth, getNotes);
router.put('/:id', auth, upload.single('attachment'), updateNote);
router.delete('/:id', auth, deleteNote);

module.exports = router;