import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://royal-n-hotel:<royal-n12345>@cluster0.yrf5zzx.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// --- DATA SCHEMAS ---
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

const AvailSchema = new mongoose.Schema({
    roomType: { type: String, unique: true },
    status: Boolean
});

const Booking = mongoose.model('Booking', BookingSchema);
const Availability = mongoose.model('Availability', AvailSchema);

// --- EMAIL CONFIG ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'seyyoofi95@gmail.com', pass: 'xxjzetykokkltblj' }
});

// --- ROUTES ---

// Get all bookings
app.get('/api/bookings', async (req, res) => {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
});

// Get availability
app.get('/api/availability', async (req, res) => {
    const avail = await Availability.find();
    // Convert array to the object format the frontend expects
    const formatted = avail.reduce((acc, curr) => ({ ...acc, [curr.roomType]: curr.status }), {});
    res.json(formatted);
});

// Create a booking
app.post('/api/book', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();

        const mailOptions = {
            from: '"Royal N Hotel" <seyyoofi95@gmail.com>',
            to: req.body.email,
            subject: 'Reservation Received - Royal N Hotel',
            html: `<h3>Hello ${req.body.guestName},</h3><p>Booking for ${req.body.roomType} received!</p>`
        };
        transporter.sendMail(mailOptions);

        res.status(201).json(newBooking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update availability
app.patch('/api/availability', async (req, res) => {
    const { roomType, status } = req.body;
    await Availability.findOneAndUpdate(
        { roomType }, 
        { status }, 
        { upsert: true, new: true }
    );
    res.json({ message: "Status Updated" });
});

// Update booking (Admin)
app.patch('/api/bookings/:id', async (req, res) => {
    await Booking.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Booking Updated" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));