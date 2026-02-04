import { useState, useEffect } from 'react';
import './index.css';
import AdminDashboard from './components/adminDashboard';

// --- API CONFIGURATION ---
const API_URL = import.meta.env.VITE_API_URL || "https://royal-n-api-1.onrender.com";

// --- DATA CONFIGURATION ---
const roomsData = [
  { id: 1, key: 'standard', name: 'The Essential Stay', price: 450, package: 'Perfect for the solo traveler. Includes High-Speed Fiber WiFi, Gourmet Breakfast for 1, and 24/7 Concierge access.', img: '/standard.jpg' },
  { id: 2, key: 'deluxe', name: 'The Royal Experience', price: 550, package: 'Elevate your visit. Includes All-Day Pool & Gym access, Buffet Breakfast for 1, and a complimentary Welcome Drink on arrival.', img: '/deluxe.jpg' },
  { id: 3, key: 'executive', name: 'The Executive Retreat', price: 650, package: 'Luxury without compromise. Includes Full Buffet Breakfast for 2, Private Balcony, Gym & Pool access, and Late Check-out privileges.', img: '/executive.jpg' },
];

const eventsData = [
  { id: 4, key: 'hall', name: 'Corporate Summit Hall', price: 3000, package: 'Professional setting with 50 Chairs, 2 Presenter Tables, High-End Audio/Visual gear, and dedicated photography space.', img: '/hall.jpg' },
  { id: 5, key: 'grounds', name: 'The Grand Grounds', price: 4500, package: 'Our premier outdoor space. Perfect for Weddings or Proposals. Includes bespoke setup, photography access, and evening lighting.', img: '/grounds.jpg' },
];

export default function App() {
  const [view, setView] = useState('guest');
  const [booking, setBooking] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [availability, setAvailability] = useState({
    standard: true, deluxe: true, executive: true, hall: true, grounds: true
  });
  const [dates, setDates] = useState({ start: '', end: '' });
  const [numNights, setNumNights] = useState(1);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // --- ADMIN LOGIN ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
      setView('admin');
      setLoginError(false);
      setAdminPassword("");
    } else {
      setLoginError(true);
    }
  };

  // --- FETCH AVAILABILITY ---
  useEffect(() => {
    const fetchAvail = async () => {
      setLoadingAvailability(true);
      try {
        const res = await fetch(`${API_URL}/api/availability`);
        if (!res.ok) throw new Error("Failed to fetch availability");
        const data = await res.json();
        setAvailability(data);
      } catch (err) {
        console.error("Availability fetch error:", err.message);
        // fallback: mark all as available to not block the UI
        setAvailability({ standard: true, deluxe: true, executive: true, hall: true, grounds: true });
      } finally {
        setLoadingAvailability(false);
      }
    };
    fetchAvail();
  }, []);

  // --- CALCULATE NUM NIGHTS ---
  useEffect(() => {
    if (dates.start && dates.end) {
      const s = new Date(dates.start);
      const e = new Date(dates.end);
      const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
      setNumNights(diff > 0 ? diff : 1);
    }
  }, [dates]);

  // --- HANDLE BOOKING SUBMISSION ---
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const finalPrice = booking.price * (booking.id < 4 ? numNights : 1);
    const payload = {
      guestName: e.target.guestName.value,
      email: e.target.email.value,
      roomType: booking.name,
      price: Number(finalPrice),
      startDate: dates.start,
      endDate: dates.end,
      status: 'Pending',
      paid: false
    };

    try {
      const response = await fetch(`${API_URL}/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Booking failed");
      }

      setIsSuccess(true);
      setTimeout(() => {
        setBooking(null);
        setIsSuccess(false);
        setDates({ start: '', end: '' });
      }, 4000);
    } catch (err) {
      console.error("Booking error:", err.message);
      alert(`Booking failed: ${err.message}. Please check your connection.`);
    }
  };

  // --- RENDER VIEWS ---
  if (view === 'admin') return <AdminDashboard setView={setView} />;

  if (view === 'login') {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f4f4f4' }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '320px', textAlign: 'center' }}>
          <img src="/logo2.jpeg" alt="Logo" style={{ height: '60px', marginBottom: '20px' }} />
          <h3>Staff Portal</h3>
          <input type="password" placeholder="Password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '10px', border: loginError ? '2px solid red' : '1px solid #ddd' }} />
          <button type="submit" className="btn-book" style={{ width: '100%', background: '#c19d68', color: 'white', border: 'none', padding: '12px', cursor: 'pointer' }}>Login</button>
          <p onClick={() => setView('guest')} style={{ cursor: 'pointer', textDecoration: 'underline', marginTop: '15px', color: '#666' }}>Return Home</p>
        </form>
      </div>
    );
  }

  // --- MAIN GUEST SITE ---
  return (
    <div className="main-wrapper">
      {/* NAVBAR, HERO, ROOMS, EVENTS, FOOTER */}
      {/* ...layout stays exactly the same as your original code... */}

      {/* BOOKING MODAL */}
      {booking && (
        <div className="modal-overlay" onClick={() => setBooking(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '400px' }}>
            {!isSuccess ? (
              <form onSubmit={handleBookingSubmit} className="booking-form">
                <h3 style={{ margin: '0 0 20px' }}>Reserve {booking.name}</h3>
                <input name="guestName" placeholder="Full Name" required style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
                <input name="email" type="email" placeholder="Email" required style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.7rem' }}>Check-in</label>
                    <input type="date" min={new Date().toISOString().split("T")[0]} required onChange={e => setDates({ ...dates, start: e.target.value })} style={{ width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.7rem' }}>Check-out</label>
                    <input type="date" min={dates.start} required disabled={!dates.start} onChange={e => setDates({ ...dates, end: e.target.value })} style={{ width: '100%' }} />
                  </div>
                </div>
                <button type="submit" style={{ width: '100%', padding: '12px', background: '#333', color: '#fff', border: 'none', borderRadius: '5px' }}>
                  Confirm (GH₵ {booking.id < 4 ? (booking.price * numNights).toLocaleString() : booking.price.toLocaleString()})
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <h2 style={{ color: '#2ecc71' }}>✓ Sent!</h2>
                <p>Check your email for confirmation.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
