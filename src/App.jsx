import { useState, useEffect } from 'react';
import './index.css';

// --- API CONFIGURATION ---
const API_URL = import.meta.env.VITE_API_URL || "https://royal-n-api-1.onrender.com/";

// --- DATA CONFIGURATION ---
// I removed "hotel-site/" from all paths. Images should be in /public/images/
const roomsData = [
  { id: 1, key: 'standard', name: 'The Essential Stay', price: 450, package: 'Perfect for the solo traveler. Includes High-Speed Fiber WiFi, Gourmet Breakfast for 1, and 24/7 Concierge access.', img: 'images/standard.jpg' },
  { id: 2, key: 'deluxe', name: 'The Royal Experience', price: 550, package: 'Elevate your visit. Includes All-Day Pool & Gym access, Buffet Breakfast for 1, and a complimentary Welcome Drink on arrival.', img: 'images/deluxe.jpg' },
  { id: 3, key: 'executive', name: 'The Executive Retreat', price: 650, package: 'Luxury without compromise. Includes Full Buffet Breakfast for 2, Private Balcony, Gym & Pool access, and Late Check-out privileges.', img: 'images/executive.jpg' },
];

const eventsData = [
  { id: 4, key: 'hall', name: 'Corporate Summit Hall', price: 3000, package: 'Professional setting with 50 Chairs, 2 Presenter Tables, High-End Audio/Visual gear, and dedicated photography space.', img: 'images/hall.jpg' },
  { id: 5, key: 'grounds', name: 'The Grand Grounds', price: 4500, package: 'Our premier outdoor space. Perfect for Weddings or Proposals. Includes bespoke setup, photography access, and evening lighting.', img: 'images/grounds.jpg' },
];

