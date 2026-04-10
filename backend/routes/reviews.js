const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Mock storage for Demo Mode
let demoReviews = [
  { _id: 'r1', revieweeId: 'demo_farmer', rating: 5, comment: "Badiya gehu tha, bahut dhanyawad!", createdAt: new Date() },
  { _id: 'r2', revieweeId: 'demo_farmer', rating: 4, comment: "Price was slightly high but quality is top notch.", createdAt: new Date() }
];

// Post a review
router.post('/', async (req, res) => {
  try {
    const { reviewerId, revieweeId, rating, comment, role } = req.body;

    if (req.isDemoMode) {
      const newReview = { _id: `rev${Date.now()}`, reviewerId, revieweeId, rating, comment, role, createdAt: new Date() };
      demoReviews.push(newReview);
      return res.status(201).json(newReview);
    }

    const newReview = new Review({ reviewerId, revieweeId, rating, comment, role });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: 'Failed to post review', error: error.message });
  }
});

// Get reviews for a specific user
router.get('/:userId', async (req, res) => {
  try {
    if (req.isDemoMode) {
      const filtered = demoReviews.filter(r => r.revieweeId === req.params.userId);
      return res.status(200).json(filtered);
    }

    const reviews = await Review.find({ revieweeId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
});

module.exports = router;
