const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getConversation,
    getConversations,
    getUnreadCount,
    markAsRead,
    deleteMessage
} = require('../controller/messageController');
const protect = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get all conversations (list view)
router.get('/conversations', getConversations);

// Get unread message count
router.get('/unread', getUnreadCount);

// Send a new message
router.post('/', sendMessage);

// Get conversation with a specific user
router.get('/conversation/:userId', getConversation);

// Mark messages from a sender as read
router.put('/read/:senderId', markAsRead);

// Delete a message
router.delete('/:messageId', deleteMessage);

module.exports = router;
