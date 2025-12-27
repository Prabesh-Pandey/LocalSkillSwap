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

// Mark booking as complete (either party can call this)
const markComplete = async (req, res) => {
    try {
        const { notes } = req.body; // Optional session notes
        
        const booking = await Booking.findById(req.params.id)
            .populate('offer')
            .populate('bookedBy', 'name email')
            .populate('offerOwner', 'name email');
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Can mark complete from accepted or in_progress status
        if (!['accepted', 'in_progress'].includes(booking.status)) {
            return res.status(400).json({ message: 'Only accepted or in-progress bookings can be marked as complete' });
        }

        const userId = req.user._id.toString();
        const isBooker = booking.bookedBy._id.toString() === userId;
        const isOwner = booking.offerOwner._id.toString() === userId;

        if (!isBooker && !isOwner) {
            return res.status(403).json({ message: 'Not authorized to complete this booking' });
        }

        // Check if already confirmed by this party
        if (isBooker && booking.completedByBooker) {
            return res.status(400).json({ message: 'You have already confirmed completion' });
        }
        if (isOwner && booking.completedByOwner) {
            return res.status(400).json({ message: 'You have already confirmed completion' });
        }

        // Update status to in_progress when first party confirms
        if (!booking.completedByBooker && !booking.completedByOwner) {
            booking.status = 'in_progress';
        }

        // Mark completion for the appropriate party
        if (isBooker) {
            booking.completedByBooker = true;
            booking.bookerConfirmedAt = new Date();
            if (notes) booking.sessionNotes = notes;
            
            // Notify owner that booker confirmed
            await Notification.create({
                user: booking.offerOwner._id,
                type: 'completion',
                message: `${booking.bookedBy.name} has confirmed completion for "${booking.offer.title}". Please confirm from your side to finalize.`,
                link: `/owner-bookings`,
            });
        } else if (isOwner) {
            booking.completedByOwner = true;
            booking.ownerConfirmedAt = new Date();
            if (notes && !booking.sessionNotes) booking.sessionNotes = notes;
            
            // Notify booker that owner confirmed
            await Notification.create({
                user: booking.bookedBy._id,
                type: 'completion',
                message: `${booking.offerOwner.name} has confirmed completion for "${booking.offer.title}". Please confirm from your side to finalize.`,
                link: `/my-bookings`,
            });
        }

        // If both parties have confirmed, mark as completed
        if (booking.completedByBooker && booking.completedByOwner) {
            booking.status = 'completed';
            booking.completedAt = new Date();

            // Notify both parties
            await Notification.create({
                user: booking.bookedBy._id,
                type: 'completed',
                message: `🎉 Booking for "${booking.offer.title}" has been completed! You can now leave a review.`,
                link: `/offers/${booking.offer._id}`,
            });

            await Notification.create({
                user: booking.offerOwner._id,
                type: 'completed',
                message: `🎉 Booking for "${booking.offer.title}" has been completed successfully! Thank you for using SkillSwap.`,
                link: `/offers/${booking.offer._id}`,
            });
        }

        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Withdraw completion confirmation (before both parties confirm)
const withdrawCompletion = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('offer')
            .populate('bookedBy', 'name email')
            .populate('offerOwner', 'name email');
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Can only withdraw if status is in_progress (one party confirmed)
        if (booking.status !== 'in_progress') {
            return res.status(400).json({ message: 'Can only withdraw confirmation while booking is in progress' });
        }

        const userId = req.user._id.toString();
        const isBooker = booking.bookedBy._id.toString() === userId;
        const isOwner = booking.offerOwner._id.toString() === userId;

        if (!isBooker && !isOwner) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Only allow withdraw if this party has confirmed
        if (isBooker && !booking.completedByBooker) {
            return res.status(400).json({ message: 'You have not confirmed completion yet' });
        }
        if (isOwner && !booking.completedByOwner) {
            return res.status(400).json({ message: 'You have not confirmed completion yet' });
        }

        // Withdraw confirmation
        if (isBooker) {
            booking.completedByBooker = false;
            booking.bookerConfirmedAt = null;
            
            // Notify owner
            await Notification.create({
                user: booking.offerOwner._id,
                type: 'completion',
                message: `${booking.bookedBy.name} has withdrawn their completion confirmation for "${booking.offer.title}".`,
                link: `/owner-bookings`,
            });
        } else if (isOwner) {
            booking.completedByOwner = false;
            booking.ownerConfirmedAt = null;
            
            // Notify booker
            await Notification.create({
                user: booking.bookedBy._id,
                type: 'completion',
                message: `${booking.offerOwner.name} has withdrawn their completion confirmation for "${booking.offer.title}".`,
                link: `/my-bookings`,
            });
        }

        // If neither party has confirmed anymore, revert to accepted
        if (!booking.completedByBooker && !booking.completedByOwner) {
            booking.status = 'accepted';
        }

        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Raise a dispute
const raiseDispute = async (req, res) => {
    try {
        const { reason } = req.body;
        
        if (!reason || reason.trim().length < 10) {
            return res.status(400).json({ message: 'Please provide a detailed reason for the dispute (at least 10 characters)' });
        }

        const booking = await Booking.findById(req.params.id)
            .populate('offer')
            .populate('bookedBy', 'name email')
            .populate('offerOwner', 'name email');
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Can only dispute accepted or in_progress bookings
        if (!['accepted', 'in_progress'].includes(booking.status)) {
            return res.status(400).json({ message: 'Can only dispute accepted or in-progress bookings' });
        }

        const userId = req.user._id.toString();
        const isBooker = booking.bookedBy._id.toString() === userId;
        const isOwner = booking.offerOwner._id.toString() === userId;

        if (!isBooker && !isOwner) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        booking.status = 'disputed';
        booking.disputeReason = reason.trim();
        booking.disputedBy = req.user._id;
        booking.disputedAt = new Date();

        // Notify the other party
        const otherParty = isBooker ? booking.offerOwner._id : booking.bookedBy._id;
        const disputerName = isBooker ? booking.bookedBy.name : booking.offerOwner.name;

        await Notification.create({
            user: otherParty,
            type: 'booking_status',
            message: `⚠️ ${disputerName} has raised a dispute for booking "${booking.offer.title}". Reason: ${reason.substring(0, 50)}...`,
            link: isBooker ? `/owner-bookings` : `/my-bookings`,
        });

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
    cancelBooking,
    markComplete,
    withdrawCompletion,
    raiseDispute
};