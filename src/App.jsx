import { useState, useEffect } from 'react';
import './index.css';

// --- API CONFIGURATION ---
const BASE_URL = import.meta.env.VITE_API_URL || "https://royal-n-api-1.onrender.com";
const API_URL = BASE_URL.replace(/\/$/, ""); 

// --- DATA CONFIGURATION ---
const roomsData = [
  { id: 1, key: 'standard', name: 'The Essential Stay', price: 450, package: 'Perfect for the solo traveler. Includes Fiber WiFi and Gourmet Breakfast.', img: 'images/standard.jpg' },
  { id: 2, key: 'deluxe', name: 'The Royal Experience', price: 550, package: 'Includes Pool/Gym access and a complimentary Welcome Drink.', img: 'images/deluxe.jpg' },
  { id: 3, key: 'executive', name: 'The Executive Retreat', price: 650, package: 'Full Buffet, Private Balcony, and Late Check-out privileges.', img: 'images/executive.jpg' },
];

const eventsData = [
  { id: 4, key: 'hall', name: 'Corporate Summit Hall', price: 3000, package: 'Professional setting with A/V gear and photography space.', img: 'images/hall.jpg' },
  { id: 5, key: 'grounds', name: 'The Grand Grounds', price: 4500, package: 'Premier outdoor space perfect for Weddings or Proposals.', img: 'images/grounds.jpg' },
];

// Combine all for easy lookup in modal
const allAccommodations = [...roomsData, ...eventsData];

