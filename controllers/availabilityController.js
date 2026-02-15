import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const supabase = require('../config/db');

// Get current status of all rooms
exports.getAvailability = async (req, res) => {
  try {
    const { data, error } = await supabase.from('availability').select('*');
    if (error) throw error;
    
    // Convert array to a clean object for the frontend: { standard: true, deluxe: false }
    const statusMap = data.reduce((acc, item) => {
      acc[item.room_key] = item.is_available;
      return acc;
    }, {});
    
    res.json(statusMap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle a room (Admin action)
exports.toggleRoom = async (req, res) => {
  const { room_key, is_available } = req.body;
  try {
    const { data, error } = await supabase
      .from('availability')
      .update({ is_available })
      .eq('room_key', room_key);

    if (error) throw error;
    res.json({ success: true, message: `${room_key} updated.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};