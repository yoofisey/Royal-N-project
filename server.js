import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// --- CONFIG (Use Environment Variables for Security) ---
const SUPABASE_URL = process.env.SUPABASE_URL || "https://wkuoslgynuvegmwmdedg.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrdW9zbGd5bnV2ZWdtd21kZWRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDA4MjY2MSwiZXhwIjoyMDg1NjU4NjYxfQ.7fPEm_fsakfcLNyse-Ij-jyxkvOSx07EpWja602Xnfg"; 
const EMAIL_USER = process.env.EMAIL_USER || "seyyoofi95@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "xxjzetykokkltblj";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- CORS SETUP ---
app.use(cors({
  origin: ["https://royal-n-hotel.onrender.com", "http://localhost:5173"],
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

// --- ROUTES ---

app.get("/", (_, res) => res.send("Royal N Hotel API Live 🚀"));

// Get Availability
app.get("/api/availability", async (_, res) => {
  try {
    const { data, error } = await supabase.from("availability").select("*");
    if (error) throw error;
    const map = Object.fromEntries(data.map(r => [r.room_type, r.status]));
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Booking
app.post("/api/book", async (req, res) => {
  const { guest_name, email, room_type, price, startDate, endDate } = req.body;

  try {
    const { data, error } = await supabase.from("bookings").insert([{
      guest_name: guest_name,
      email: email,
      room_type: roomType,
      price: price,
      start_date: startDate,
      end_date: endDate,
      status: "pending",
      paid: false,
    }]).select();

    if (error) throw error;

    await transporter.sendMail({
      from: `"Royal N Hotel" <${EMAIL_USER}>`,
      to: email,
      subject: "Booking Received - Royal N Hotel",
      html: `<p>Hello ${guestName}, your request for ${roomType} is pending confirmation.</p>`,
    });

    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN ROUTES (Simplified Auth for your 'admin123' logic) ---

app.get("/api/bookings", async (_, res) => {
  const { data, error } = await supabase.from("bookings").select("*").order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch("/api/bookings/:id", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from("bookings").update(req.body).eq("id", id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch("/api/availability", async (req, res) => {
  const { room_type, status } = req.body;
  const { error } = await supabase.from("availability").upsert({ room_type, status });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Updated" });
});
// Add this below your other PATCH routes in server.js

app.delete("/api/bookings/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on ${PORT}`));
