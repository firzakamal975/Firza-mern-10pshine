const Note = require('../models/Note');

// 1. Create a new Note
exports.createNote = async (req, res) => {
    try {
        // --- Added isPinned, isFavorite here ---
        const { title, content, tags, isPinned, isFavorite } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        let attachmentPath = null;
        if (req.file) {
            attachmentPath = `/uploads/${req.file.filename}`.replace(/\\/g, "/");
        }

        let parsedTags = [];
        if (tags) {
            parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        }

        const note = await Note.create({ 
            title, 
            content, 
            tags: parsedTags,
            attachment: attachmentPath,
            // --- Logic for Boolean values ---
            isPinned: isPinned === 'true' || isPinned === true,
            isFavorite: isFavorite === 'true' || isFavorite === true,
            userId: req.user.id 
        });
        
        res.status(201).json(note); 
    } catch (error) {
        console.error("Create Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// 2. Get all Notes (Pinned sorting yahan add karne ki zaroorat nahi, hum frontend par handle kar rahe hain)
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
        // --- Added isPinned, isFavorite here ---
        const { title, content, tags, isPinned, isFavorite } = req.body;
        
        const note = await Note.findOne({ 
            where: { id: req.params.id, userId: req.user.id } 
        });

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        const updatedData = {
            title: title || note.title,
            content: content || note.content
        };

        // --- Pin/Favorite Toggle Logic ---
        if (isPinned !== undefined) {
            updatedData.isPinned = isPinned === 'true' || isPinned === true;
        }
        if (isFavorite !== undefined) {
            updatedData.isFavorite = isFavorite === 'true' || isFavorite === true;
        }

        if (req.file) {
            updatedData.attachment = `/uploads/${req.file.filename}`.replace(/\\/g, "/");
        }

        if (tags) {
            updatedData.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        }

        await note.update(updatedData);
        await note.reload();

        res.json(note); 
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// 4. Delete a Note (No changes needed)
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