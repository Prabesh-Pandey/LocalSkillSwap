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

// get my bookings (I requested)
const getMyBookings = async (req, res) =>{
    try {
        const bookings = await Booking.find({ bookedBy: req.user._id }).populate('offer').populate('offerOwner', 'name email');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// get bookings received for my offers
const  getReceivedBookings = async (req, res) =>{
    try {
        const bookings = await Booking.find({ offerOwner : req.user._id})
        .populate("offer")
        .populate("bookedBy", "name email");
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
