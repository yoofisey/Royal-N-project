import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// --- LOAD ENV ---
dotenv.config();

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  EMAIL_USER,
  EMAIL_PASS,
  ADMIN_KEY,
  PORT = 5000,
} = process.env;

// --- CHECK REQUIRED ENVS ---
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Supabase credentials missing. Check SUPABASE_URL and SUPABASE_SERVICE_KEY");
  process.exit(1);
}

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error("❌ Email credentials missing. Check EMAIL_USER and EMAIL_PASS");
  process.exit(1);
}

if (!ADMIN_KEY) {
  console.error("❌ ADMIN_KEY missing. Set a secret key for admin routes.");
  process.exit(1);
}

// --- INIT ---
const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST", "PATCH"] }));
app.use(express.json());

// --- SUPABASE CLIENT ---
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- EMAIL TRANSPORT ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// --- ADMIN AUTH MIDDLEWARE ---
function adminOnly(req, res, next) {
  const apiKey = req.headers["x-admin-key"];
  if (!apiKey || apiKey !== ADMIN_KEY) {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
}

// --- ROUTES ---

// Health check
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
    if (!guestName || !email || !roomType || !price || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

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

    if (error) throw error;

    // Send email (safe)
    try {
      await transporter.sendMail({
        from: `"Royal N Hotel" <${EMAIL_USER}>`,
        to: email,
        subject: "Booking Received",
        html: `<p>Hello ${guestName},</p>
               <p>Your booking request for <b>${roomType}</b> has been received.</p>
               <p>Status: <b>Pending confirmation</b></p>`,
      });
    } catch (err) {
      console.warn("⚠️ Failed to send booking email:", err.message);
    }

    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN ROUTES ---

// All bookings
app.get("/api/bookings", adminOnly, async (_, res) => {
  try {
    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update booking status
app.patch("/api/bookings/:id", adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status required" });

    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Auto availability update if confirmed
    if (status === "confirmed") {
      await supabase.from("availability").update({ status: false })
        .eq("room_type", data.room_type);
    }

    // Email update
    try {
      await transporter.sendMail({
        from: `"Royal N Hotel" <${EMAIL_USER}>`,
        to: data.email,
        subject: `Booking ${status}`,
        html: `<p>Your booking for <b>${data.room_type}</b> is now <b>${status}</b>.</p>`,
      });
    } catch (err) {
      console.warn("⚠️ Failed to send booking update email:", err.message);
    }

    res.json({ message: "Booking updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update availability
app.patch("/api/availability", adminOnly, async (req, res) => {
  try {
    const { roomType, status } = req.body;
    if (!roomType || status === undefined) return res.status(400).json({ error: "roomType & status required" });

    const { error } = await supabase.from("availability")
      .upsert({ room_type: roomType, status }, { onConflict: "room_type" });

    if (error) throw error;
    res.json({ message: "Availability updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- START SERVER ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
