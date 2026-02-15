import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/availability', availabilityRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Royal N API running on port ${PORT}`);
});