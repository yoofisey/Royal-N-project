import supabase from '../config/db.js';
import { sendBookingEmail } from '../utils/emailService.js';

export const createBooking = async (req, res) => {
    try {
        const { guest_name, email, room_type, price, start_date, end_date } = req.body;

        // Insert into Supabase
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

        if (error) {
            console.error("Supabase insert error:", error.message);
            return res.status(400).json({ success: false, error: error.message });
        }

        // Send confirmation email (won't break booking if it fails)
        try {
            await sendBookingEmail(email, guest_name, { room_type, price });
        } catch (emailErr) {
            console.error("Email failed to send, but booking was saved:", emailErr);
        }

        return res.status(201).json({ success: true, data: data[0] });
    } catch (error) {
        console.error("Unexpected Booking Error:", error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
};
