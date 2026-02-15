import supabase from '../config/db.js';
import { sendBookingEmail } from '../utils/emailService.js';

export const createBooking = async (req, res) => {
  try {
    const { guest_name, email, room_type, price, start_date, end_date } = req.body;

    // 1. Insert into Supabase
    const { data, error } = await supabase
      .from('bookings')
      .insert([{ 
        guest_name, 
        email, 
        room_type, 
        price, 
        start_date, 
        end_date, 
        status: 'pending',
        paid: false
      }])
      .select();

    if (error) throw error;

    // 2. Send Confirmation Email (Optional: wrap in try/catch so booking still works if email fails)
    try {
      await sendBookingEmail(email, guest_name, { room_type, price });
    } catch (emailErr) {
      console.error("Email failed to send, but booking was saved:", emailErr);
    }

    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    console.error("Booking Error:", error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};