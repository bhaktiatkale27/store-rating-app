import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const validate = (form) => {
  const errors = {};
  if (!form.name || form.name.length < 20 || form.name.length > 60)
    errors.name = 'Name must be 20–60 characters';
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'Enter a valid email address';
  if (!form.password || form.password.length < 8 || form.password.length > 16)
    errors.password = 'Password must be 8–16 characters';
  else if (!/[A-Z]/.test(form.password))
    errors.password = 'Password must have at least one uppercase letter';
  else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password))
    errors.password = 'Password must have at least one special character';
  if (form.address && form.address.length > 400)
    errors.address = 'Address must not exceed 400 characters';
  return errors;
};

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setServerError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/stores');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[name]}
        onChange={e => setForm({ ...form, [name]: e.target.value })}
      />
      {errors[name] && <p className="error-text">{errors[name]}</p>}
    </div>
  );

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
      background: 'radial-gradient(ellipse at 80% 30%, rgba(124,111,255,0.08) 0%, transparent 50%)'
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Create account</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Join StoreRate and start rating stores</p>
        </div>

        <div className="card">
          {serverError && <div className="alert alert-error">{serverError}</div>}
          <form onSubmit={handleSubmit}>
            {field('name', 'Full Name', 'text', 'Min 20, max 60 characters')}
            {field('email', 'Email Address', 'email', 'you@example.com')}
            {field('password', 'Password', 'password', '8–16 chars, 1 uppercase, 1 special')}
            <div className="form-group">
              <label>Address <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
              <textarea
                placeholder="Your address (max 400 characters)"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                rows={3}
                style={{ resize: 'vertical' }}
              />
              {errors.address && <p className="error-text">{errors.address}</p>}
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: 15, fontWeight: 600, marginTop: 8 }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
