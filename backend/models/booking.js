const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    offer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        required: true
    },
    bookedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    offerOwner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status:{
        type: String,
        enum: ['pending', 'accepted','rejected','cancelled'],
        default: 'pending'
    },
    message:{
        type: String,
        default: ''
    }
},
{ timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);