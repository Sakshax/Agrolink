const express = require('express');
const router = express.Router();
const CropListing = require('../models/CropListing');
const AgmarknetAPI = require('../services/AgmarknetAPI');
const storage = require('../services/storage');

const DEFAULT_LISTINGS = [
  {
    _id: 'demo1',
    cropName: 'Wheat',
    quantity: 50,
    price: 2100,
    mandiPrice: 2400,
    location: { coordinates: [77.2090, 28.6139] },
    status: 'Active',
    farmerId: { name: 'Ramesh Singh', rating: 4.8 }
  },
  {
    _id: 'demo2',
    cropName: 'Rice',
    quantity: 100,
    price: 3200,
    mandiPrice: 3000,
    location: { coordinates: [75.8577, 22.7196] },
    status: 'Active',
    farmerId: { name: 'Suresh Kumar', rating: 4.5 }
  }
];

// Helper to get demo listings
const getDemoListings = () => {
    const list = storage.read('listings');
    return list.length > 0 ? list : DEFAULT_LISTINGS;
};

// Create a new listing
router.post('/', async (req, res) => {
  try {
    const { farmerId, cropName, quantity, price, location, images } = req.body;

    let benchmark = 2200;
    try {
      const marketData = await AgmarknetAPI.getMarketPrice(cropName, 'Punjab');
      if (marketData && marketData.benchmarkPrice) benchmark = marketData.benchmarkPrice;
    } catch (e) {
      console.warn('Agmarknet lookup failed, using fallback price');
    }

    if (req.isDemoMode) {
      const listings = getDemoListings();
      const newListing = {
        _id: `demo${Date.now()}`,
        farmerId: { name: 'Ramesh Singh', rating: 5.0 },
        cropName,
        quantity,
        price,
        mandiPrice: benchmark,
        location: location || { coordinates: [77.2, 28.6] },
        images,
        status: 'Active',
        createdAt: new Date()
      };
      listings.push(newListing);
      storage.write('listings', listings);
      return res.status(201).json(newListing);
    }

    const newListing = new CropListing({
      farmerId, cropName, quantity, price,
      mandiPrice: benchmark, location, images
    });
    await newListing.save();
    res.status(201).json(newListing);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create listing', error: error.message });
  }
});

// Get all active listings
router.get('/', async (req, res) => {
  try {
    if (req.isDemoMode) {
      return res.status(200).json(getDemoListings());
    }
    const filters = { status: 'Active' };
    const listings = await CropListing.find(filters).populate('farmerId', 'name rating');
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch listings', error: error.message });
  }
});

// Update a listing
router.put('/:id', async (req, res) => {
  try {
    if (req.isDemoMode) {
      const listings = getDemoListings();
      const idx = listings.findIndex(l => l._id === req.params.id);
      if (idx === -1) return res.status(404).json({ message: 'Listing not found' });

      Object.assign(listings[idx], req.body);
      storage.write('listings', listings);
      return res.status(200).json(listings[idx]);
    }

    const updated = await CropListing.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Listing not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update listing', error: error.message });
  }
});

// Delete a listing
router.delete('/:id', async (req, res) => {
  try {
    if (req.isDemoMode) {
      const listings = getDemoListings();
      const idx = listings.findIndex(l => l._id === req.params.id);
      if (idx === -1) return res.status(404).json({ message: 'Listing not found' });
      listings.splice(idx, 1);
      storage.write('listings', listings);
      return res.status(200).json({ message: 'Listing deleted' });
    }

    const deleted = await CropListing.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Listing not found' });
    res.status(200).json({ message: 'Listing deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete listing', error: error.message });
  }
});

module.exports = router;