// --- ADMIN DASHBOARD COMPONENT ---
function AdminDashboard({ setView }) {
  const [adminBookings, setAdminBookings] = useState([]);
  const [availability, setAvailability] = useState({ 
    standard: true, deluxe: true, executive: true, hall: true, grounds: true 
  });

  const fetchData = () => {
    fetch(`${API_URL}/api/bookings`).then(res => res.json()).then(setAdminBookings).catch(() => {});
    fetch(`${API_URL}/api/availability`).then(res => res.json()).then(setAvailability).catch(() => {});
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateBooking = (id, updates) => {
    setAdminBookings(prev => prev.map(b => b.id == id ? { ...b, ...updates } : b));
    fetch(`${API_URL}/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  };

  const toggleStatus = (key) => {
    const newStatus = !availability[key];
    setAvailability(prev => ({ ...prev, [key]: newStatus }));
    fetch(`${API_URL}/api/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomType: key, status: newStatus })
    });
  };

  return (
    <div className="admin-container" style={{ padding: '20px', background: '#fff', minHeight: '100vh' }}>
      <nav className="admin-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="images/logo2.jpeg" alt="Logo" style={{ height: '40px' }} />
          <h2 style={{ margin: 0 }}>ROYAL 'N' PANEL</h2>
        </div>
        <button onClick={() => setView('guest')} className="btn-book" style={{ background: '#333', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>
          Logout to Site
        </button>
      </nav>

      <div className="admin-content">
        <div className="stats-row">
          <div className="stat-card">
            <h3 style={{ fontSize: '1.5rem', margin: '0 0 10px 0' }}>GH₵ {adminBookings.filter(b => b.paid).reduce((sum, b) => sum + (Number(b.price) || 0), 0).toLocaleString()}</h3>
            <p style={{ color: '#666', margin: 0 }}>Total Paid Revenue</p>
          </div>
          <div className="stat-card">
            <h3>{adminBookings.length}</h3>
            <p>Total Reservations</p>
          </div>
        </div>

        <h3 style={{marginTop: '20px'}}>Inventory Control</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
          {Object.keys(availability).map(key => (
            <button key={key} onClick={() => toggleStatus(key)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', background: availability[key] ? '#d4edda' : '#f8d7da', cursor: 'pointer', textTransform: 'capitalize' }}>
              {key}: {availability[key] ? '✅ Open' : '❌ Full'}
            </button>
          ))}
        </div>

        <div className="admin-table-container" style={{ overflowX: 'auto' }}>
          <h3>Recent Bookings</h3>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', minWidth: '600px' }}>
            <thead style={{ background: '#f4f4f4' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Guest</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Stay Dates</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Payment</th>
              </tr>
            </thead>
            <tbody>
              {adminBookings.map(b => (
                <tr key={b.id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <strong>{b.guestName}</strong><br/>
                    <small style={{color: '#666'}}>{b.roomType}</small>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontSize: '0.85rem' }}>
                    {b.startDate} to {b.endDate}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <select 
                      value={b.status || 'Pending'} 
                      onChange={(e) => updateBooking(b.id, { status: e.target.value })}
                      style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                      <option value="Pending">⏳ Pending</option>
                      <option value="Checked In">🔑 Checked In</option>
                      <option value="Checked Out">🚪 Checked Out</option>
                      <option value="Cancelled">❌ Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <button onClick={() => updateBooking(b.id, { paid: !b.paid })} style={{ padding: '5px 10px', borderRadius: '15px', border: 'none', cursor: 'pointer', background: b.paid ? '#2ecc71' : '#e74c3c', color: 'white' }}>
                      {b.paid ? `Paid GH₵ ${b.price}` : "Mark Paid"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
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

  useEffect(() => {
    const fetchAvail = () => {
      fetch(`${API_URL}/api/availability`).then(res => res.json()).then(setAvailability).catch(() => {});
    };
    fetchAvail();
    const interval = setInterval(fetchAvail, 5000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (dates.start && dates.end) {
      const s = new Date(dates.start);
      const e = new Date(dates.end);
      const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
      setNumNights(diff > 0 ? diff : 1);
    } else {
      setNumNights(1);
    }
  }, [dates]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const finalPrice = booking.price * (booking.id < 4 ? numNights : 1); // Only rooms use nights, halls use flat rate
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
      alert("Booking failed. Please check your internet or try again later.");
    }
  };

  if (view === 'admin') return <AdminDashboard setView={setView} />;

  if (view === 'login') {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f4f4f4' }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '90%', maxWidth: '400px', textAlign: 'center' }}>
          <img src="images/logo2.jpeg" alt="Logo" style={{ height: '60px', marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Staff Portal</h2>
          <input 
            type="password" 
            placeholder="Enter Admin Password" 
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '10px', border: loginError ? '2px solid #e74c3c' : '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box' }}
          />
          {loginError && <p style={{ color: '#e74c3c', fontSize: '0.8rem', marginBottom: '10px' }}>Invalid Password</p>}
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#c19d68', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Login
          </button>
          <button type="button" onClick={() => setView('guest')} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}>
            Return to Homepage
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="main-wrapper">
      <nav className="navbar">
        <div className="container nav-flex">
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="images/logo2.jpeg" alt="Logo" style={{ height: '40px' }} />
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>ROYAL 'N' HOTEL</span>
          </div>
          <ul className="nav-links">
            <li><a href="#rooms">Rooms</a></li>
            <li><a href="#events">Events</a></li>
          </ul>
        </div>
      </nav>

      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Experience Timeless Elegance</h1>
          <p>Luxury redefined in the heart of the city.</p>
          <a href="#rooms" className="btn-primary">View Rooms</a>
        </div>
      </header>

      <section id="rooms" className="container section">
        <h2 style={{ textAlign: 'center', margin: '30px 0' }}>Our Rooms</h2>
        <div className="room-grid">
          {roomsData.map((room) => (
            <div key={room.id} className="room-card">
              <div style={{ height: '200px', background: `url(${room.img}) center/cover`, position: 'relative' }}>
                {!availability[room.key] && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>FULL</div>}
              </div>
              <div style={{ padding: '20px' }}>
                <h3>{room.name}</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>{room.package}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                  <span style={{ fontWeight: 'bold' }}>GH₵ {room.price} / night</span>
                  <button className="btn-book" onClick={() => setBooking(room)} disabled={!availability[room.key]}>
                    {availability[room.key] ? "Book Now" : "Sold Out"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="events" className="container section" style={{ padding: '60px 0', background: '#fdfdfd' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Event Experiences</h2>
        <div className="room-grid">
          {eventsData.map((event) => (
            <div key={event.id} className="room-card">
              <div style={{ height: '200px', background: `url(${event.img}) center/cover`, position: 'relative' }}>
                {!availability[event.key] && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>UNAVAILABLE</div>}
              </div>
              <div style={{ padding: '20px' }}>
                <h3>{event.name}</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>{event.package}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                  <span style={{ fontWeight: 'bold' }}>GH₵ {event.price}</span>
                  <button className="btn-book" onClick={() => setBooking(event)} disabled={!availability[event.key]}>
                    {availability[event.key] ? "Enquire Now" : "Fully Booked"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="main-footer">
        <div className="container footer-grid">
          <div>
            <img 
              src="images/logo2.jpeg" 
              alt="Logo" 
              onClick={() => setView('login')}
              style={{ height: '60px', borderRadius: '5px', cursor: 'pointer' }} 
            />
            <h3 style={{ margin: '10px 0', color: '#c19d68' }}>ROYAL 'N' HOTEL</h3>
            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>World-Class Hospitality since 2026.</p>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '20px' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><a href="#rooms" style={{ color: '#aaa', textDecoration: 'none' }}>Our Rooms</a></li>
              <li><a href="#events" style={{ color: '#aaa', textDecoration: 'none' }}>Event Center</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '20px' }}>Find Us</h4>
            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>📍 Accra, Ghana</p>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '20px' }}>Follow Us</h4>
            <div style={{ display: 'flex', gap: '15px' }}>
              <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Facebook</a>
              <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Instagram</a>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #333', paddingTop: '20px', textAlign: 'center', color: '#666', fontSize: '0.8rem', marginTop: '40px' }}>
          <p>© 2026 Royal 'N' Hotel. Designed for Excellence.</p>
        </div>
      </footer>

      {booking && (
        <div className="modal-overlay" onClick={() => { setBooking(null); setDates({start:'', end:''}); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {!isSuccess ? (
              <form className="booking-form" onSubmit={handleBookingSubmit}>
                <h3 style={{ margin: 0 }}>Reserve {booking.name}</h3>
                <input name="guestName" type="text" placeholder="Full Name" required />
                <input name="email" type="email" placeholder="Email Address" required />
                
                <div style={{display: 'flex', gap: '10px'}}>
                  <div style={{flex: 1}}>
                    <label style={{fontSize: '0.75rem', color: '#666'}}>Check-In</label>
                    <input name="startDate" type="date" required min={new Date().toISOString().split("T")[0]} value={dates.start} onChange={(e) => setDates({...dates, start: e.target.value})} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{fontSize: '0.75rem', color: '#666'}}>Check-Out</label>
                    <input name="endDate" type="date" required disabled={!dates.start} min={dates.start} value={dates.end} onChange={(e) => setDates({...dates, end: e.target.value})} />
                  </div>
                </div>

                <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '5px', fontSize: '0.85rem', color: '#333' }}>
                   {booking.id < 4 ? `${numNights} night(s) x GH₵ ${booking.price}` : `Flat rate: GH₵ ${booking.price}`}
                </div>

                <button type="submit" className="btn-submit">
                  Confirm (GH₵ {booking.id < 4 ? booking.price * numNights : booking.price})
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '3rem', color: '#2ecc71', marginBottom: '10px' }}>✓</div>
                <h3>Reservation Sent!</h3>
                <p>Check your email for confirmation.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}