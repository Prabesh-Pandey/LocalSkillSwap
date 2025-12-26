const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const Offer = require('../models/Offer');

// Create booking
const createBooking = async (req, res) => {
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
            message: `You have a new booking request for your offer: ${offer.title}, from ${req.user.name}.`,
            link: `/offers/${offer._id}`,
        });
        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get my bookings (I requested)
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ bookedBy: req.user._id })
            .populate('offer')
            .populate('offerOwner', 'name email');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get bookings received for my offers
const getReceivedBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ offerOwner: req.user._id })
            .populate('offer')
            .populate('bookedBy', 'name email');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update booking status (accept/reject)
const updateBooking = async (req, res) => {
    try {
        const { status } = req.body;
        
        const booking = await Booking.findById(req.params.id)
            .populate('offer')
            .populate('bookedBy', 'name email');
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.offerOwner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this booking' });
        }

        booking.status = status;
        await booking.save();

        if (booking.offer) {
            await Notification.create({
                user: booking.bookedBy,
                type: 'booking_status',
                message: `Your booking for "${booking.offer.title}" was ${booking.status}.`,
                link: `/bookings/${booking._id}`,
            });
        }
        
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cancel booking (by requester)
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.bookedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getReceivedBookings,
    updateBooking,
    cancelBooking
};