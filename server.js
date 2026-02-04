import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Test Route
app.get("/", (_, res) => res.send("Royal N API is Running..."));

// --- 1. GET AVAILABILITY ---
app.get("/api/availability", async (_, res) => {
  const { data, error } = await supabase.from("availability").select("*");
  if (error) return res.status(500).json({ error: error.message });
  const map = Object.fromEntries(data.map(r => [r.room_type, r.status]));
  res.json(map);
});

// --- 2. UPDATE AVAILABILITY ---
app.patch("/api/availability", async (req, res) => {
  const { room_type, status } = req.body;
  const { error } = await supabase
    .from("availability")
    .upsert({ room_type, status });
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// --- 3. CREATE BOOKING (CRITICAL FIX) ---
app.post("/api/book", async (req, res) => {
  console.log("Received payload:", req.body); // Log to Render console
  const { guest_name, email, room_type, price, start_date, end_date } = req.body;

  // Insert into Supabase
  const { data, error } = await supabase.from("bookings").insert([{
    guest_name, 
    email, 
    room_type, 
    price: Number(price), 
    start_date, 
    end_date,
    status: 'pending',
    paid: false
  }]).select();

  if (error) {
    console.error("Supabase Database Error:", error);
    return res.status(500).json({ error: error.message });
  }

  // Handle Email separately so it doesn't crash the response
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  transporter.sendMail({
    from: `"Royal N Hotel" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Booking Request Received",
    html: `<h3>Hello ${guest_name}</h3><p>Your request for ${room_type} is being processed.</p>`
  }).catch(err => console.log("Email failed, but booking was saved to DB."));

  res.status(201).json(data[0]);
});

// --- 4. ADMIN: GET ALL ---
app.get("/api/bookings", async (_, res) => {
  const { data, error } = await supabase.from("bookings").select("*").order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// --- 5. ADMIN: UPDATE/DELETE ---
app.patch("/api/bookings/:id", async (req, res) => {
  const { error } = await supabase.from("bookings").update(req.body).eq("id", req.params.id);
  res.json({ success: !error, error });
});

app.delete("/api/bookings/:id", async (req, res) => {
  const { error } = await supabase.from("bookings").delete().eq("id", req.params.id);
  res.json({ success: !error, error });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Backend Live on Port ${PORT}`));