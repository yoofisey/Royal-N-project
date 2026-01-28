import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
app.use(cors());
app.use(express.json());

// 1. UPDATED: Added 'hall' and 'grounds' to the inventory
let bookings = [];
let roomAvailability = {
  standard: true,
  deluxe: true,
  executive: true,
  hall: true,    // Added for Event Center
  grounds: true  // Added for Event Center
};

// 2. Email Configuration
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

// 3. GET: Fetch all bookings
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

// 4. GET: Fetch availability
app.get('/api/availability', (req, res) => {
  res.json(roomAvailability);
});

// 5. POST: Create a new booking
app.post('/api/book', (req, res) => {
  const { guestName, email, roomType,price, date } = req.body;
  
  const newBooking = { 
    id: Date.now(), 
    guestName, 
    email, 
    roomType, 
    price: Number(price),
    date, 
    status: 'Pending',
    paid: false        
  };
  
  bookings.push(newBooking);

  const mailOptions = {
    from: '"Royal N Hotel" <seyyoofi95@gmail.com>',
    to: email,
    subject: 'Reservation Received - Royal N Hotel',
    text: `Hello ${guestName},\n\nWe have received your request for the ${roomType} on ${date}. Our team will contact you shortly to confirm.\n\nThank you for choosing Royal N Hotel!`
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) console.log("Email error:", error);
  });

  res.status(200).json({ message: "Booking received!", booking: newBooking });
});

// 6. PATCH: Update availability (The Toggle Fix)
app.patch('/api/availability', (req, res) => {
  const { roomType, status } = req.body;
  
  // Logic check: if the key exists in our object, update it
  if (roomAvailability.hasOwnProperty(roomType)) {
    roomAvailability[roomType] = status; 
    console.log(`✅ Update Success: ${roomType} is now ${status ? 'OPEN' : 'FULL'}`);
    res.json(roomAvailability);
  } else {
    console.log(`❌ Update Failed: ${roomType} is not a valid category.`);
    res.status(400).json({ error: "Invalid category" });
  }
});

// 7. PATCH: Update specific booking
app.patch('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  bookings = bookings.map(b => 
    b.id == id ? { ...b, ...updates } : b
  );

  res.json({ message: "Booking updated" });
});

// 8. DELETE: Remove a booking
app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  bookings = bookings.filter(b => b.id != id);
  res.json({ message: "Booking deleted" });
});

app.listen(5000, () => {
    console.log("------------------------------------------");
    console.log("🚀 Server running on http://localhost:5000");
    console.log("📦 Tracking: standard, deluxe, executive, hall, grounds");
    console.log("------------------------------------------");
});