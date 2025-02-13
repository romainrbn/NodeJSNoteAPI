const express = require('express');
const Note = require('../models/note');

const router = express.Router();

/**
 * @route POST /notes
 * @desc Create a new note
 */
router.post('/', async (req, res) => {
    try {
        const { title, content } = req.body;
        const note = new Note({ userId: req.user.id, title, content });
        const savedNote = await note.save();
        res.status(201).json(savedNote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route GET /notes
 * @desc Retrieve all notes
 */
router.get('/', async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user.id });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /notes/:id
 * @desc    Retrieve a single note by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   DELETE /notes/:id
 * @desc    Delete a note by ID
 */
router.delete('/:id', async (req, res) => {
    try {
        const deletedNote = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!deletedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route DELETE /notes
 * @desc Delete all notes
 */
router.delete('/', async (req, res) => {
    try {
        await Note.deleteMany({ userId: req.user.id });
        res.json({ message: 'All notes have been deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
