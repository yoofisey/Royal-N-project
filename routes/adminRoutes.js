import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/auth');

// Apply auth to all routes in this file
router.use(adminAuth);

router.get('/bookings', adminController.getAllBookings);
router.patch('/bookings/:id/paid', adminController.markAsPaid);
router.delete('/bookings/:id', adminController.deleteBooking);

module.exports = router;