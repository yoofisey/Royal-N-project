import { useState, useEffect } from 'react';
import './index.css';
import AdminDashboard from '/Users/franc/royal-project/hotel-site/src/components/adminDasboard'; // moved admin panel here

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
      try {
        const res = await fetch(`${API_URL}/api/availability`);
        if (!res.ok) return;
        const data = await res.json();
        setAvailability(data);
      } catch {
        console.warn("Backend unavailable.");
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
      if (!response.ok) throw new Error();
      setIsSuccess(true);
      setTimeout(() => { 
        setBooking(null); 
        setIsSuccess(false); 
        setDates({ start: '', end: '' }); 
      }, 4000);
    } catch {
      alert("Booking failed. Please check your connection.");
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
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="container nav-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0' }}>
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo2.jpeg" alt="Logo" style={{ height: '40px' }} />
            <span style={{ fontWeight: 'bold' }}>ROYAL 'N' HOTEL</span>
          </div>
          <ul className="nav-links" style={{ display: 'flex', gap: '20px', listStyle: 'none' }}>
            <li><a href="#rooms" style={{ textDecoration: 'none', color: '#333' }}>Rooms</a></li>
            <li><a href="#events" style={{ textDecoration: 'none', color: '#333' }}>Events</a></li>
          </ul>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero-section" style={{ height: '60vh', background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("/hero.jpg") center/cover', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center' }}>
        <div className="hero-content">
          <h1 style={{ fontSize: '3rem' }}>Experience Timeless Elegance</h1>
          <p>Luxury redefined in the heart of the city.</p>
        </div>
      </header>

      {/* ROOMS SECTION */}
      <section id="rooms" className="container" style={{ padding: '60px 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Our Rooms</h2>
        <div className="room-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {roomsData.map(room => (
            <div key={room.id} className="room-card" style={{ border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ height: '220px', background: `url(${room.img}) center/cover`, position: 'relative' }}>
                {!availability[room.key] && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>FULL</div>}
              </div>
              <div style={{ padding: '20px' }}>
                <h3>{room.name}</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>{room.package}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                  <span style={{ fontWeight: 'bold' }}>GH₵ {room.price}/night</span>
                  <button className="btn-book" onClick={() => setBooking(room)} disabled={!availability[room.key]}>Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EVENTS SECTION */}
      <section id="events" className="container" style={{ padding: '60px 0', background: '#fdfdfd' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Events & Grounds</h2>
        <div className="room-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {eventsData.map(event => (
            <div key={event.id} className="room-card" style={{ border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden', background: '#fff' }}>
              <div style={{ height: '220px', background: `url(${event.img}) center/cover`, position: 'relative' }}>
                {!availability[event.key] && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>BOOKED</div>}
              </div>
              <div style={{ padding: '20px' }}>
                <h3>{event.name}</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>{event.package}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                  <span style={{ fontWeight: 'bold' }}>GH₵ {event.price} (Flat)</span>
                  <button className="btn-book" onClick={() => setBooking(event)} disabled={!availability[event.key]}>Enquire Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="main-footer" style={{ background: '#1a1a1a', color: '#fff', padding: '60px 0 20px', marginTop: '40px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
          <div>
            <img src="/logo2.jpeg" alt="Logo"  style={{ height: '60px', borderRadius: '5px', cursor: 'pointer', marginBottom: '15px' }} />
            <h3 style={{ color: '#c19d68' }}>ROYAL 'N' HOTEL</h3>
            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>World-Class Hospitality since 2026.</p>
          </div>
          <div>
            <h4 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
              <li><a href="#rooms" style={{ color: '#aaa', textDecoration: 'none' }}>Rooms</a></li>
              <li><a href="#events" style={{ color: '#aaa', textDecoration: 'none' }}>Events</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>Contact</h4>
            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>📍 Pokuase, Ghana</p>
            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>📞 +233 (0) </p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #333', marginTop: '40px', paddingTop: '20px', textAlign: 'center', color: '#666', fontSize: '0.8rem' }}>
          <p>© 2026 Royal 'N' Hotel. Designed for Excellence.</p>
        </div>
      </footer>

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
                    <input type="date" min={new Date().toISOString().split("T")[0]} required onChange={e => setDates({...dates, start: e.target.value})} style={{ width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.7rem' }}>Check-out</label>
                    <input type="date" min={dates.start} required disabled={!dates.start} onChange={e => setDates({...dates, end: e.target.value})} style={{ width: '100%' }} />
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
