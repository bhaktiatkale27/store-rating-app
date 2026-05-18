import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Current password required';
    if (!form.newPassword || form.newPassword.length < 8 || form.newPassword.length > 16)
      errs.newPassword = 'Password must be 8–16 characters';
    else if (!/[A-Z]/.test(form.newPassword))
      errs.newPassword = 'Must contain at least one uppercase letter';
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.newPassword))
      errs.newPassword = 'Must contain at least one special character';
    if (form.newPassword !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({}); setMsg(''); setLoading(true);
    try {
      await axios.put('/api/auth/update-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      setMsg('success:Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMsg('error:' + (err.response?.data?.message || 'Failed to update password'));
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = { admin: 'System Administrator', user: 'Normal User', store_owner: 'Store Owner' };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
      <h1 className="page-title" style={{ marginBottom: 32 }}>My Profile</h1>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700, color: '#fff'
          }}>{user?.name[0]}</div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>{user?.name}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            <span className={`badge badge-${user?.role}`} style={{ marginTop: 6 }}>{roleLabel[user?.role]}</span>
          </div>
        </div>
        {user?.address && (
          <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 4 }}>Address</p>
            <p style={{ color: 'var(--text-secondary)' }}>{user.address}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Change Password</h3>

        {msg && (
          <div className={`alert ${msg.startsWith('success') ? 'alert-success' : 'alert-error'}`}>
            {msg.replace(/^(success|error):/, '')}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" value={form.currentPassword}
              onChange={e => setForm({ ...form, currentPassword: e.target.value })} />
            {errors.currentPassword && <p className="error-text">{errors.currentPassword}</p>}
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" placeholder="8–16 chars, 1 uppercase, 1 special" value={form.newPassword}
              onChange={e => setForm({ ...form, newPassword: e.target.value })} />
            {errors.newPassword && <p className="error-text">{errors.newPassword}</p>}
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input type="password" value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
            {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '11px 28px' }} disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
