import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StarRating from '../components/StarRating';

const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('DESC');

  useEffect(() => {
    axios.get('/api/owner/dashboard')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  const ratings = data?.ratings || [];
  const sorted = [...ratings].sort((a, b) => sortOrder === 'DESC' ? b.rating - a.rating : a.rating - b.rating);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Dashboard</h1>
          {data?.store && <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{data.store.name}</p>}
        </div>
      </div>

      {!data?.store ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🏪</p>
          <p style={{ color: 'var(--text-muted)' }}>No store assigned to your account yet. Contact an admin.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 36 }}>
            <div className="stat-card gold">
              <p className="stat-label">Average Rating</p>
              <p className="stat-value" style={{ color: 'var(--gold)' }}>{data.avg_rating}</p>
              <div style={{ marginTop: 8 }}>
                <StarRating value={Math.round(parseFloat(data.avg_rating))} readonly />
              </div>
            </div>
            <div className="stat-card accent">
              <p className="stat-label">Total Ratings</p>
              <p className="stat-value" style={{ color: 'var(--accent)' }}>{data.total_ratings}</p>
              <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>Customer reviews</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>Customer Ratings</h2>
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}
              style={{ width: 'auto', minWidth: 160 }}>
              <option value="DESC">Highest First</option>
              <option value="ASC">Lowest First</option>
            </select>
          </div>

          {sorted.length === 0 ? (
            <div className="card empty-state">
              <p className="empty-icon">⭐</p>
              <p>No ratings yet</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th onClick={() => setSortOrder(o => o === 'ASC' ? 'DESC' : 'ASC')} style={{ cursor: 'pointer' }}>
                      Rating {sortOrder === 'DESC' ? '↓' : '↑'}
                    </th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500 }}>{r.user_name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{r.user_email}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <StarRating value={r.rating} readonly size="sm" />
                          <span style={{ fontWeight: 600 }}>{r.rating}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                        {new Date(r.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;
