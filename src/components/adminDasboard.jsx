import { useState, useEffect } from 'react';

function AdminDashboard({ setView }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [adminBookings, setAdminBookings] = useState([]);
  const [availability, setAvailability] = useState({
    standard: true, deluxe: true, executive: true, hall: true, grounds: true
  });

  // Simple hardcoded credential
  const ADMIN_PASSWORD = "admin123"; 

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect Password");
    }
  };

  const fetchData = () => {
    if (!isAuthenticated) return; // Only fetch if logged in
    fetch('http://localhost:5000/api/bookings').then(res => res.json()).then(setAdminBookings).catch(() => {});
    fetch('http://localhost:5000/api/availability').then(res => res.json()).then(setAvailability).catch(() => {});
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // --- LOGIN SCREEN VIEW ---
  if (!isAuthenticated) {
    return (
      <div className="login-overlay" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f4f4' }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center', width: '350px' }}>
          <h2 style={{ marginBottom: '10px' }}>Admin Access</h2>
          <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.9rem' }}>Please enter your credentials</p>
          <input 
            type="password" 
            placeholder="Enter Admin Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' }}
          />
          <button type="submit" className="btn-book" style={{ width: '100%', padding: '12px' }}>Login</button>
          <button onClick={() => setView('guest')} style={{ background: 'none', border: 'none', marginTop: '15px', color: '#888', cursor: 'pointer' }}>Back to Site</button>
        </form>
      </div>
    );
  }

  // --- ACTUAL DASHBOARD VIEW (Shown only if logged in) ---
  return (
    <div className="admin-container">
      <nav className="admin-nav">
        <h2 className="logo">ROYAL 'N' HOTEL</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ alignSelf: 'center', color: '#2ecc71', fontSize: '0.8rem' }}>● Logged In</span>
            <button onClick={() => setView('guest')} className="btn-book">Logout</button>
        </div>
      </nav>

      <div className="admin-content">
        {/* ... (Keep your existing Dashboard content: Toggles, Table, etc.) ... */}
      </div>
    </div>
  );
}

export default AdminDashboard;