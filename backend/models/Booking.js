const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    offer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        required: true
    },
     offerOwner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
      bookedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status:{
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'cancelled', 'in_progress', 'completed', 'disputed'],
        default: 'pending'
    },
    message:{
        type: String,
        default: ''
    },
    // Completion tracking - both parties must confirm
    completedByBooker: {
        type: Boolean,
        default: false
    },
    completedByOwner: {
        type: Boolean,
        default: false
    },
    bookerConfirmedAt: {
        type: Date,
        default: null
    },
    ownerConfirmedAt: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    },
    // Dispute handling
    disputeReason: {
        type: String,
        default: ''
    },
    disputedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    disputedAt: {
        type: Date,
        default: null
    },
    // Session notes (optional feedback during completion)
    sessionNotes: {
        type: String,
        default: ''
    }
},
{ timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);