function AdminDashboard({ setView }) {
  const [adminBookings, setAdminBookings] = useState([]);
  const [availability, setAvailability] = useState({ 
    standard: true, deluxe: true, executive: true, hall: true, grounds: true 
  });

  const fetchData = () => {
    fetch(`${API_URL}/api/bookings`).then(res => res.json()).then(setAdminBookings).catch(e => console.error("Fetch Error:", e));
    fetch(`${API_URL}/api/availability`).then(res => res.json()).then(setAvailability).catch(e => console.error("Avail Error:", e));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
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
      <nav className="admin-nav" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <h2>ROYAL 'N' PANEL</h2>
        <button onClick={() => setView('guest')} className="btn-book">Logout</button>
      </nav>
      <div className="stats-row" style={{display: 'flex', gap: '20px', margin: '20px 0'}}>
        <div className="stat-card">
           <h3>GH₵ {adminBookings.filter(b => b.paid).reduce((sum, b) => sum + (Number(b.price) || 0), 0).toLocaleString()}</h3>
           <p>Revenue</p>
        </div>
        <div className="stat-card">
           <h3>{adminBookings.length}</h3>
           <p>Bookings</p>
        </div>
      </div>
      <div style={{overflowX: 'auto'}}>
        <table className="admin-table" style={{width: '100%', textAlign: 'left'}}>
          <thead>
            <tr><th>Guest</th><th>Dates</th><th>Status</th><th>Payment</th></tr>
          </thead>
          <tbody>
            {adminBookings.map(b => (
              <tr key={b.id}>
                <td>{b.guestName}<br/><small>{b.roomType}</small></td>
                <td>{b.startDate} / {b.endDate}</td>
                <td>
                  <select value={b.status} onChange={(e) => updateBooking(b.id, {status: e.target.value})}>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => updateBooking(b.id, {paid: !b.paid})} style={{background: b.paid ? 'green' : 'red', color: 'white', border:'none', padding:'5px', borderRadius:'4px'}}>
                    {b.paid ? 'Paid' : 'Mark Paid'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('guest'); 
  const [booking, setBooking] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [availability, setAvailability] = useState({ 
    standard: true, deluxe: true, executive: true, hall: true, grounds: true 
  });
  const [dates, setDates] = useState({ start: '', end: '' });
  const [numNights, setNumNights] = useState(1);

  useEffect(() => {
    fetch(`${API_URL}/api/availability`).then(res => res.json()).then(setAvailability).catch(() => {});
  }, []);

  useEffect(() => {
    if (dates.start && dates.end) {
      const s = new Date(dates.start);
      const e = new Date(dates.end);
      const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
      setNumNights(diff > 0 ? diff : 1);
    }
  }, [dates]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    // Logic: Rooms (ID 1-3) multiply by nights. Events (ID 4-5) are flat rate.
    const totalPrice = booking.id < 4 ? booking.price * numNights : booking.price;

    const payload = {
      guestName: e.target.guestName.value,
      email: e.target.email.value,
      roomType: booking.name,
      price: Number(totalPrice),
      startDate: dates.start,
      endDate: dates.end
    };

    try {
      const res = await fetch(`${API_URL}/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => { setBooking(null); setIsSuccess(false); setDates({start:'', end:''}); }, 4000);
      } else { throw new Error(); }
    } catch {
      alert("Booking failed. Please check your connection.");
    }
  };

  if (view === 'admin') return <AdminDashboard setView={setView} />;

  if (view === 'login') {
    return (
      <div className="login-container" style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}>
        <form onSubmit={(e) => { e.preventDefault(); if(adminPassword === 'admin123') setView('admin'); else alert('Wrong password'); }} style={{padding:'40px', background:'#fff', borderRadius:'8px', boxShadow:'0 4px 10px rgba(0,0,0,0.1)'}}>
          <h3>Staff Login</h3>
          <input type="password" placeholder="Password" onChange={(e) => setAdminPassword(e.target.value)} style={{display:'block', width:'100%', margin:'10px 0', padding:'10px'}} />
          <button type="submit" className="btn-book" style={{width:'100%'}}>Login</button>
          <button type="button" onClick={() => setView('guest')} style={{background:'none', border:'none', marginTop:'10px', color:'gray', cursor:'pointer'}}>Cancel</button>
        </form>
      </div>
    );
  }

  return (
    <div className="main-wrapper">
      <nav className="navbar">
        <div className="container nav-flex">
          <div className="logo" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
             <img src="images/logo2.jpeg" alt="Logo" style={{height: '40px'}} />
             <span>ROYAL 'N' HOTEL</span>
          </div>
          <ul className="nav-links">
            <li><a href="#rooms">Rooms</a></li>
            <li><a href="#events">Events</a></li>
            <li onClick={() => setView('login')} style={{cursor: 'pointer', fontSize: '10px', color: '#ccc'}}>Staff</li>
          </ul>
        </div>
      </nav>

      <header className="hero-section" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('images/hero.jpg')`}}>
        <div className="hero-content">
          <h1 className="hero-title">Experience Timeless Elegance</h1>
          <a href="#rooms" className="btn-primary">Explore Now</a>
        </div>
      </header>

      <section id="rooms" className="container section">
        <h2 style={{textAlign: 'center', margin: '40px 0'}}>Our Accommodations</h2>
        <div className="room-grid">
          {[...roomsData, ...eventsData].map(item => (
            <div key={item.id} className="room-card">
              <div style={{height: '220px', background: `url(${item.img}) center/cover`, position: 'relative'}}>
                {!availability[item.key] && <div className="sold-out-overlay" style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', color:'white', display:'flex', justifyContent:'center', alignItems:'center'}}>FULL</div>}
              </div>
              <div style={{padding: '20px'}}>
                <h3>{item.name}</h3>
                <p style={{fontSize: '0.8rem', color: '#666'}}>{item.package}</p>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px'}}>
                  <span style={{fontWeight: 'bold'}}>GH₵ {item.price}{item.id < 4 ? '/night' : ''}</span>
                  <button className="btn-book" onClick={() => setBooking(item)} disabled={!availability[item.key]}>Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {booking && (
        <div className="modal-overlay" onClick={() => setBooking(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {!isSuccess ? (
              <form onSubmit={handleBookingSubmit} className="booking-form">
                <h3>Reserve {booking.name}</h3>
                <input name="guestName" placeholder="Full Name" required style={{display:'block', width:'100%', marginBottom:'10px', padding:'10px'}} />
                <input name="email" type="email" placeholder="Email Address" required style={{display:'block', width:'100%', marginBottom:'10px', padding:'10px'}} />
                <div style={{display: 'flex', gap: '10px', marginBottom:'10px'}}>
                  <div style={{flex:1}}>
                    <label style={{fontSize:'10px'}}>Check-in</label>
                    <input type="date" min={new Date().toISOString().split('T')[0]} onChange={e => setDates({...dates, start: e.target.value})} required style={{width:'100%', padding:'10px'}} />
                  </div>
                  <div style={{flex:1}}>
                    <label style={{fontSize:'10px'}}>Check-out</label>
                    <input type="date" min={dates.start || new Date().toISOString().split('T')[0]} onChange={e => setDates({...dates, end: e.target.value})} required style={{width:'100%', padding:'10px'}} />
                  </div>
                </div>
                <div style={{marginBottom:'10px', fontSize:'14px', fontWeight:'bold', color:'#c19d68'}}>
                   Total: GH₵ {booking.id < 4 ? (booking.price * numNights).toLocaleString() : booking.price.toLocaleString()}
                </div>
                <button type="submit" className="btn-submit" style={{width:'100%', padding:'12px', background:'#333', color:'#fff', border:'none', cursor:'pointer'}}>Confirm Reservation</button>
              </form>
            ) : (
              <div style={{textAlign: 'center', padding:'20px'}}><h2>✓ Sent!</h2><p>Our team will contact you soon.</p></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}