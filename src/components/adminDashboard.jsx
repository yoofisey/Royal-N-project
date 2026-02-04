import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "https://royal-n-api-1.onrender.com";

const roomsDataKeys = ['standard', 'deluxe', 'executive', 'hall', 'grounds'];

export default function AdminDashboard({ setView }) {
  const [adminBookings, setAdminBookings] = useState([]);
  const [availability, setAvailability] = useState(
    roomsDataKeys.reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );

  // --- FETCH DATA ---
  const fetchData = () => {
    fetch(`${API_URL}/api/bookings`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAdminBookings(data);
      })
      .catch(err => console.error("Booking fetch error:", err));

    fetch(`${API_URL}/api/availability`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') setAvailability(data);
      })
      .catch(err => console.error("Avail fetch error:", err));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  // --- UPDATE BOOKING ---
  const updateBooking = (id, updates) => {
    setAdminBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, ...updates } : b))
    );

    fetch(`${API_URL}/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(err => console.error("Update failed:", err));
  };

  // --- DELETE BOOKING ---
  const deleteBooking = (id) => {
    if (!window.confirm("Are you sure you want to delete this booking permanentely?")) return;

    // Optimistic UI update (remove from screen immediately)
    setAdminBookings(prev => prev.filter(b => b.id !== id));

    fetch(`${API_URL}/api/bookings/${id}`, {
      method: 'DELETE',
    }).catch(err => {
      console.error("Delete failed:", err);
      fetchData(); // Refresh if server call fails
    });
  };

  // --- TOGGLE AVAILABILITY ---
  const toggleStatus = (key) => {
    const newStatus = !availability[key];
    setAvailability(prev => ({ ...prev, [key]: newStatus }));

    fetch(`${API_URL}/api/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomType: key, status: newStatus })
    }).catch(err => console.error("Toggle failed:", err));
  };

  return (
    <div className="admin-container" style={{ padding: '20px', background: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* NAVBAR */}
      <nav className="admin-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo2.jpeg" alt="Logo" style={{ height: '40px' }} />
          <h2 style={{ margin: 0 }}>ROYAL 'N' PANEL</h2>
        </div>
        <button onClick={() => setView('guest')} style={{ background: '#333', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>
          Logout to Site
        </button>
      </nav>

      {/* STATS */}
      <div className="stats-row" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div className="stat-card" style={{ flex: 1, padding: '20px', border: '1px solid #eee', borderRadius: '10px', background: '#fcfcfc' }}>
          <h3 style={{ fontSize: '1.5rem', margin: '0 0 10px 0', color: '#27ae60' }}>
            GH₵ {adminBookings.filter(b => b.paid).reduce((sum, b) => sum + (Number(b.price) || 0), 0).toLocaleString()}
          </h3>
          <p style={{ color: '#666', margin: 0 }}>Total Paid Revenue</p>
        </div>
        <div className="stat-card" style={{ flex: 1, padding: '20px', border: '1px solid #eee', borderRadius: '10px', background: '#fcfcfc' }}>
          <h3 style={{ fontSize: '1.5rem', margin: '0 0 10px 0' }}>{adminBookings.length}</h3>
          <p style={{ color: '#666', margin: 0 }}>Total Reservations</p>
        </div>
      </div>

      {/* INVENTORY CONTROL */}
      <h3 style={{ marginBottom: '15px' }}>Inventory Control</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
        {roomsDataKeys.map(key => (
          <button key={key} onClick={() => toggleStatus(key)} style={{ padding: '10px 15px', borderRadius: '5px', border: '1px solid #ccc', background: availability[key] ? '#d4edda' : '#f8d7da', cursor: 'pointer', textTransform: 'capitalize', fontWeight: 'bold' }}>
            {key}: {availability[key] ? '✅ Open' : '❌ Full'}
          </button>
        ))}
      </div>

      {/* BOOKINGS TABLE */}
      <div className="admin-table-container" style={{ overflowX: 'auto', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead style={{ background: '#f8f9fa' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #eee' }}>Guest & Room</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #eee' }}>Stay Dates</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #eee' }}>Price</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #eee' }}>Status</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #eee' }}>Payment</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #eee' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminBookings.map(b => (
              <tr key={b.id} style={{ transition: 'background 0.2s' }}>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                  <strong style={{ fontSize: '1rem' }}>{b.guest_name}</strong><br/>
                  <small style={{ color: '#c19d68', fontWeight: 'bold' }}>{b.room_type}</small>
                </td>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee', color: '#555' }}>
                  {b.start_date} to {b.end_date}
                </td>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                  GH₵ {Number(b.price).toLocaleString()}
                </td>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                  <select 
                    value={b.status || 'pending'} 
                    onChange={(e) => updateBooking(b.id, { status: e.target.value })} 
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', background: '#fff' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                  <button 
                    onClick={() => updateBooking(b.id, { paid: !b.paid })} 
                    style={{ 
                      padding: '8px 15px', 
                      borderRadius: '20px', 
                      border: 'none', 
                      cursor: 'pointer', 
                      background: b.paid ? '#2ecc71' : '#e74c3c', 
                      color: 'white',
                      fontWeight: 'bold',
                      minWidth: '100px'
                    }}
                  >
                    {b.paid ? `Paid` : "Mark Paid"}
                  </button>
                </td>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                  <button 
                    onClick={() => deleteBooking(b.id)} 
                    style={{ 
                      padding: '8px 12px', 
                      borderRadius: '5px', 
                      border: '1px solid #ff4d4d', 
                      background: 'transparent',
                      color: '#ff4d4d',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {adminBookings.length === 0 && (
          <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No reservations found yet.</p>
        )}
      </div>
    </div>
  );
}