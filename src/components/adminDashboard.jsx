import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "https://royal-n-api-1.onrender.com";
const roomsDataKeys = ['standard', 'deluxe', 'executive', 'hall', 'grounds'];
const ADMIN_AUTH_HEADER = { 'x-admin-password': 'admin123' };

export default function AdminDashboard({ setView }) {
  const [adminBookings, setAdminBookings] = useState([]);
  const [availability, setAvailability] = useState({});
  const [togglingKey, setTogglingKey] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [bRes, aRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/bookings`, { headers: ADMIN_AUTH_HEADER }),
        fetch(`${API_URL}/api/availability`)
      ]);

      const bData = await bRes.json();
      const aData = await aRes.json();

      if (Array.isArray(bData)) setAdminBookings(bData);
      if (aData && typeof aData === 'object') setAvailability(aData);
    } catch (err) {
      console.error("Refresh error:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const updateBooking = async (id, updates) => {
    setAdminBookings(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));

    try {
      const res = await fetch(`${API_URL}/api/admin/bookings/${id}/paid`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...ADMIN_AUTH_HEADER
        },
        body: JSON.stringify(updates)
      });

      if (!res.ok) throw new Error("Update failed on server");
    } catch (err) {
      console.error("Update failed, rolling back:", err);
      fetchData();
    }
  };

  const toggleStatus = async (key) => {
    if (togglingKey) return;

    const newStatus = !availability[key];
    setTogglingKey(key);
    setAvailability(prev => ({ ...prev, [key]: newStatus }));

    try {
      const response = await fetch(`${API_URL}/api/availability/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...ADMIN_AUTH_HEADER
        },
        body: JSON.stringify({ room_key: key, is_available: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server rejected the update");
      }

      console.log(`✅ ${key} → ${newStatus ? 'Available' : 'Full'}`);
    } catch (err) {
      console.error("Toggle failed, rolling back:", err);
      setAvailability(prev => ({ ...prev, [key]: !newStatus }));
      alert(`Failed to update ${key}: ${err.message}`);
    } finally {
      setTogglingKey(null);
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Delete permanently?")) return;
    setAdminBookings(prev => prev.filter(b => b.id !== id));

    try {
      await fetch(`${API_URL}/api/admin/bookings/${id}`, {
        method: 'DELETE',
        headers: ADMIN_AUTH_HEADER
      });
    } catch (err) {
      console.error("Delete failed:", err);
      fetchData();
    }
  };

  return (
    <div className="admin-container" style={{ padding: '20px', background: '#fff', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif' }}>ROYAL 'N' PANEL</h2>
        <button onClick={() => setView('guest')} style={{ background: '#333', color: '#fff', padding: '8px 15px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
          Logout
        </button>
      </nav>

      {/* Stats */}
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

      {/* Inventory Toggle */}
      <h3 style={{ marginBottom: '15px' }}>Inventory Control</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
        {roomsDataKeys.map(key => {
          const isLoading = togglingKey === key;
          const isAvailable = availability[key];

          return (
            <button
              key={key}
              onClick={() => toggleStatus(key)}
              disabled={isLoading}
              style={{
                padding: '10px 16px',
                borderRadius: '5px',
                background: isLoading ? '#f0f0f0' : isAvailable ? '#d4edda' : '#f8d7da',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                border: '1px solid #ccc',
                fontWeight: 'bold',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {isLoading ? `${key.toUpperCase()}: ...` : `${key.toUpperCase()}: ${isAvailable ? '✅ Open' : '❌ Full'}`}
            </button>
          );
        })}
      </div>

      {/* Bookings Table */}
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
            {adminBookings.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#aaa' }}>No bookings yet.</td>
              </tr>
            ) : (
              adminBookings.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}>
                    <strong style={{ fontSize: '1rem', color: '#333' }}>{b.guest_name}</strong><br />
                    <small style={{ color: '#c19d68', fontWeight: 'bold' }}>{b.room_type?.toUpperCase()}</small><br />
                    <small style={{ color: '#999' }}>{b.email}</small>
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
                    <button
                      onClick={() => deleteBooking(b.id)}
                      style={{ color: '#ff4d4d', background: 'none', border: '1px solid #ff4d4d', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}