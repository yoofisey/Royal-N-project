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

      <h3>Inventory Control</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
        {roomsDataKeys.map(key => (
          <button key={key} onClick={() => toggleStatus(key)} style={{ padding: '10px', borderRadius: '5px', background: availability[key] ? '#d4edda' : '#f8d7da', cursor: 'pointer', border: '1px solid #ccc' }}>
            {key}: {availability[key] ? '✅ Open' : '❌ Full'}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f4f4f4' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left' }}>Guest</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Dates</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Paid</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {adminBookings.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>
                    <strong>{b.guest_name}</strong><br/>{b.room_type}
                </td>
                <td style={{ padding: '12px' }}>{b.start_date} to {b.end_date}</td>
                <td style={{ padding: '12px' }}>
                  <select value={b.status} onChange={(e) => updateBooking(b.id, {status: e.target.value})}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => updateBooking(b.id, {paid: !b.paid})} style={{ background: b.paid ? '#2ecc71' : '#e74c3c', color:'#fff', border:'none', borderRadius:'10px', padding:'4px 10px' }}>
                    {b.paid ? 'Paid' : 'Unpaid'}
                  </button>
                </td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => deleteBooking(b.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}