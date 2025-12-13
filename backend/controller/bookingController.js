const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
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

        // Create a notification for the offer owner
        await Notification.create({
            user: offer.user,
            type: 'booking',
            message: `You have a new booking request for your offer: ${offer.title} , from ${req.user.name}.`,
            link: `/offers/${offer._id}`,
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

// update booking status (accept/reject)
const updateBooking = async (req, res) =>{
    try {
        const { status } = req.body;
        
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.offerOwner.toString() !== req.user._id.toString()){
            return res.status(403).json({ message: 'Not authorized to update this booking' });
        }

        booking.status = status;
        await booking.save();

        await Notification.create({
            user: booking.bookedBy,
            type: 'booking_status',
            message: `Your booking for "${booking.offer.title}" was ${booking.status}`,
            link: `/bookings/${booking._id}`,
        });
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//cancel booking (by requester)
const cancelBooking = async (req, res) =>{
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.bookedBy.toString() !== req.user._id.toString()){
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getReceivedBookings,
    updateBooking,
    cancelBooking
};