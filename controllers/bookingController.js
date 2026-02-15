const supabase = require('../config/db');
const { sendBookingEmail } = require('../utils/emailService');

exports.createBooking = async (req, res) => {
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
        status: 'pending' // Default status
      }])
      .select();

    if (error) throw error;

    // 2. Send Confirmation Email
    await sendBookingEmail(email, guest_name, { room_type, price });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};