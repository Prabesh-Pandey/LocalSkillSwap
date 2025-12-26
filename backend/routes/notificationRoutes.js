const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');

const {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require('../controller/notificationController');

// Allow GET /api/notifications to return the authenticated user's notifications
router.get('/', protect, getMyNotifications);
router.get('/mynotifications', protect, getMyNotifications); 
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;