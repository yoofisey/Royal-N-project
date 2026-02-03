import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import fs from 'fs';
import process from 'process';

const app = express();

// 1. CORS: Wide open for the frontend connection
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const DATA_FILE = './bookings.json';

// 3. PERSISTENT DATA
let bookings = [];
if (fs.existsSync(DATA_FILE)) {
    try {
        bookings = JSON.parse(fs.readFileSync(DATA_FILE));
    } catch {
        bookings = [];
    }
}

const saveBookings = () => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2));
};

let roomAvailability = { standard: true, deluxe: true, executive: true, hall: true, grounds: true };

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'seyyoofi95@gmail.com', 
        pass: 'xxjzetykokkltblj' 
    }
});

// --- ROUTES ---
app.get('/api/bookings', (req, res) => res.json(bookings));
app.get('/api/availability', (req, res) => res.json(roomAvailability));

app.post('/api/book', (req, res) => {
    const { guestName, email, roomType, price, startDate, endDate } = req.body;
    
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

    // Nodemailer with error catching so it doesn't block the API response
    const mailOptions = {
        from: '"Royal N Hotel" <seyyoofi95@gmail.com>',
        to: email,
        subject: 'Reservation Received - Royal N Hotel',
        text: `Hello ${guestName},\n\nWe have received your request for the ${roomType}. Our team will contact you shortly.`
    };

    transporter.sendMail(mailOptions)
        .then(info => console.log("Email sent:", info.response))
        .catch(err => console.error("Email failed (booking still saved):", err));

    res.status(200).json({ message: "Booking received!", booking: newBooking });
});

app.patch('/api/availability', (req, res) => {
    const { roomType, status } = req.body;
    roomAvailability[roomType] = status; 
    res.json(roomAvailability);
});

app.patch('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    bookings = bookings.map(b => b.id == id ? { ...b, ...req.body } : b);
    saveBookings();
    res.json({ message: "Updated" });
});

app.get('/', (req, res) => res.send("Royal N Hotel Server is Live!"));

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on ${PORT}`));