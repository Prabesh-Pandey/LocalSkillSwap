const express = require('express');
const router = express.Router();

const { createOffer, getOffers, getOfferById, updateOffer, deleteOffer } = require('../controller/offerController');
const protect = require('../middleware/authMiddleware');

//public routes
router.get('/', getOffers);
router.get('/:id', getOfferById);

//protected routes
router.post('/', protect, createOffer);
router.put('/:id', protect, updateOffer);
router.delete('/:id', protect, deleteOffer);

module.exports = router;