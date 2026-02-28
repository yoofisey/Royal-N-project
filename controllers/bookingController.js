import supabase from '../config/db.js';
import { sendBookingEmail } from '../utils/emailService.js';

export const createBooking = async (req, res) => {
    try {
        const { guest_name, email, phone, room_type, price, start_date, end_date } = req.body;

const { data, error } = await supabase
  .from('bookings')
  .insert([{
    guest_name,
    email,
    phone,     
    room_type,
    price,
    start_date,
    end_date,
    status: 'pending',
    paid: false
  }])
            .select();

        if (error) {
            console.error("Supabase insert error:", error.message);
            return res.status(400).json({ success: false, error: error.message });
        }

       // Fire email in background — don't await it
sendBookingEmail(email, guest_name, { room_type, price, start_date, end_date })
  .catch(err => console.error("Background email error:", err));

return res.status(201).json({ success: true, data: data[0] });

        return res.status(201).json({ success: true, data: data[0] });
    } catch (error) {
        console.error("Unexpected Booking Error:", error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
};
