import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./index.css";
import AdminDashboard from "./components/adminDashboard";

const API_URL = import.meta.env.VITE_API_URL || "https://royal-n-api-1.onrender.com";

const roomsData = [
  { id: 1, key: "standard", name: "The Essential Stay", price: 450, package: "Perfect for the solo traveler. Includes High-Speed Fiber WiFi and Gourmet Breakfast.", img: "/standard.jpg" },
  { id: 2, key: "deluxe", name: "The Royal Experience", price: 550, package: "Elevate your visit. Includes All-Day Pool & Gym access and a Welcome Drink.", img: "/deluxe.jpg" },
  { id: 3, key: "executive", name: "The Executive Retreat", price: 650, package: "Experience comfort and convenience with complimentary Wi-Fi, exclusive access to our pool and gym facilities, and daily breakfast for two guests.", img: "/executive.jpg" },
];

const eventsData = [
  { id: 4, key: "hall", name: "Corporate Summit Hall", price: 3000, package: "Professional setting with Audio/Visual gear and dedicated space.", img: "/hall.jpg" },
  { id: 5, key: "grounds", name: "The Grand Grounds", price: 4500, package: "Our premier outdoor space. Perfect for Weddings or Proposals.", img: "/grounds.jpg" },
];

export default function App() {
  const [booking, setBooking] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [availability, setAvailability] = useState({ standard: true, deluxe: true, executive: true, hall: true, grounds: true });
  const [dates, setDates] = useState({ start: "", end: "" });
  const [numNights, setNumNights] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvail = async () => {
      try {
        const res = await fetch(`${API_URL}/api/availability/`);
        if (res.ok) {
          const data = await res.json();
          setAvailability(data);
        }
      } catch (err) { console.error("Availability fetch error:", err); }
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
    }
  }, [dates]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!booking || isSubmitting) return;
    setIsSubmitting(true);
    const isEvent = booking.id >= 4;
    const finalPrice = isEvent ? booking.price : booking.price * numNights;

    const payload = {
      guest_name: guestName,
      email: guestEmail,
      room_type: booking.name,
      price: Number(finalPrice),
      start_date: dates.start,
      end_date: dates.end,
    };

    try {
      const response = await fetch(`${API_URL}/api/bookings/book/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setIsSuccess(true);
        setGuestName("");
        setGuestEmail("");
        setTimeout(() => {
          setBooking(null);
          setIsSuccess(false);
          setDates({ start: "", end: "" });
        }, 3000);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Please try again."}`);
      }
    } catch (err) {
      alert("Server connection lost. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const LoginPage = () => (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={(e) => {
        e.preventDefault();
        if (adminPassword === "admin123") { navigate("/admin"); setLoginError(false); }
        else setLoginError(true);
      }}>
        <img src="/logo2.jpeg" alt="Logo" />
        <h3>Staff Portal</h3>
        <input
          type="password"
          placeholder="Password"
          value={adminPassword}
          onChange={(e) => { setAdminPassword(e.target.value); setLoginError(false); }}
          className={loginError ? "error-input" : ""}
        />
        {loginError && <p style={{ color: '#ff4d4d', fontSize: '0.85rem', marginTop: '-10px' }}>Incorrect password</p>}
        <button type="submit" className="btn-book">Login</button>
        <p className="link-text" onClick={() => navigate("/")}>Return Home</p>
      </form>
    </div>
  );

  const isEvent = booking && booking.id >= 4;

  const GuestPage = () => (
    <div className="main-wrapper">
      <nav className="navbar">
        <div className="container nav-flex">
          <div className="logo">
            <img src="/logo2.jpeg" alt="Logo" />
            <span>ROYAL 'N' HOTEL</span>
          </div>
          <ul className="nav-links">
            <li><a href="#rooms">Rooms</a></li>
            <li><a href="#events">Events</a></li>
            <li><a onClick={() => navigate("/login")} style={{ cursor: 'pointer' }}>Staff</a></li>
          </ul>
        </div>
      </nav>

      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Experience Timeless Elegance</h1>
          <p>Luxury redefined in the heart of the city.</p>
        </div>
      </header>

      <section id="rooms" className="section container">
        <h2 className="section-title">Our Rooms</h2>
        <div className="grid">
          {roomsData.map((room) => (
            <div key={room.id} className="card">
              <div className="card-image" style={{ backgroundImage: `url(${room.img})` }}>
                {!availability[room.key] && <div className="overlay">FULL</div>}
              </div>
              <div className="card-body">
                <h3>{room.name}</h3>
                <p>{room.package}</p>
                <div className="card-footer">
                  <span className="price-tag">GH₵ {room.price}/night</span>
                  <button className="btn-book" onClick={() => setBooking(room)} disabled={!availability[room.key]}>Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="events" className="section light">
        <div className="container">
          <h2 className="section-title">Events & Grounds</h2>
          <div className="grid">
            {eventsData.map((event) => (
              <div key={event.id} className="card">
                <div className="card-image" style={{ backgroundImage: `url(${event.img})` }}>
                  {!availability[event.key] && <div className="overlay">BOOKED</div>}
                </div>
                <div className="card-body">
                  <h3>{event.name}</h3>
                  <p>{event.package}</p>
                  <div className="card-footer">
                    <span className="price-tag">GH₵ {event.price} (Flat)</span>
                    <button className="btn-book" onClick={() => setBooking(event)} disabled={!availability[event.key]}>Enquire Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="main-footer">
        <div className="container footer-grid">
          <div>
            <img src="/logo2.jpeg" alt="Royal N Hotel Logo" className="footer-logo" />
            <h3 style={{ color: 'var(--royal-gold)', marginBottom: '15px' }}>ROYAL 'N' HOTEL</h3>
            <p>Redefining luxury and comfort for the modern traveler. Experience excellence in hospitality.</p>
          </div>
          <div></div>
          <div>
            <h4>Quick Links</h4>
            <ul style={{ listStyle: 'none', marginTop: '10px' }}>
              <li><a href="#rooms">Our Rooms</a></li>
              <li><a href="#events">Event Spaces</a></li>
              <li onClick={() => navigate("/login")} style={{ cursor: 'pointer', color: '#ccc' }}>Staff Portal</li>
            </ul>
          </div>
          <div>
            <h4>Contact Us</h4>
            <p style={{ marginTop: '10px' }}>📍 123 Luxury Lane, Accra, Ghana</p>
            <p>📞 +233 (0)553696197</p>
            <p>✉️ royalnhotel3@gmail.com</p>
          </div>
        </div>
        <div className="container" style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #333', fontSize: '0.8rem', color: '#888' }}>
          &copy; {new Date().getFullYear()} Royal 'N' Hotel. All Rights Reserved.
        </div>
      </footer>

      {booking && (
        <div className="modal-overlay" onClick={() => setBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {!isSuccess ? (
              <form className="booking-form" onSubmit={handleBookingSubmit}>
                <h3 style={{ fontFamily: 'Playfair Display', marginBottom: '15px' }}>
                  {isEvent ? "Enquire: " : "Reserve: "}{booking.name}
                </h3>
                <input placeholder="Full Name" value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
                <input type="email" placeholder="Email Address" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} required />
                <div className="date-row">
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '4px' }}>
                      {isEvent ? "Event Date" : "Check-In"}
                    </label>
                    <input type="date" value={dates.start} required min={new Date().toISOString().split("T")[0]} onChange={(e) => setDates({ ...dates, start: e.target.value })} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '4px' }}>
                      {isEvent ? "End Date" : "Check-Out"}
                    </label>
                    <input type="date" value={dates.end} required min={dates.start || new Date().toISOString().split("T")[0]} onChange={(e) => setDates({ ...dates, end: e.target.value })} />
                  </div>
                </div>
                {!isEvent && numNights > 0 && (
                  <p style={{ fontSize: '0.8rem', color: '#888', margin: '5px 0' }}>{numNights} night{numNights > 1 ? 's' : ''}</p>
                )}
                <button type="submit" className="btn-book" style={{ width: '100%', marginTop: '10px' }} disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : `Confirm — GH₵ ${(isEvent ? booking.price : booking.price * numNights).toLocaleString()}`}
                </button>
              </form>
            ) : (
              <div className="success-message" style={{ textAlign: 'center', padding: '20px 0' }}>
                <h2 style={{ color: 'var(--royal-gold)', fontSize: '2rem' }}>✓</h2>
                <h3 style={{ color: 'var(--royal-gold)', marginBottom: '10px' }}>Request Sent!</h3>
                <p>Check your email for confirmation.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<GuestPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}
