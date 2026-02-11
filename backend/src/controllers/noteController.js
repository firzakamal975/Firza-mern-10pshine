const Note = require('../models/Note');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun } = require("docx");
const { htmlToText } = require('html-to-text');
const fs = require('fs');
const path = require('path');

// 1. Create New Note
exports.createNote = async (req, res) => {
    try {
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
            title, content, tags: parsedTags,
            attachment: attachmentPath,
            isPinned: isPinned === 'true' || isPinned === true,
            isFavorite: isFavorite === 'true' || isFavorite === true,
            userId: req.user.id 
        });
        res.status(201).json(note); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Get All Notes (Private)
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

// 3. Public Note Access (No Login Needed)
exports.getPublicNote = async (req, res) => {
    try {
        const note = await Note.findByPk(req.params.id);
        if (!note) return res.status(404).json({ message: "Note not found" });
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Update Note
exports.updateNote = async (req, res) => {
    try {
        const { title, content, tags, isPinned, isFavorite } = req.body;
        const note = await Note.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!note) return res.status(404).json({ message: "Note not found" });

        const updatedData = {
            title: title || note.title,
            content: content || note.content
        };
        if (isPinned !== undefined) updatedData.isPinned = isPinned === 'true' || isPinned === true;
        if (isFavorite !== undefined) updatedData.isFavorite = isFavorite === 'true' || isFavorite === true;
        if (req.file) updatedData.attachment = `/uploads/${req.file.filename}`.replace(/\\/g, "/");
        if (tags) updatedData.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;

        await note.update(updatedData);
        await note.reload();
        res.json(note); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Delete Note
exports.deleteNote = async (req, res) => {
    try {
        const result = await Note.destroy({ where: { id: req.params.id, userId: req.user.id } });
        if (result === 0) return res.status(404).json({ message: "Note not found" });
        res.json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. PDF Download (Private)
exports.downloadNotePDF = async (req, res) => {
    try {
        const note = await Note.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!note) return res.status(404).json({ message: "Note not found" });
        generatePDF(note, res);
    } catch (error) {
        res.status(500).json({ message: "PDF generation failed" });
    }
};

// 7. NEW: PDF Download (Public - Bina Login)
exports.downloadNotePDFPublic = async (req, res) => {
    try {
        const note = await Note.findByPk(req.params.id);
        if (!note) return res.status(404).json({ message: "Note not found" });
        generatePDF(note, res);
    } catch (error) {
        res.status(500).json({ message: "Public PDF generation failed" });
    }
};

// Helper function to avoid code repetition
const generatePDF = (note, res) => {
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${note.title.replace(/\s+/g, '_')}.pdf`);
    doc.pipe(res);
    doc.fillColor('#4f46e5').fontSize(26).text(note.title, { underline: true });
    doc.moveDown();
    const cleanContent = htmlToText(note.content);
    doc.fillColor('#000000').fontSize(14).text(cleanContent, { align: 'justify', lineGap: 5 });
    doc.end();
};

// 8. WORD Download
exports.downloadNoteWord = async (req, res) => {
    try {
        const note = await Note.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!note) return res.status(404).json({ message: "Note not found" });

        const cleanContent = htmlToText(note.content, { wordwrap: 130 });
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ children: [new TextRun({ text: note.title, bold: true, size: 36, color: "4f46e5" })] }),
                    new Paragraph({ children: [new TextRun({ text: `Date: ${new Date(note.createdAt).toLocaleDateString()}`, italic: true, size: 20 })] }),
                    new Paragraph({ text: "" }),
                    ...cleanContent.split('\n').map(line => new Paragraph({ children: [new TextRun({ text: line, size: 24 })] }))
                ],
            }],
        });
        const buffer = await Packer.toBuffer(doc);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename=${note.title.replace(/\s+/g, '_')}.docx`);
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: "Word generation failed" });
    }
};

// 9. TEXT Download
exports.downloadNoteText = async (req, res) => {
    try {
        const note = await Note.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!note) return res.status(404).json({ message: "Note not found" });
        const cleanContent = htmlToText(note.content);
        const fullText = `TITLE: ${note.title}\nDATE: ${new Date(note.createdAt).toLocaleString()}\n\n${cleanContent}`;
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename=${note.title.replace(/\s+/g, '_')}.txt`);
        res.send(fullText);
    } catch (error) {
        res.status(500).json({ message: "Text download failed" });
    }
};