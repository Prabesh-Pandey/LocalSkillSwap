const mongoose = require('mongoose');


const offerSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    tags: {
        type: [String],
        default: []
    },
},
{ timestamps: true}
);
const Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;