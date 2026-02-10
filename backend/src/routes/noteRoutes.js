const express = require('express');
const router = express.Router();
const { createNote, getNotes, deleteNote, updateNote } = require('../controllers/noteController');
const auth = require('../middleware/authMiddleware');

// Sabhi routes ko protect karne ke liye 'auth' middleware use ho raha hai
router.post('/', auth, createNote);      // Naya note banane ke liye
router.get('/', auth, getNotes);        // Saare notes dekhne ke liye
router.put('/:id', auth, updateNote);    // Note edit karne ke liye (Naya add kiya)
router.delete('/:id', auth, deleteNote); // Note delete karne ke liye

module.exports = router;