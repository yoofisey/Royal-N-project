import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import fs from 'fs'; // Added to save data to a file

const app = express();

// 1. UPDATED CORS: Allow your local dev and your future live site
app.use(cors({
  origin: '*' // For the audition, this is easiest. 
}));

app.use(express.json());

// 2. DYNAMIC PORT: Critical for hosting
const PORT = process.env.PORT || 5000;

// 3. PERSISTENT DATA: Load existing bookings from a file if it exists
let bookings = [];
const DATA_FILE = './bookings.json';

if (fs.existsSync(DATA_FILE)) {
  const fileData = fs.readFileSync(DATA_FILE);
  bookings = JSON.parse(fileData);
}

// Helper to save bookings
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
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'seyyoofi95@gmail.com', 
    pass: 'xxjzetykokkltblj' 
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
  const { guestName, email, roomType, price, startDate, endDate } = req.body;
  
  const newBooking = { 
    id: Date.now(), 
    guestName, 
    email, 
    roomType, 
    price: Number(price),
    startDate, // Fixed: frontend uses startDate/endDate
    endDate,
    status: 'Pending',
    paid: false        
  };
  
  bookings.push(newBooking);
  saveBookings(); // Save to file

  const mailOptions = {
    from: '"Royal N Hotel" <seyyoofi95@gmail.com>',
    to: email,
    subject: 'Reservation Received - Royal N Hotel',
    text: `Hello ${guestName},\n\nWe have received your request for the ${roomType} from ${startDate} to ${endDate}. Our team will contact you shortly to confirm.\n\nThank you for choosing Royal N Hotel!`
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) console.log("Email error:", error);
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
  saveBookings(); // Save to file
  res.json({ message: "Booking updated" });
});

app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  bookings = bookings.filter(b => b.id != id);
  saveBookings(); // Save to file
  res.json({ message: "Booking deleted" });
});

// Root route for Render to check if server is alive
app.get('/', (req, res) => {
  res.send("Royal N Hotel Server is Live!");
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});