import express from 'express';
const router = express.Router();
import { createBooking } from '../controllers/bookingController.js';

// Public route for guests to book
router.post('/book', createBooking);

export default router;