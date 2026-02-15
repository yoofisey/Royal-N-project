const supabase = require('../config/db');

// Toggle Availability
exports.toggleAvailability = async (req, res) => {
  const { room_key, is_available } = req.body;
  try {
    const { data, error } = await supabase
      .from('availability')
      .update({ is_available })
      .eq('room_key', room_key);

    if (error) throw error;
    res.json({ success: true, message: `Status updated for ${room_key}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark as Paid and Update Revenue logic
exports.markAsPaid = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'paid' })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: "Payment confirmed. Revenue updated." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};