import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

export const sendBookingEmail = async (guestEmail, guestName, bookingDetails) => {
  const { room_type, price, start_date, end_date } = bookingDetails;

  const isEvent = price >= 3000;
  const typeLabel = isEvent ? "Event Enquiry" : "Room Reservation";

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const mailOptions = {
    from: `"Royal 'N' Hotel" <${process.env.EMAIL_USER}>`,
    to: guestEmail,
    subject: `${typeLabel} Received – Royal 'N' Hotel`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">

        <!-- Header -->
        <div style="background: #1a1a1a; padding: 30px; text-align: center;">
          <h1 style="color: #C5A059; font-family: Georgia, serif; margin: 0; letter-spacing: 2px;">
            ROYAL 'N' HOTEL
          </h1>
          <p style="color: #aaa; margin: 8px 0 0; font-size: 0.9rem;">Luxury Redefined</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px; background: #fff;">
          <h2 style="color: #C5A059; margin-top: 0;">
            ${isEvent ? "🎉 Enquiry Received!" : "🛎️ Booking Received!"}
          </h2>
          <p>Dear <strong>${guestName}</strong>,</p>
          <p>
            Thank you for choosing Royal 'N' Hotel. Your ${isEvent ? 'event enquiry' : 'reservation request'}
            has been received and is currently <strong>pending confirmation</strong>.
            Our team will be in touch shortly.
          </p>

          <!-- Booking Details Box -->
          <div style="background: #f9f6f0; border-left: 4px solid #C5A059; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <h3 style="margin: 0 0 15px; color: #1a1a1a;">
              ${isEvent ? "Enquiry" : "Booking"} Details
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 140px;">
                  ${isEvent ? "Event Space" : "Room Type"}
                </td>
                <td style="padding: 8px 0; font-weight: bold;">${room_type}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">
                  ${isEvent ? "Event Date" : "Check-In"}
                </td>
                <td style="padding: 8px 0; font-weight: bold;">${formatDate(start_date)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">
                  ${isEvent ? "End Date" : "Check-Out"}
                </td>
                <td style="padding: 8px 0; font-weight: bold;">${formatDate(end_date)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Total Price</td>
                <td style="padding: 8px 0; font-weight: bold; color: #27ae60; font-size: 1.1rem;">
                  GH₵ ${Number(price).toLocaleString()} ${isEvent ? "(Flat Rate)" : ""}
                </td>
              </tr>
            </table>
          </div>

          <p style="color: #555;">
            If you have any questions, feel free to reach us at
            <a href="mailto:royalnhotel3@gmail.com" style="color: #C5A059;">royalnhotel3@gmail.com</a>
            or call <strong>+233 (0)553696197</strong>.
          </p>
          <p>We look forward to welcoming you! 🌟</p>
          <p style="margin-bottom: 0;">Warm regards,<br/>
            <strong style="color: #C5A059;">The Royal 'N' Hotel Team</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #1a1a1a; padding: 20px; text-align: center;">
          <p style="color: #666; font-size: 0.8rem; margin: 0;">
            📍 123 Luxury Lane, Accra, Ghana &nbsp;|&nbsp;
            📞 +233 (0)553696197 &nbsp;|&nbsp;
            ✉️ royalnhotel3@gmail.com
          </p>
          <p style="color: #444; font-size: 0.75rem; margin: 10px 0 0;">
            © ${new Date().getFullYear()} Royal 'N' Hotel. All Rights Reserved.
          </p>
        </div>

      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};