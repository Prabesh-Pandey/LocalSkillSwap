const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
    createBooking,
    getMyBookings,
    getReceivedBookings,
    updateBooking,
    cancelBooking,
    markComplete,
    withdrawCompletion,
    raiseDispute
} = require('../controller/bookingController');


router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/received', protect, getReceivedBookings);
router.put('/:id', protect, updateBooking);
router.put('/:id/complete', protect, markComplete);
router.put('/:id/withdraw-completion', protect, withdrawCompletion);
router.put('/:id/dispute', protect, raiseDispute);
router.delete('/:id', protect, cancelBooking);

module.exports = router;

