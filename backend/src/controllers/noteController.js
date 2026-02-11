const Note = require('../models/Note');

// 1. Create a new Note
exports.createNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        const note = await Note.create({ 
            title, 
            content, 
            userId: req.user.id 
        });
        
        // Seedha note object bhejein taake frontend asani se handle kare
        res.status(201).json(note); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Get all Notes
exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.findAll({ 
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']] 
        });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Update a Note
exports.updateNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const note = await Note.findOne({ where: { id: req.params.id, userId: req.user.id } });

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        note.title = title || note.title;
        note.content = content || note.content;
        await note.save();

        // Updated note bhejein
        res.json(note); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Delete a Note
exports.deleteNote = async (req, res) => {
    try {
        const result = await Note.destroy({ 
            where: { id: req.params.id, userId: req.user.id } 
        });
        if (result === 0) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};