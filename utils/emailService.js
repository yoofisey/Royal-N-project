import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendBookingEmail = async (guestEmail, guestName, bookingDetails) => {
  const mailOptions = {
    from: `"Royal 'N' Hotel" <${process.env.EMAIL_USER}>`,
    to: guestEmail,
    subject: 'Booking Confirmation - Royal \'N\' Hotel',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #c19d68;">Hello, ${guestName}!</h2>
        <p>Your reservation at <strong>Royal 'N' Hotel</strong> has been received.</p>
        <hr />
        <p><strong>Room Type:</strong> ${bookingDetails.room_type}</p>
        <p><strong>Total Price:</strong> GH₵ ${bookingDetails.price}</p>
        <p>Status: <strong>Pending Confirmation</strong></p>
        <hr />
        <p>We look forward to welcoming you!</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};