const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'CropListing', required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  address: { type: String, required: true },
  paymentMethod: { type: String, enum: ['UPI', 'COD'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  orderStatus: { type: String, enum: ['Created', 'Accepted', 'Shipped', 'Delivered'], default: 'Created' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
