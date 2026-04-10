const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const storage = require('../services/storage');

// 1. Create Order
router.post('/', async (req, res) => {
  try {
    const { buyerId, farmerId, listingId, quantity, totalPrice, address, paymentMethod } = req.body;

    if (req.isDemoMode) {
      const orders = storage.read('orders');
      const newOrder = {
        _id: `order_${Date.now()}`,
        buyerId,
        farmerId,
        listingId,
        quantity,
        totalPrice,
        address,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed',
        orderStatus: 'Created',
        createdAt: new Date()
      };
      orders.push(newOrder);
      storage.write('orders', orders);

      console.log(`[Demo] Order created: ${newOrder._id}`);

      return res.status(201).json({
        order: newOrder,
        razorpayOrder: { id: `rzp_demo_${Date.now()}`, amount: totalPrice * 100, currency: 'INR' }
      });
    }

    // Production Mode
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET
    });

    const rzpOrder = await razorpay.orders.create({
      amount: totalPrice * 100,
      currency: 'INR',
      receipt: `order_rcpt_${Date.now()}`
    });

    const newOrder = new Order({
      buyerId, farmerId, listingId,
      quantity, totalPrice,
      address, paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed',
      orderStatus: 'Created'
    });

    await newOrder.save();

    res.status(201).json({ order: newOrder, razorpayOrder: rzpOrder });
  } catch (error) {
    console.error('Order creation error:', error.message);
    res.status(500).json({ message: 'Order creation failed', error: error.message });
  }
});

// 2. Get all orders
router.get('/', async (req, res) => {
  try {
    if (req.isDemoMode) {
      return res.status(200).json(storage.read('orders'));
    }
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// 3. Get single order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (req.isDemoMode) {
      const orders = storage.read('orders');
      const order = orders.find(o => o._id === id);
      return order ? res.status(200).json(order) : res.status(404).json({ message: 'Order not found' });
    }
    const order = await Order.findById(id).populate('listingId');
    return order ? res.status(200).json(order) : res.status(404).json({ message: 'Order not found' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
});

// 4. Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (req.isDemoMode) {
      const orders = storage.read('orders');
      const idx = orders.findIndex(o => o._id === id);
      if (idx === -1) return res.status(404).json({ message: 'Order not found' });
      
      orders[idx].orderStatus = status;
      storage.write('orders', orders);
      return res.status(200).json(orders[idx]);
    }

    const order = await Order.findByIdAndUpdate(id, { orderStatus: status }, { new: true });
    return order ? res.status(200).json(order) : res.status(404).json({ message: 'Order not found' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
});

module.exports = router;
