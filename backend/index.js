const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/agro_link';

let isDemoMode = false;

// Global flag middleware
app.use((req, res, next) => {
  req.isDemoMode = isDemoMode;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: isDemoMode ? 'demo' : 'production',
    message: 'Digital Marketplace API is running' 
  });
});

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    if (isDemoMode) {
      console.log('💡 Note: Data will be lost on server restart in Demo Mode.');
    }
  });
};

// Database Connection with Fallback before starting server
console.log('⏳ Connecting to MongoDB...');
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✅ MongoDB connected');
    startServer();
  })
  .catch(err => {
    console.warn('⚠️ MongoDB connection failed. Switching to DEMO MODE (In-memory storage).');
    console.warn('   Reason:', err.message);
    isDemoMode = true;
    startServer();
  });
