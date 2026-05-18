import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    if (!user) return [];
    if (user.role === 'admin') return [
      { to: '/admin/dashboard', label: 'Dashboard' },
      { to: '/admin/users', label: 'Users' },
      { to: '/admin/stores', label: 'Stores' },
    ];
    if (user.role === 'user') return [
      { to: '/stores', label: 'Stores' },
      { to: '/profile', label: 'Profile' },
    ];
    if (user.role === 'store_owner') return [
      { to: '/owner/dashboard', label: 'Dashboard' },
      { to: '/profile', label: 'Profile' },
    ];
    return [];
  };

  return (
    <nav style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18
          }}>⭐</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)' }}>
            StoreRate
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {getLinks().map(link => (
            <Link key={link.to} to={link.to} style={{
              padding: '6px 14px', borderRadius: 8,
              color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
              transition: 'color 0.2s, background 0.2s',
              textDecoration: 'none',
            }}
              onMouseEnter={e => { e.target.style.color = 'var(--accent)'; e.target.style.background = 'var(--accent-soft)'; }}
              onMouseLeave={e => { e.target.style.color = 'var(--text-secondary)'; e.target.style.background = 'none'; }}
            >{link.label}</Link>
          ))}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 8, padding: '6px 12px'
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff'
                }}>{user.name[0].toUpperCase()}</div>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {user.name.split(' ')[0]}
                </span>
              </div>
              <button onClick={handleLogout} style={{
                background: 'rgba(248,113,113,0.1)',
                color: 'var(--danger)',
                border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 500
              }}>Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login"><button className="btn-secondary" style={{ padding: '7px 18px' }}>Login</button></Link>
              <Link to="/register"><button className="btn-primary" style={{ padding: '7px 18px' }}>Sign Up</button></Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
