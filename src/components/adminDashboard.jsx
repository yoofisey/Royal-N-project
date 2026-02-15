import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "https://royal-n-api-1.onrender.com";
const roomsDataKeys = ['standard', 'deluxe', 'executive', 'hall', 'grounds'];
const ADMIN_AUTH_HEADER = { 'x-admin-password': 'admin123' }; // Matches your .env

export default function AdminDashboard({ setView }) {
  const [adminBookings, setAdminBookings] = useState([]);
  const [availability, setAvailability] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = async () => {
    if (isUpdating) return; 
    try {
      // 1. Fetch Bookings (Protected Route)
      const bRes = await fetch(`${API_URL}/api/admin/bookings`, {
        headers: ADMIN_AUTH_HEADER
      });
      const bData = await bRes.json();
      if (Array.isArray(bData)) setAdminBookings(bData);

      // 2. Fetch Availability (Public/Internal Route)
      const aRes = await fetch(`${API_URL}/api/availability/`);
      const aData = await aRes.json();
      setAvailability(aData);
    } catch (err) { 
      console.error("Refresh error:", err); 
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [isUpdating]);

  const updateBooking = async (id, updates) => {
    // Optimistic UI update
    setAdminBookings(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
    
    try {
      await fetch(`${API_URL}/api/admin/bookings/${id}/paid`, { // Specifically for the Paid toggle
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...ADMIN_AUTH_HEADER 
        },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const toggleStatus = async (key) => {
    setIsUpdating(true);
    const newStatus = !availability[key];
    setAvailability(prev => ({ ...prev, [key]: newStatus }));

    try {
      await fetch(`${API_URL}/api/availability/toggle`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...ADMIN_AUTH_HEADER 
        },
        body: JSON.stringify({ room_key: key, is_available: newStatus })
      });
    } catch (err) {
      console.error("Toggle failed", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Delete permanently?")) return;
    setAdminBookings(prev => prev.filter(b => b.id !== id));
    
    await fetch(`${API_URL}/api/admin/bookings/${id}`, { 
      method: 'DELETE',
      headers: ADMIN_AUTH_HEADER
    });
  };

  return (
    <div className="admin-container" style={{ padding: '20px', background: '#fff', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <h2 style={{fontFamily: 'Playfair Display, serif'}}>ROYAL 'N' PANEL {isUpdating && <small style={{fontSize:'0.8rem', color:'orange'}}>...Saving</small>}</h2>
        <button onClick={() => setView('guest')} style={{ background: '#333', color: '#fff', padding: '8px 15px', border:'none', cursor:'pointer', borderRadius: '4px' }}>Logout</button>
      </nav>

      {/* STATS ROW */}
      <div className="stats-row" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div className="stat-card" style={{ flex: 1, padding: '20px', border: '1px solid #eee', borderRadius: '10px', background: '#fcfcfc', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.5rem', margin: '0 0 10px 0', color: '#27ae60' }}>
            GH₵ {adminBookings
              .filter(b => b.paid) 
              .reduce((sum, b) => sum + (Number(b.price) || 0), 0)
              .toLocaleString()}
          </h3>
          <p style={{ color: '#666', margin: 0, fontWeight: 'bold' }}>Total Paid Revenue</p>
        </div>

        <div className="stat-card" style={{ flex: 1, padding: '20px', border: '1px solid #eee', borderRadius: '10px', background: '#fcfcfc', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.5rem', margin: '0 0 10px 0', color: '#333' }}>
            {adminBookings.length}
          </h3>
          <p style={{ color: '#666', margin: 0, fontWeight: 'bold' }}>Total Reservations</p>
        </div>
      </div>

      <h3 style={{marginBottom: '15px'}}>Inventory Control</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
        {roomsDataKeys.map(key => (
          <button key={key} onClick={() => toggleStatus(key)} style={{ padding: '10px', borderRadius: '5px', background: availability[key] ? '#d4edda' : '#f8d7da', cursor: 'pointer', border: '1px solid #ccc', fontWeight: 'bold' }}>
            {key.toUpperCase()}: {availability[key] ? '✅ Open' : '❌ Full'}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead style={{ background: '#f8f9fa' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #eee' }}>Guest & Room</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #eee' }}>Check-In</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #eee' }}>Check-Out</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #eee' }}>Price</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #eee' }}>Status</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #eee' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {adminBookings.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>
                  <strong style={{ fontSize: '1rem', color: '#333' }}>{b.guest_name}</strong><br/>
                  <small style={{ color: '#c19d68', fontWeight: 'bold' }}>{b.room_type?.toUpperCase()}</small>
                </td>
                <td style={{ padding: '15px', color: '#555' }}>
                  <div style={{ fontWeight: 'bold' }}>{new Date(b.start_date).toLocaleDateString('en-GB')}</div>
                  <small style={{ color: '#888' }}>Arrival</small>
                </td>
                <td style={{ padding: '15px', color: '#555' }}>
                  <div style={{ fontWeight: 'bold' }}>{new Date(b.end_date).toLocaleDateString('en-GB')}</div>
                  <small style={{ color: '#888' }}>Departure</small>
                </td>
                <td style={{ padding: '15px', fontWeight: 'bold', color: '#27ae60' }}>
                  GH₵ {Number(b.price).toLocaleString()}
                </td>
                <td style={{ padding: '15px' }}>
                  <select 
                    value={b.status || 'pending'} 
                    onChange={(e) => updateBooking(b.id, { status: e.target.value })} 
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button 
                    onClick={() => updateBooking(b.id, { paid: !b.paid })} 
                    style={{ 
                      marginLeft: '10px',
                      padding: '6px 12px', 
                      borderRadius: '15px', 
                      border: 'none', 
                      background: b.paid ? '#2ecc71' : '#e74c3c', 
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: '0.3s'
                    }}
                  >
                    {b.paid ? 'PAID' : 'MARK PAID'}
                  </button>
                </td>
                <td style={{ padding: '15px' }}>
                  <button onClick={() => deleteBooking(b.id)} style={{ color: '#ff4d4d', background: 'none', border: '1px solid #ff4d4d', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                    Delete
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