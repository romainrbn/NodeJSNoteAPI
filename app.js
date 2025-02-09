const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.port || 3000;

app.use(express.json());

mongoose.connect('mongodb+srv://romainrabouan1mongo:7Fzrdb20J6CrTI84@cluster0.glkcw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

const noteSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: String,
        createdAt: { type: Date, default: Date.now }
    },
    {
        versionKey: false,
        toJSON: {
            transform: function (doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            }
        }
    }
);

const Note = mongoose.model('Note', noteSchema);

const noteChangeStream = Note.watch();

noteChangeStream.on('change', (change) => {
    console.log('Change detected:', change);
    io.emit('noteChange', change);
})

io.on('connection', (socket) => {
    console.log('A client connected: ', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

/**
 * @route POST /notes
 * @desc Create a new note
 */
app.post('/notes', async (req, res) => {
    try {
        const { title, content } = req.body;
        const note = new Note({ title, content });
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
app.get('/notes', async (req, res) => {
    try {
        const notes = await Note.find();
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /notes/:id
 * @desc    Retrieve a single note by ID
 */
app.get('/notes/:id', async (req, res) => {
    try {
      const note = await Note.findById(req.params.id);
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
app.delete('/notes/:id', async (req, res) => {
    try {
      const deletedNote = await Note.findByIdAndDelete(req.params.id);
      if (!deletedNote) {
        return res.status(404).json({ error: 'Note not found' });
      }
      res.json({ message: 'Note deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

app.delete("/notes", async (req, res) => {
    try {
        await Note.deleteMany({})
        res.json({ message: 'All notes have been deleted successfully'})
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});;

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});