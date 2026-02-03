import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST", "PATCH"] }));
app.use(express.json());

// --- CHECK SUPABASE CREDENTIALS ---
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error("❌ Supabase credentials missing. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env");
  process.exit(1);
}

// --- SUPABASE SETUP ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// --- EMAIL SETUP ---
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ Email credentials missing. Check EMAIL_USER and EMAIL_PASS in your .env");
  process.exit(1);
}

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
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user || data.user.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ error: "Admin only" });
    }
    next();
  } catch {
    return res.status(500).json({ error: "Failed to verify admin" });
  }
}

// --- ROUTES ---

app.get("/", (_, res) => res.send("Royal N Hotel API 🚀"));

// --- Availability ---
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

// --- Create booking ---
app.post("/api/book", async (req, res) => {
  try {
    const { guestName, email, roomType, price, startDate, endDate } = req.body;
    if (!guestName || !email || !roomType || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert([{
        guest_name: guestName,
        email,
        room_type: roomType,
        price: price || 0,
        start_date: startDate,
        end_date: endDate,
        status: "pending",
        paid: false,
      }])
      .select()
      .single();

    if (error) throw error;

    // Send confirmation email
    try {
      await transporter.sendMail({
        from: `"Royal N Hotel" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Booking Received",
        html: `<p>Hello ${guestName},</p>
               <p>Your booking request for <b>${roomType}</b> has been received.</p>
               <p>Status: <b>Pending confirmation</b></p>`,
      });
    } catch (mailErr) {
      console.warn("⚠️ Failed to send email:", mailErr.message);
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN ROUTES ---

// Get all bookings
app.get("/api/bookings", adminOnly, async (_, res) => {
  try {
    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update booking (confirm/cancel)
app.patch("/api/bookings/:id", adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Missing status" });

    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Update availability if confirmed
    if (status === "confirmed") {
      await supabase.from("availability").update({ status: false }).eq("room_type", data.room_type);
    }

    // Notify guest
    try {
      await transporter.sendMail({
        to: data.email,
        subject: `Booking ${status}`,
        html: `<p>Your booking for <b>${data.room_type}</b> is now <b>${status}</b>.</p>`,
      });
    } catch (mailErr) {
      console.warn("⚠️ Failed to send email:", mailErr.message);
    }

    res.json({ message: "Booking updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manual availability update
app.patch("/api/availability", adminOnly, async (req, res) => {
  try {
    const { roomType, status } = req.body;
    if (!roomType || status === undefined) return res.status(400).json({ error: "Missing roomType or status" });

    await supabase.from("availability").upsert({ room_type: roomType, status });
    res.json({ message: "Availability updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
