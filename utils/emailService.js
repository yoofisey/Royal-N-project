const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use an "App Password" from Google
  },
});

const sendBookingEmail = async (guestEmail, guestName, bookingDetails) => {
  const mailOptions = {
    from: '"Royal \'N\' Hotel" <no-reply@royalnhotel.com>',
    to: guestEmail,
    subject: 'Booking Confirmation - Royal \'N\' Hotel',
    html: `
      <h1>Hello, ${guestName}!</h1>
      <p>Thank you for choosing Royal 'N' Hotel. Your stay is confirmed.</p>
      <p><strong>Room:</strong> ${bookingDetails.room_type}</p>
      <p><strong>Total:</strong> GH₵ ${bookingDetails.price}</p>
      <p>See you soon!</p>
    `,
  };
  return transporter.sendMail(mailOptions);
};

module.exports = { sendBookingEmail };