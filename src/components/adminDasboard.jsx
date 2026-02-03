import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "https://royal-n-api-1.onrender.com";

const roomsDataKeys = ['standard', 'deluxe', 'executive', 'hall', 'grounds'];

export default function AdminDashboard({ setView }) {
  const [adminBookings, setAdminBookings] = useState([]);
  const [availability, setAvailability] = useState(
    roomsDataKeys.reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );

  // --- FETCH BOOKINGS & AVAILABILITY ---
  const fetchData = () => {
    fetch(`${API_URL}/api/bookings`)
      .then(res => res.json())
      .then(setAdminBookings)
      .catch(() => {});

    fetch(`${API_URL}/api/availability`)
      .then(res => res.json())
      .then(setAvailability)
      .catch(() => {});
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
    });
  };

  return (
    <div className="admin-container" style={{ padding: '20px', background: '#fff', minHeight: '100vh' }}>
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
        <div className="stat-card" style={{ flex: 1, padding: '20px', border: '1px solid #eee', borderRadius: '10px' }}>
          <h3 style={{ fontSize: '1.5rem', margin: '0 0 10px 0' }}>
            GH₵ {adminBookings.filter(b => b.paid).reduce((sum, b) => sum + (Number(b.price) || 0), 0).toLocaleString()}
          </h3>
          <p style={{ color: '#666', margin: 0 }}>Total Paid Revenue</p>
        </div>
        <div className="stat-card" style={{ flex: 1, padding: '20px', border: '1px solid #eee', borderRadius: '10px' }}>
          <h3 style={{ fontSize: '1.5rem', margin: '0 0 10px 0' }}>{adminBookings.length}</h3>
          <p style={{ color: '#666', margin: 0 }}>Total Reservations</p>
        </div>
      </div>

      {/* INVENTORY CONTROL */}
      <h3>Inventory Control</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
        {roomsDataKeys.map(key => (
          <button key={key} onClick={() => toggleStatus(key)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', background: availability[key] ? '#d4edda' : '#f8d7da', cursor: 'pointer', textTransform: 'capitalize' }}>
            {key}: {availability[key] ? '✅ Open' : '❌ Full'}
          </button>
        ))}
      </div>

      {/* BOOKINGS TABLE */}
      <div className="admin-table-container" style={{ overflowX: 'auto' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
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
                  <strong>{b.guestName}</strong><br/><small style={{color: '#666'}}>{b.roomType}</small>
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{b.startDate} to {b.endDate}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                  <select value={b.status || 'Pending'} onChange={(e) => updateBooking(b.id, { status: e.target.value })} style={{ padding: '5px', borderRadius: '4px' }}>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                  <button onClick={() => updateBooking(b.id, { paid: !b.paid })} style={{ padding: '5px 10px', borderRadius: '15px', border: 'none', cursor: 'pointer', background: b.paid ? '#2ecc71' : '#e74c3c', color: 'white' }}>
                    {b.paid ? `Paid` : "Mark Paid"}
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
