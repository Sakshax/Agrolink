const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewerId: { 
    type: String, // In demo mode, use string IDs. In prod, use mongoose.Schema.Types.ObjectId
    required: true 
  },
  revieweeId: { 
    type: String, 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: String,
  role: { 
    type: String, 
    enum: ['BuyerToFarmer', 'FarmerToBuyer'], 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Review', reviewSchema);
