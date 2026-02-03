import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST", "PATCH"], credentials: true }));
app.use(express.json());

// --- SUPABASE SETUP ---
const SUPABASE_URL = "https://wkuoslgynuvegmwmdedg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrdW9zbGd5bnV2ZWdtd21kZWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODI2NjEsImV4cCI6MjA4NTY1ODY2MX0.n0Z9j24MoxMXjZpHP5SKkRLkZ8adPcWMHA6IBnC9MwE";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Supabase credentials missing");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- EMAIL CONFIG ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- ROUTES ---

// Health check
app.get("/", (_, res) => res.send("Royal N Hotel API is running 🚀"));

// Get all bookings
app.get("/api/bookings", async (_, res) => {
  const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get availability
app.get("/api/availability", async (_, res) => {
  const { data, error } = await supabase.from("availability").select("*");
  if (error) return res.status(500).json({ error: error.message });
  const formatted = data.reduce((acc, curr) => ({ ...acc, [curr.room_type]: curr.status }), {});
  res.json(formatted);
});

// Create booking
app.post("/api/book", async (req, res) => {
  try {
    const { guestName, email, roomType, price, startDate, endDate, status, paid } = req.body;

    const { data, error } = await supabase
      .from("bookings")
      .insert([{ guest_name: guestName, email, room_type: roomType, price, start_date: startDate, end_date: endDate, status, paid }])
      .select();

    if (error) return res.status(500).json({ error: error.message });

    // Send confirmation email
    try {
      await transporter.sendMail({
        from: `"Royal N Hotel" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reservation Received - Royal N Hotel",
        html: `<h3>Hello ${guestName},</h3><p>Your booking for <strong>${roomType}</strong> has been received.</p><p>Status: Pending confirmation</p>`,
      });
    } catch (mailErr) {
      console.warn("⚠️ Email failed:", mailErr.message);
    }

    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update availability (Admin)
app.patch("/api/availability", async (req, res) => {
  const { roomType, status } = req.body;
  const { error } = await supabase
    .from("availability")
    .upsert({ room_type: roomType, status }, { onConflict: "room_type" });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Availability updated" });
});

// Update booking (Admin)
app.patch("/api/bookings/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const { error } = await supabase.from("bookings").update(updates).eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Booking updated" });
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
