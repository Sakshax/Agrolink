const mongoose = require('mongoose');

const cropListingSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  mandiPrice: { type: Number },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }
  },
  images: [{ type: String }],
  status: { type: String, enum: ['Active', 'Sold', 'Inactive'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('CropListing', cropListingSchema);
