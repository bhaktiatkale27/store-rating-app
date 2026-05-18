import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/dashboard')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Platform overview and statistics</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
        <div className="stat-card accent">
          <p className="stat-label">Total Users</p>
          <p className="stat-value" style={{ color: 'var(--accent)' }}>{stats?.totalUsers ?? 0}</p>
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>Registered on platform</p>
        </div>
        <div className="stat-card gold">
          <p className="stat-label">Total Stores</p>
          <p className="stat-value" style={{ color: 'var(--gold)' }}>{stats?.totalStores ?? 0}</p>
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>Listed stores</p>
        </div>
        <div className="stat-card success">
          <p className="stat-label">Total Ratings</p>
          <p className="stat-value" style={{ color: 'var(--success)' }}>{stats?.totalRatings ?? 0}</p>
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>Submitted reviews</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <Link to="/admin/users" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 6 }}>Manage Users</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>View, filter, and add users to the platform</p>
          </div>
        </Link>
        <Link to="/admin/stores" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>🏪</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 6 }}>Manage Stores</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Browse stores and their ratings</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
