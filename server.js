import { useState, useEffect } from 'react';
import './index.css';s';
import nodemailer from 'nodemailer';
// --- API CONFIGURATION ---
// This regex ensures that even if you have a trailing slash in your Render URL, it won't break the fetch calls.
const BASE_URL = import.meta.env.VITE_API_URL || "https://royal-n-api-1.onrender.com";
const API_URL = BASE_URL.replace(/\/$/, ""); 

const roomsData = [en for the frontend connection
  { id: 1, key: 'standard', name: 'The Essential Stay', price: 450, package: 'Perfect for the solo traveler. Includes High-Speed Fiber WiFi, Gourmet Breakfast for 1, and 24/7 Concierge access.', img: 'images/standard.jpg' },
  { id: 2, key: 'deluxe', name: 'The Royal Experience', price: 550, package: 'Elevate your visit. Includes All-Day Pool & Gym access, Buffet Breakfast for 1, and a complimentary Welcome Drink on arrival.', img: 'images/deluxe.jpg' },
  { id: 3, key: 'executive', name: 'The Executive Retreat', price: 650, package: 'Luxury without compromise. Includes Full Buffet Breakfast for 2, Private Balcony, Gym & Pool access, and Late Check-out privileges.', img: 'images/executive.jpg' },
];nst PORT = process.env.PORT || 5000;
const DATA_FILE = './bookings.json';
const eventsData = [
  { id: 4, key: 'hall', name: 'Corporate Summit Hall', price: 3000, package: 'Professional setting with 50 Chairs, 2 Presenter Tables, High-End Audio/Visual gear, and dedicated photography space.', img: 'images/hall.jpg' },
  { id: 5, key: 'grounds', name: 'The Grand Grounds', price: 4500, package: 'Our premier outdoor space. Perfect for Weddings or Proposals. Includes bespoke setup, photography access, and evening lighting.', img: 'images/grounds.jpg' },
]; (fs.existsSync(DATA_FILE)) {
    try {
function AdminDashboard({ setView }) {ileSync(DATA_FILE));
  const [adminBookings, setAdminBookings] = useState([]);
  const [availability, setAvailability] = useState({ 
    standard: true, deluxe: true, executive: true, hall: true, grounds: true 
  });

  const fetchData = () => {{
    fetch(`${API_URL}/api/bookings`).then(res => res.json()).then(setAdminBookings).catch(e => console.error("Booking Fetch Error:", e));
    fetch(`${API_URL}/api/availability`).then(res => res.json()).then(setAvailability).catch(e => console.error("Avail Fetch Error:", e));
  };
let roomAvailability = { standard: true, deluxe: true, executive: true, hall: true, grounds: true };
  useEffect(() => {
    fetchData();FIGURATION ---
    const interval = setInterval(fetchData, 8000); // 8 seconds is safer for Render free tier
    return () => clearInterval(interval);
  }, []); {
        user: 'seyyoofi95@gmail.com', 
  const updateBooking = (id, updates) => {
    setAdminBookings(prev => prev.map(b => b.id == id ? { ...b, ...updates } : b));
    fetch(`${API_URL}/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates) => res.json(bookings));
    });('/api/availability', (req, res) => res.json(roomAvailability));
  };
app.post('/api/book', (req, res) => {
  const toggleStatus = (key) => {mType, price, startDate, endDate } = req.body;
    const newStatus = !availability[key];
    setAvailability(prev => ({ ...prev, [key]: newStatus }));
    fetch(`${API_URL}/api/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomType: key, status: newStatus })
    }); price: Number(price),
  };    startDate, 
        endDate,
  return (atus: 'Pending',
    <div className="admin-container" style={{ padding: '20px', background: '#fff', minHeight: '100vh' }}>
      <nav className="admin-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="images/logo2.jpeg" alt="Logo" style={{ height: '40px' }} />
          <h2 style={{ margin: 0 }}>ROYAL 'N' PANEL</h2>
        </div>
        <button onClick={() => setView('guest')} className="btn-book">Logout to Site</button>
      </nav>ilOptions = {
        from: '"Royal N Hotel" <seyyoofi95@gmail.com>',
      <div className="admin-content">
        <div className="stats-row" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px'}}>
          <div className="stat-card" style={{padding: '20px', border: '1px solid #eee', borderRadius: '10px'}}>you shortly.`
            <h3>GH₵ {adminBookings.filter(b => b.paid).reduce((sum, b) => sum + (Number(b.price) || 0), 0).toLocaleString()}</h3>
            <p>Paid Revenue</p>
          </div>sendMail(mailOptions)
          <div className="stat-card" style={{padding: '20px', border: '1px solid #eee', borderRadius: '10px'}}>
            <h3>{adminBookings.length}</h3>failed (booking still saved):", err));
            <p>Total Reservations</p>
          </div>00).json({ message: "Booking received!", booking: newBooking });
        </div>

        <h3 style={{marginTop: '30px'}}>Inventory</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
          {Object.keys(availability).map(key => (
            <button key={key} onClick={() => toggleStatus(key)} style={{ padding: '10px', background: availability[key] ? '#d4edda' : '#f8d7da', border: 'none', cursor: 'pointer' }}>
              {key}: {availability[key] ? '✅ Open' : '❌ Full'}
            </button>
          ))}pi/bookings/:id', (req, res) => {
        </div> } = req.params;
    bookings = bookings.map(b => b.id == id ? { ...b, ...req.body } : b);
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{background: '#f8f9fa'}}>
                <th style={{padding: '10px', textAlign: 'left'}}>Guest</th>
                <th style={{padding: '10px', textAlign: 'left'}}>Dates</th>
                <th style={{padding: '10px', textAlign: 'left'}}>Status</th>                <th style={{padding: '10px', textAlign: 'left'}}>Payment</th>              </tr>            </thead>            <tbody>              {adminBookings.map(b => (                <tr key={b.id}>                  <td style={{padding: '10px', borderBottom: '1px solid #eee'}}>{b.guestName}<br/><small>{b.roomType}</small></td>                  <td style={{padding: '10px', borderBottom: '1px solid #eee'}}>{b.startDate} - {b.endDate}</td>                  <td style={{padding: '10px', borderBottom: '1px solid #eee'}}>                    <select value={b.status} onChange={(e) => updateBooking(b.id, {status: e.target.value})}>                      <option value="Pending">Pending</option>                      <option value="Confirmed">Confirmed</option>                      <option value="Cancelled">Cancelled</option>                    </select>                  </td>                  <td style={{padding: '10px', borderBottom: '1px solid #eee'}}>                    <button onClick={() => updateBooking(b.id, {paid: !b.paid})} style={{background: b.paid ? '#2ecc71' : '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px'}}>                      {b.paid ? 'Paid' : 'Unpaid'}                    </button>                  </td>                </tr>              ))}            </tbody>          </table>        </div>      </div>    </div>  );}export default function App() {  const [view, setView] = useState('guest');   const [booking, setBooking] = useState(null);  const [isSuccess, setIsSuccess] = useState(false);  const [loginError, setLoginError] = useState(false);  const [availability, setAvailability] = useState({     standard: true, deluxe: true, executive: true, hall: true, grounds: true   });  const [dates, setDates] = useState({ start: '', end: '' });  const [numNights, setNumNights] = useState(1);  useEffect(() => {    fetch(`${API_URL}/api/availability`).then(res => res.json()).then(setAvailability).catch(() => {});  }, []);  useEffect(() => {    if (dates.start && dates.end) {      const s = new Date(dates.start);      const e = new Date(dates.end);      const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));      setNumNights(diff > 0 ? diff : 1);    }  }, [dates]);  const handleBookingSubmit = async (e) => {    e.preventDefault();    const payload = {      guestName: e.target.guestName.value,      email: e.target.email.value,      roomType: booking.name,      price: Number(booking.price * (booking.id < 4 ? numNights : 1)),      startDate: dates.start,      endDate: dates.end    };    try {      const res = await fetch(`${API_URL}/api/book`, {        method: 'POST',        headers: { 'Content-Type': 'application/json' },        body: JSON.stringify(payload)      });      if (res.ok) {        setIsSuccess(true);        setTimeout(() => { setBooking(null); setIsSuccess(false); }, 4000);      } else { throw new Error(); }    } catch {      alert("Booking failed. Is the server awake at " + API_URL + "?");    }  };  if (view === 'admin') return <AdminDashboard setView={setView} />;  return (    <div className="main-wrapper">      <nav className="navbar">        <div className="container nav-flex">          <div className="logo" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>             <img src="images/logo2.jpeg" alt="Logo" style={{height: '40px'}} />             <span>ROYAL 'N' HOTEL</span>          </div>          <ul className="nav-links">            <li><a href="#rooms">Rooms</a></li>            <li><a href="#events">Events</a></li>            <li onClick={() => setView('login')} style={{cursor: 'pointer', fontSize: '0.7rem', color: '#ccc'}}>Staff</li>          </ul>        </div>      </nav>      <header className="hero-section" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('images/hero.jpg')`}}>        <div className="hero-content">          <h1 className="hero-title">Experience Timeless Elegance</h1>          <p>Luxury redefined in the heart of the city.</p>          <a href="#rooms" className="btn-primary">View Rooms</a>        </div>      </header>      <section id="rooms" className="container section">        <h2 style={{textAlign: 'center', margin: '40px 0'}}>Our Rooms</h2>        <div className="room-grid">          {roomsData.map(room => (            <div key={room.id} className="room-card">              <div style={{height: '220px', background: `url(${room.img}) center/cover`, position: 'relative'}}>                {!availability[room.key] && <div className="sold-out-overlay">FULL</div>}              </div>              <div style={{padding: '20px'}}>                <h3>{room.name}</h3>                <p style={{fontSize: '0.9rem', color: '#666', height: '60px'}}>{room.package}</p>                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px'}}>                  <span style={{fontWeight: 'bold'}}>GH₵ {room.price}/night</span>                  <button className="btn-book" onClick={() => setBooking(room)} disabled={!availability[room.key]}>Book Now</button>                </div>              </div>            </div>          ))}        </div>      </section>      {/* Booking Modal */}      {booking && (        <div className="modal-overlay" onClick={() => setBooking(null)}>          <div className="modal-content" onClick={e => e.stopPropagation()}>            {!isSuccess ? (              <form onSubmit={handleBookingSubmit} className="booking-form">                <h3>Reserve {booking.name}</h3>                <input name="guestName" placeholder="Full Name" required />                <input name="email" type="email" placeholder="Email Address" required />                <div style={{display: 'flex', gap: '10px'}}>                  <input type="date" onChange={e => setDates({...dates, start: e.target.value})} required />                  <input type="date" onChange={e => setDates({...dates, end: e.target.value})} required />                </div>                <button type="submit" className="btn-submit">Confirm Reservation</button>              </form>            ) : (              <div style={{textAlign: 'center'}}><h2>✓ Sent!</h2><p>Check email for details.</p></div>            )}          </div>        </div>      )}      {/* Login View could be added here similar to your code */}    </div>  );}