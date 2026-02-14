import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "https://royal-n-api-1.onrender.com";
const roomsDataKeys = ['standard', 'deluxe', 'executive', 'hall', 'grounds'];

export default function AdminDashboard({ setView }) {
  const [adminBookings, setAdminBookings] = useState([]);
  const [availability, setAvailability] = useState({});
  const [isUpdating, setIsUpdating] = useState(false); // Prevents auto-refresh glitch

  const fetchData = async () => {
    if (isUpdating) return; // Don't fetch while we are clicking a toggle
    try {
      const bRes = await fetch(`${API_URL}/api/bookings`);
      const bData = await bRes.json();
      if (Array.isArray(bData)) setAdminBookings(bData);

      const aRes = await fetch(`${API_URL}/api/availability`);
      const aData = await aRes.json();
      setAvailability(aData);
    } catch (err) { console.error("Refresh error"); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [isUpdating]);

  const updateBooking = async (id, updates) => {
    setAdminBookings(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
    await fetch(`${API_URL}/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  };

  const toggleStatus = async (key) => {
    setIsUpdating(true); // Stop auto-refresh
    const newStatus = !availability[key];
    
    // Update local UI immediately
    setAvailability(prev => ({ ...prev, [key]: newStatus }));

    try {
      await fetch(`${API_URL}/api/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomType: key, status: newStatus })
      });
    } finally {
      setIsUpdating(false); // Resume auto-refresh
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Delete permanently?")) return;
    setAdminBookings(prev => prev.filter(b => b.id !== id));
    await fetch(`${API_URL}/api/bookings/${id}`, { method: 'DELETE' });
  };

  return (
    <div className="admin-container" style={{ padding: '20px', background: '#fff', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <h2>ROYAL 'N' PANEL {isUpdating && <small style={{fontSize:'0.8rem', color:'orange'}}>...Saving</small>}</h2>
        <button onClick={() => setView('guest')} style={{ background: '#333', color: '#fff', padding: '8px 15px', border:'none', cursor:'pointer' }}>Logout</button>
      </nav>
{/* STATS ROW */}
<div className="stats-row" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
  
  {/* TOTAL REVENUE CARD */}
  <div className="stat-card" style={{ 
    flex: 1, 
    padding: '20px', 
    border: '1px solid #eee', 
    borderRadius: '10px', 
    background: '#fcfcfc',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)' 
  }}>
    <h3 style={{ fontSize: '1.5rem', margin: '0 0 10px 0', color: '#27ae60' }}>
      GH₵ {adminBookings
        .filter(b => b.paid) // Only count bookings marked as Paid
        .reduce((sum, b) => sum + (Number(b.price) || 0), 0)
        .toLocaleString()}
    </h3>
    <p style={{ color: '#666', margin: 0, fontWeight: 'bold' }}>Total Paid Revenue</p>
  </div>

  {/* TOTAL RESERVATIONS CARD */}
  <div className="stat-card" style={{ 
    flex: 1, 
    padding: '20px', 
    border: '1px solid #eee', 
    borderRadius: '10px', 
    background: '#fcfcfc',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  }}>
    <h3 style={{ fontSize: '1.5rem', margin: '0 0 10px 0', color: '#333' }}>
      {adminBookings.length}
    </h3>
    <p style={{ color: '#666', margin: 0, fontWeight: 'bold' }}>Total Reservations</p>
  </div>

</div>
      <h3>Inventory Control</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
        {roomsDataKeys.map(key => (
          <button key={key} onClick={() => toggleStatus(key)} style={{ padding: '10px', borderRadius: '5px', background: availability[key] ? '#d4edda' : '#f8d7da', cursor: 'pointer', border: '1px solid #ccc' }}>
            {key}: {availability[key] ? '✅ Open' : '❌ Full'}
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
            <small style={{ color: '#c19d68', fontWeight: 'bold' }}>{b.room_type.toUpperCase()}</small>
          </td>
          
          {/* START DATE */}
          <td style={{ padding: '15px', color: '#555' }}>
            <div style={{ fontWeight: 'bold' }}>{new Date(b.start_date).toLocaleDateString('en-GB')}</div>
            <small style={{ color: '#888' }}>Arrival</small>
          </td>

          {/* END DATE */}
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
                padding: '6px 10px', 
                borderRadius: '15px', 
                border: 'none', 
                background: b.paid ? '#2ecc71' : '#e74c3c', 
                color: 'white',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {b.paid ? 'Paid' : 'Unpaid'}
            </button>
          </td>

          <td style={{ padding: '15px' }}>
            <button 
              onClick={() => deleteBooking(b.id)} 
              style={{ color: '#ff4d4d', background: 'none', border: '1px solid #ff4d4d', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
            >
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