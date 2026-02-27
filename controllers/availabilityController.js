import supabase from '../config/db.js';

export const getAvailability = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('availability')
      .select('*');
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

  if (!room_key || is_available === undefined) {
    return res.status(400).json({ error: "room_key and is_available are required." });
  }

  try {
    // First check if the row exists
    const { data: existing, error: fetchError } = await supabase
      .from('availability')
      .select('room_key')
      .eq('room_key', room_key)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = "no rows found" — that's okay, we'll insert
      throw fetchError;
    }

    let error;

    if (existing) {
      // Row exists — update it
      ({ error } = await supabase
        .from('availability')
        .update({ is_available })
        .eq('room_key', room_key));
    } else {
      // Row doesn't exist — insert it
      ({ error } = await supabase
        .from('availability')
        .insert([{ room_key, is_available }]));
    }

    if (error) throw error;

    console.log(`✅ Toggled ${room_key} → ${is_available}`);
    res.json({ success: true, room_key, is_available });

  } catch (error) {
    console.error("Toggle error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
