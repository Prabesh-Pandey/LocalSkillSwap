const mongoose = require('mongoose');
const Offer = require('../models/Offer');

// Create a new offer
const createOffer = async (req, res) => {
    try {
        const { title, description, price, tags } = req.body;

        // Input validation
        if (!title || !description || price === undefined) {
            return res.status(400).json({ message: 'Please provide title, description, and price' });
        }

        if (title.trim().length < 3) {
            return res.status(400).json({ message: 'Title must be at least 3 characters long' });
        }

        if (description.trim().length < 10) {
            return res.status(400).json({ message: 'Description must be at least 10 characters long' });
        }

        if (isNaN(price) || Number(price) < 0) {
            return res.status(400).json({ message: 'Price must be a valid positive number' });
        }

        const offer = await Offer.create({
            user: req.user._id,
            title: title.trim(),
            description: description.trim(),
            price: Number(price),
            tags: Array.isArray(tags) ? tags.map(t => t.trim()).filter(Boolean) : []
        });

        const populatedOffer = await offer.populate("user", "name email");

        res.status(201).json(populatedOffer);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get all offers
const getOffers = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Search by keyword (frontend sends `keyword`)
        const keywords = req.query.keyword
            ? { title: { $regex: req.query.keyword, $options: 'i' } }
            : {};

        // Filter by minimum rating (averageRating)
        const ratingFilter = req.query.minRating
            ? { averageRating: { $gte: Number(req.query.minRating) } }
            : {};

        // Price filter: merge min and max into a single price object
        const priceFilter = {};
        if (req.query.minPrice) {
            priceFilter.price = { ...(priceFilter.price || {}), $gte: Number(req.query.minPrice) };
        }
        if (req.query.maxPrice) {
            priceFilter.price = { ...(priceFilter.price || {}), $lte: Number(req.query.maxPrice) };
        }

        // Tags: accept comma-separated list in `tags` query param
        const tagsFilter = req.query.tags
            ? { tags: { $in: req.query.tags.split(',') } }
            : {};

        const filter = {
            ...keywords,
            ...ratingFilter,
            ...priceFilter,
            ...tagsFilter,
        };

        const total = await Offer.countDocuments(filter);

        const offers = await Offer.find(filter)
            .populate('user', 'name email')
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });

        res.json({ offers, page, pages: Math.ceil(total / limit), total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single offer by ID
const getOfferById = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id).populate('user', 'name email');
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.json(offer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//get offers of logged in user
const getMyOffers = async (req, res) => {
    try {
        const offers = await Offer.find({user: req.user._id}).populate('user', 'name email');
        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an offer by ID
const updateOffer = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        
        // Check if the logged-in user is the owner of the offer
        if (offer.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const updated = await Offer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete an offer by ID
const deleteOffer = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid offer id' });
        }

        const offer = await Offer.findById(req.params.id);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        // Check if the logged-in user is the owner of the offer
        if (offer.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await offer.deleteOne();
        res.json({ message: 'Offer removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOffer,
    getOffers,
    getOfferById,
    getMyOffers,
    updateOffer,
    deleteOffer,
};