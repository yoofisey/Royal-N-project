import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const { createClient } = require('@supabase/supabase-base');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = supabase;