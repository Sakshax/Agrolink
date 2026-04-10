const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const storage = require('../services/storage');

// 1. Register User
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    if (req.isDemoMode) {
      console.log(`[Demo] Registering: ${username} (${role})`);
      const users = storage.read('users');
      
      // Strict duplicate check
      const existing = users.find(u => u.username === username);
      if (existing) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = { 
        username, 
        password: hashedPassword, 
        role, 
        _id: `u_${Date.now()}` 
      };
      
      users.push(newUser);
      storage.write('users', users);

      return res.status(201).json({ 
        message: 'User registered successfully (Local Storage)', 
        user: { username, role, _id: newUser._id } 
      });
    }

    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, password: hashedPassword, role });
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully', user: { username, role, _id: user._id } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 2. Login User
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Special case for Fixed Admin Credentials
    if (username === 'Admin' && password === 'admin123') {
      console.log(`[Admin] Fixed credentials login detected`);
      return res.status(200).json({ 
        message: 'Admin login successful', 
        user: { username: 'Admin', role: 'Admin', _id: 'static_admin_id' } 
      });
    }

    if (req.isDemoMode) {
      console.log(`[Demo] Login attempted: ${username}`);
      const users = storage.read('users');
      const user = users.find(u => u.username === username);
      
      if (!user) {
        return res.status(404).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      return res.status(200).json({ 
        message: 'Login successful (Local Storage)', 
        user: { username: user.username, role: user.role, _id: user._id } 
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful', user: { username: user.username, role: user.role, _id: user._id } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
