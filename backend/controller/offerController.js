const Offer = require('../models/Offer');

// Create a new offer
const createOffer = async (req, res) => {
    try {
        const { title, description, price, tags } = req.body;

        const offer = await Offer.create({
            user: req.user._id,
            title,
            description,
            price,
            tags
        });

        const populatedOffer = await offer.populate("user", "name email");

        res.json(populatedOffer);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get all offers
const getOffers = async (req, res) => {
    try {
        const offers = await Offer.find().populate('user', 'name email');
        res.json(offers);
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