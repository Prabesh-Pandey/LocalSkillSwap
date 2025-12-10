const Booking = require('../models/Booking');
const Offer = require('../models/Offer');

//create booking
const createBooking = async (req, res) =>{
    try {
        const { offerId, message } = req.body;

        const offer = await Offer.findById(offerId);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        if (offer.user.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot book your own offer' });
        }

        const booking = await Booking.create({
            offer: offerId,
            bookedBy: req.user._id,
            offerOwner: offer.user,
            message
        });
        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

