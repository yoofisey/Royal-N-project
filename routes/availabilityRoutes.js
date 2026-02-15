import express from 'express';
const router = express.Router();
import { getAvailability, toggleRoom } from '../controllers/availabilityController.js';
import adminAuth from '../middleware/auth.js';

router.get('/', getAvailability);
router.patch('/toggle', adminAuth, toggleRoom); // Protected toggle

export default router;