const Review = require('../models/Review');
const Offer = require('../models/Offer');
const Notification = require('../models/Notification');
const Booking = require('../models/Booking');

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

        // Reviews are only allowed for completed bookings
        const booking = await Booking.findOne({ 
            offer: offerId, 
            bookedBy: req.user._id,
            status: 'completed' 
        });

        if (!booking) {
            return res.status(400).json({ message: 'You can only review offers after the booking has been completed by both parties' });
        }
        
        const review = await Review.create({
            offer: offerId,
            user: req.user._id,
            rating,
            comment
        });

        await Notification.create({
            user: offer.user,
            type: 'review',
            message: `Your offer "${offer.title}" received a new review from ${req.user.name}.`,
            link: `/offers/${offer._id}`,
        });

        await updateOfferRating(offerId);

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
        const reviews = await Review.find({ offer: req.params.offerId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update offer rating after review
const updateOfferRating = async (offerId) => {
    const reviews = await Review.find({ offer: offerId });
    const numReviews = reviews.length;
    const averageRating = numReviews === 0 
        ? 0 
        : reviews.reduce((sum, r) => r.rating + sum, 0) / numReviews;

    await Offer.findByIdAndUpdate(offerId, {
        numReviews,
        averageRating: Number(averageRating.toFixed(1)),
    });
};

module.exports = {
    createReview,
    getReviewsByOffer,
};