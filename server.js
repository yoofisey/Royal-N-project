import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* =======================
   MONGODB CONNECTION
======================= */
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not set");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

/* =======================
   SCHEMAS & MODELS
======================= */
const BookingSchema = new mongoose.Schema({
  guestName: String,
  email: String,
  roomType: String,
  price: Number,
  startDate: String,
  endDate: String,
  status: { type: String, default: 'Pending' },
  paid: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const AvailabilitySchema = new mongoose.Schema({
  roomType: { type: String, unique: true },
  status: Boolean
});

const Booking = mongoose.model('Booking', BookingSchema);
const Availability = mongoose.model('Availability', AvailabilitySchema);

/* =======================
   EMAIL CONFIG
======================= */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* =======================
   ROUTES
======================= */

// Health check (important for Render)
app.get('/', (_, res) => {
  res.send('Royal N Hotel API is running 🚀');
});

// Get all bookings
app.get('/api/bookings', async (_, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get availability
app.get('/api/availability', async (_, res) => {
  try {
    const avail = await Availability.find();
    const formatted = avail.reduce(
      (acc, curr) => ({ ...acc, [curr.roomType]: curr.status }),
      {}
    );
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create booking
app.post('/api/book', async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();

    try {
      await transporter.sendMail({
        from: `"Royal N Hotel" <${process.env.EMAIL_USER}>`,
        to: booking.email,
        subject: 'Reservation Received - Royal N Hotel',
        html: `
          <h3>Hello ${booking.guestName},</h3>
          <p>Your booking for <strong>${booking.roomType}</strong> has been received.</p>
          <p>Status: Pending confirmation</p>
        `
      });
    } catch (mailErr) {
      console.warn("⚠️ Email failed:", mailErr.message);
    }

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update availability
app.patch('/api/availability', async (req, res) => {
  const { roomType, status } = req.body;

  try {
    await Availability.findOneAndUpdate(
      { roomType },
      { status },
      { upsert: true, new: true }
    );
    res.json({ message: "Availability updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update booking (Admin)
app.patch('/api/bookings/:id', async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Booking updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =======================
   START SERVER
======================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
