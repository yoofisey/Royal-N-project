import supabase from '../config/db.js';

export const getAvailability = async (req, res) => {
  try {
    const { data, error } = await supabase.from('availability').select('*');
    if (error) throw error;
    const statusMap = data.reduce((acc, item) => {
      acc[item.room_key] = item.is_available;
      return acc;
    }, {});
    res.json(statusMap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleRoom = async (req, res) => {
  const { room_key, is_available } = req.body;
  try {
    const { error } = await supabase
      .from('availability')
      .update({ is_available })
      .eq('room_key', room_key);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};