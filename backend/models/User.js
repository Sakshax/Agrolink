const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: false },
  phone: { type: String, required: false },
  role: { type: String, enum: ['Farmer', 'Buyer', 'Admin'], required: true },
  verified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
