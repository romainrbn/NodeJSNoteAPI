require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const { authenticateToken } = require('./middleware/auth');
const userRoutes = require('./routes/user');
const noteRoutes = require('./routes/note');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.port || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        const noteChangeStream = mongoose.connection.collection('notes').watch();
        noteChangeStream.on('change', (change) => {
            console.log('Change detected:', change);
            io.emit('noteChange', change);
        });
    })
    .catch((err) => console.error('Error connecting to MongoDB:', err));

app.use('/users', userRoutes);
app.use('/notes', authenticateToken, noteRoutes);

io.on('connection', (socket) => {
    console.log('A client connected: ', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});