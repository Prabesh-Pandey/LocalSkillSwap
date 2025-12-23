require('dotenv').config();
const connectDB = require('../config/db');
const Offer = require('../models/Offer');
const Review = require('../models/Review');

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set. Create a .env file with MONGODB_URI or set the env variable before running this script.');
  process.exit(1);
}

const recompute = async () => {
  try {
    await connectDB();

    const offers = await Offer.find({});
    console.log(`Found ${offers.length} offers`);

    for (const offer of offers) {
      const reviews = await Review.find({ offer: offer._id });
      const numReviews = reviews.length;
      const averageRating =
        numReviews === 0 ? 0 : reviews.reduce((sum, r) => r.rating + sum, 0) / numReviews;

      await Offer.findByIdAndUpdate(offer._id, {
        numReviews,
        averageRating: Number(averageRating.toFixed(1)),
      });

      console.log(`Updated offer ${offer._id}: numReviews=${numReviews}, averageRating=${Number(averageRating.toFixed(1))}`);
    }

    console.log('Recompute complete');
    process.exit(0);
  } catch (err) {
    console.error('Error recomputing ratings', err);
    process.exit(1);
  }
};

recompute();
