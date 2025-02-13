const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
                delete ret.userId;
            }
        }
    }
);

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
