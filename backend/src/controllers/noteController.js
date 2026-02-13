const Note = require('../models/Note');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const { htmlToText } = require('html-to-text');
const logger = require('../utils/logger');

/* =====================================================
   1. Create New Note
===================================================== */
exports.createNote = async (req, res) => {
  try {
    const { title, content, tags, isPinned, isFavorite } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: 'Title and content are required',
      });
    }

    // Handle attachment
    let attachmentPath = null;
    if (req.file) {
      attachmentPath = `/uploads/${req.file.filename}`.replace(/\\/g, '/');
    }

    // Parse tags safely
    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }

    const note = await Note.create({
      title,
      content,
      tags: parsedTags,
      attachment: attachmentPath,
      isPinned: isPinned === 'true' || isPinned === true,
      isFavorite: isFavorite === 'true' || isFavorite === true,
      userId: req.user.id,
    });

    return res.status(201).json(note);
  } catch (error) {
    logger.error(`Create Note Error: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   2. Get All Notes (Private)
===================================================== */
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { userId: req.user.id },
      // FIX: Latest updated notes will appear first
      order: [['updatedAt', 'DESC']], 
    });

    return res.json(notes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   3. Public Note Access
===================================================== */
exports.getPublicNote = async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    return res.json(note);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   4. Update Note
===================================================== */
exports.updateNote = async (req, res) => {
  try {
    const { title, content, tags, isPinned, isFavorite } = req.body;

    const note = await Note.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const updatedData = {
      title: title || note.title,
      content: content || note.content,
    };

    if (isPinned !== undefined) {
      updatedData.isPinned = isPinned === 'true' || isPinned === true;
    }

    if (isFavorite !== undefined) {
      updatedData.isFavorite = isFavorite === 'true' || isFavorite === true;
    }

    if (req.file) {
      updatedData.attachment = `/uploads/${req.file.filename}`.replace(/\\/g, '/');
    }

    if (tags) {
      updatedData.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }

    // Sequelize automatically updates 'updatedAt' on .update()
    await note.update(updatedData);
    await note.reload();

    logger.info(`Note updated: ${note.id} at ${note.updatedAt}`);
    return res.json(note);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   5. Delete Note
===================================================== */
exports.deleteNote = async (req, res) => {
  try {
    const result = await Note.destroy({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (result === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }

    return res.json({ message: 'Deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   6. PDF Download (Private)
===================================================== */
exports.downloadNotePDF = async (req, res) => {
  try {
    const note = await Note.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    generatePDF(note, res);
  } catch (error) {
    return res.status(500).json({ message: 'PDF generation failed' });
  }
};

/* =====================================================
   7. PDF Download (Public)
===================================================== */
exports.downloadNotePDFPublic = async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    generatePDF(note, res);
  } catch (error) {
    return res.status(500).json({ message: 'Public PDF generation failed' });
  }
};

/* =====================================================
   Helper: Generate PDF
===================================================== */
const generatePDF = (note, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=${note.title.replace(/\s+/g, '_')}.pdf`
  );

  doc.pipe(res);

  doc
    .fillColor('#4f46e5')
    .fontSize(26)
    .text(note.title, { underline: true });

  // Adding Date to PDF
  doc
    .fillColor('#666666')
    .fontSize(10)
    .text(`Last Updated: ${new Date(note.updatedAt).toLocaleString()}`, { align: 'right' });

  doc.moveDown();

  const cleanContent = htmlToText(note.content);

  doc
    .fillColor('#000000')
    .fontSize(14)
    .text(cleanContent, { align: 'justify', lineGap: 5 });

  doc.end();
};

/* =====================================================
   8. Word Download
===================================================== */
exports.downloadNoteWord = async (req, res) => {
  try {
    const note = await Note.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const cleanContent = htmlToText(note.content, { wordwrap: 130 });

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: note.title,
                  bold: true,
                  size: 36,
                  color: '4f46e5',
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  // FIX: Display UpdatedAt instead of CreatedAt
                  text: `Last Updated: ${new Date(note.updatedAt).toLocaleString()}`,
                  italic: true,
                  size: 20,
                }),
              ],
            }),
            new Paragraph({ text: '' }),
            ...cleanContent.split('\n').map(
              (line) =>
                new Paragraph({
                  children: [new TextRun({ text: line, size: 24 })],
                })
            ),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${note.title.replace(/\s+/g, '_')}.docx`
    );

    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: 'Word generation failed' });
  }
};

/* =====================================================
   9. Text Download
===================================================== */
exports.downloadNoteText = async (req, res) => {
  try {
    const note = await Note.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const cleanContent = htmlToText(note.content);

    const fullText = `
TITLE: ${note.title}
LAST UPDATED: ${new Date(note.updatedAt).toLocaleString()}

${cleanContent}
    `;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${note.title.replace(/\s+/g, '_')}.txt`
    );

    return res.send(fullText);
  } catch (error) {
    return res.status(500).json({ message: 'Text download failed' });
  }
};