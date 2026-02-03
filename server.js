import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST", "PATCH"] }));
app.use(express.json());

// --- SUPABASE ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// --- EMAIL ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- ADMIN AUTH MIDDLEWARE ---
async function adminOnly(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token" });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || data.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ error: "Admin only" });
  }

  next();
}

// --- ROUTES ---

app.get("/", (_, res) => res.send("Royal N Hotel API 🚀"));

// Availability
app.get("/api/availability", async (_, res) => {
  const { data } = await supabase.from("availability").select("*");
  const map = Object.fromEntries(data.map(r => [r.room_type, r.status]));
  res.json(map);
});

// Create booking
app.post("/api/book", async (req, res) => {
  const { guestName, email, roomType, price, startDate, endDate } = req.body;

  const { data, error } = await supabase.from("bookings").insert([{
    guest_name: guestName,
    email,
    room_type: roomType,
    price,
    start_date: startDate,
    end_date: endDate,
    status: "pending",
    paid: false,
  }]).select();

  if (error) return res.status(500).json({ error: error.message });

  await transporter.sendMail({
    from: `"Royal N Hotel" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Booking Received",
    html: `<p>Hello ${guestName},</p>
           <p>Your booking request has been received.</p>
           <p>Status: <b>Pending confirmation</b></p>`,
  });

  res.status(201).json(data[0]);
});

// --- ADMIN ---

// All bookings
app.get("/api/bookings", adminOnly, async (_, res) => {
  const { data } = await supabase.from("bookings").select("*");
  res.json(data);
});

// Confirm / Cancel booking
app.patch("/api/bookings/:id", adminOnly, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Auto availability update
  if (status === "confirmed") {
    await supabase.from("availability").update({ status: false })
      .eq("room_type", data.room_type);
  }

  // Email update
  await transporter.sendMail({
    to: data.email,
    subject: `Booking ${status}`,
    html: `<p>Your booking for ${data.room_type} is now <b>${status}</b>.</p>`,
  });

  res.json({ message: "Booking updated" });
});

// Manual availability update
app.patch("/api/availability", adminOnly, async (req, res) => {
  const { roomType, status } = req.body;
  await supabase.from("availability")
    .upsert({ room_type: roomType, status });
  res.json({ message: "Availability updated" });
});

// --- START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on ${PORT}`)
);
