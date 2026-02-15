import express from 'express';
const router = express.Router();
import { getAllBookings, markAsPaid, deleteBooking } from '../controllers/adminController.js';
import adminAuth from '../middleware/auth.js';

router.use(adminAuth);
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id/paid', markAsPaid);
router.delete('/bookings/:id', deleteBooking);

export default router;