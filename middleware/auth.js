import express from 'express';
import cors from 'cors';
import 'dotenv/config';

require('dotenv').config();

const adminAuth = (req, res, next) => {
  // We check for an 'x-admin-password' header
  const password = req.headers['x-admin-password'];

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ 
      success: false, 
      message: "Access Denied: Invalid Admin Credentials" 
    });
  }

  next(); // Credentials are correct, proceed to the controller
};

module.exports = adminAuth;