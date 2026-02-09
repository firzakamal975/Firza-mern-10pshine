const Note = require('../models/Note');

exports.createNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const note = await Note.create({ title, content, userId: req.user.id });
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.findAll({ where: { userId: req.user.id } });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        await Note.destroy({ where: { id: req.params.id, userId: req.user.id } });
        res.json({ message: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};