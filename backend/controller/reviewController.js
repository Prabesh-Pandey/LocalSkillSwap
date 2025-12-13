const Review = require('../models/Review');
const Offer = require('../models/Offer');

// create review
const createReview = async (req, res) => {
    try {
        const { offerId, rating, comment } = req.body;

        const offer = await Offer.findById(offerId);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        // Prevent users from reviewing their own offers
        if (offer.user.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot review your own offer' });
        }

        // condition (review only accepted offers)
        const booking = await Booking.findOne({ 
            offer: offerId, 
            user: req.user._id, 
            status: 'accepted' 
        });

        if (!booking) {
            return res.status(400).json({ message: 'You can only review offers you have booked and were accepted' });
        }
        
        const review = await Review.create({
            offer: offerId,
            user: req.user._id,
            rating,
            comment
        });

        const populatedReview = await review.populate('user', 'name email');

        res.status(201).json(populatedReview);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this offer' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Get reviews for an offer
const getReviewsByOffer = async (req, res) => {
    try {
       const reviews = await Review.find({ offer: req.params.offerId  }).populate('user', 'name email');
       res.json(reviews); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReview,
    getReviewsByOffer
};