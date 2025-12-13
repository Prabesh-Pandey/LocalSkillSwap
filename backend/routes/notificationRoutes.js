const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');

const {
    getMyNotifications,
    markAsRead
} = require('../controller/notificationController');

// Allow GET /api/notifications to return the authenticated user's notifications
router.get('/', protect, getMyNotifications);
router.get('/mynotifications', protect, getMyNotifications); 
router.put('/:id/read', protect, markAsRead); 

module.exports = router;