const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    read: {
        type: Boolean,
        default: false
    },
    // Optional: Link message to a specific offer for context
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        default: null
    }
}, { timestamps: true });

// Index for efficient querying of conversations
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, read: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
