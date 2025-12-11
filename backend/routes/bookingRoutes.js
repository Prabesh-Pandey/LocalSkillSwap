const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
    createBooking,
    getMyBookings,
    getReceivedBookings,
    updateBooking,
    cancelBooking
} = require('../controller/bookingController');


router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/received', protect, getReceivedBookings);
router.put('/:id', protect, updateBooking);
router.delete('/:id', protect, cancelBooking);

module.exports = router;

