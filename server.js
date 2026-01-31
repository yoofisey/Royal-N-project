import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import fs from 'fs';
import process from 'process';

const app = express();

// 1. CORS: Keeping it open for easy connection between your Render frontend and backend
app.use(cors({
  origin: true, // Reflects the origin of the request
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 2. DYNAMIC PORT: Critical for Render
const PORT = process.env.PORT || 5000;

// 3. PERSISTENT DATA
let bookings = [];
const DATA_FILE = './bookings.json';

if (fs.existsSync(DATA_FILE)) {
  try {
    const fileData = fs.readFileSync(DATA_FILE);
    bookings = JSON.parse(fileData);
  } catch (err) {
    console.error("Error reading bookings file:", err);
    bookings = [];
  }
}

const saveBookings = () => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2));
};

let roomAvailability = {
  standard: true,
  deluxe: true,
  executive: true,
  hall: true,
  grounds: true
};

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'seyyoofi95@gmail.com', 
    pass: 'xxjzetykokkltblj' // Ensure this is a 16-character App Password
  }
});

// --- ROUTES ---

app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

app.get('/api/availability', (req, res) => {
  res.json(roomAvailability);
});

app.post('/api/book', (req, res) => {
  console.log("New booking request received:", req.body); // LOG FOR DEBUGGING
  
  const { guestName, email, roomType, price, startDate, endDate } = req.body;
  
  if (!guestName || !email) {
    return res.status(400).json({ error: "Missing guest name or email" });
  }

  const newBooking = { 
    id: Date.now(), 
    guestName, 
    email, 
    roomType, 
    price: Number(price),
    startDate, 
    endDate,
    status: 'Pending',
    paid: false        
  };
  
  bookings.push(newBooking);
  saveBookings();

  const mailOptions = {
    from: '"Royal N Hotel" <seyyoofi95@gmail.com>',
    to: email,
    subject: 'Reservation Received - Royal N Hotel',
    text: `Hello ${guestName},\n\nWe have received your request for the ${roomType} from ${startDate} to ${endDate}. Our team will contact you shortly to confirm.\n\nThank you for choosing Royal N Hotel!`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Email error:", error);
    } else {
      console.log("Email sent successfully:", info.response);
    }
  });

  res.status(200).json({ message: "Booking received!", booking: newBooking });
});

app.patch('/api/availability', (req, res) => {
  const { roomType, status } = req.body;
  if (roomAvailability.hasOwnProperty(roomType)) {
    roomAvailability[roomType] = status; 
    res.json(roomAvailability);
  } else {
    res.status(400).json({ error: "Invalid category" });
  }
});

app.patch('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  bookings = bookings.map(b => b.id == id ? { ...b, ...updates } : b);
  saveBookings();
  res.json({ message: "Booking updated" });
});

app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  bookings = bookings.filter(b => b.id != id);
  saveBookings();
  res.json({ message: "Booking deleted" });
});

app.get('/', (req, res) => {
  res.send("Royal N Hotel Server is Live!");
});

// Bind to 0.0.0.0 so Render can direct traffic to the app
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});