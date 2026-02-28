import express from 'express';
const router = express.Router();
import { getAllBookings, markAsPaid, deleteBooking } from '../controllers/adminController.js';
import adminAuth from '../middleware/auth.js';

// Login route - no auth needed
router.post('/login', (req, res) => {
  if (req.body.password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// All routes below this are protected
router.use(adminAuth);
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id/paid', markAsPaid);
router.delete('/bookings/:id', deleteBooking);

export default router;