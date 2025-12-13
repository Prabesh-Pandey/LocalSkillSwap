const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');

const {
        createReview,
    getReviewsByOffer
} = require('../controller/reviewController');

// Protected route
router.post('/', protect, createReview);

// Public route
router.get('/offer/:offerId', getReviewsByOffer);

module.exports = router;

