import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SortableHeader from '../components/SortableHeader';

const validate = (form) => {
  const errors = {};
  if (!form.name || form.name.length < 20 || form.name.length > 60)
    errors.name = 'Name must be 20–60 characters';
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'Enter a valid email';
  if (!form.password || form.password.length < 8 || form.password.length > 16)
    errors.password = 'Password must be 8–16 characters';
  else if (!/[A-Z]/.test(form.password))
    errors.password = 'Needs at least one uppercase letter';
  else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password))
    errors.password = 'Needs at least one special character';
  if (form.address && form.address.length > 400)
    errors.address = 'Max 400 characters';
  if (!form.role) errors.role = 'Role is required';
  return errors;
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [formErrors, setFormErrors] = useState({});
  const [serverMsg, setServerMsg] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = { ...filters, sortBy, sortOrder };
    axios.get('/api/admin/users', { params })
      .then(({ data }) => setUsers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, sortBy, sortOrder]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(field); setSortOrder('ASC'); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setFormErrors({});
    setServerMsg('');
    setCreating(true);
    try {
      await axios.post('/api/admin/users', form);
      setServerMsg('success:User created successfully!');
      setForm({ name: '', email: '', password: '', address: '', role: 'user' });
      fetchUsers();
      setTimeout(() => setShowModal(false), 1200);
    } catch (err) {
      setServerMsg('error:' + (err.response?.data?.message || 'Failed to create user'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{users.length} users found</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowModal(true); setServerMsg(''); setFormErrors({}); }}>
          + Add User
        </button>
      </div>

      <div className="filter-bar">
        {['name', 'email', 'address'].map(f => (
          <input key={f} type="text" placeholder={`Filter by ${f}...`}
            value={filters[f]}
            onChange={e => setFilters({ ...filters, [f]: e.target.value })}
          />
        ))}
        <select value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value })}
          style={{ flex: 1, minWidth: 140, maxWidth: 180 }}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="store_owner">Store Owner</option>
        </select>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <SortableHeader label="Name" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Email" field="email" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Address" field="address" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Role" field="role" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address || '—'}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role.replace('_', ' ')}</span></td>
                  <td>
                    <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }}
                      onClick={() => setShowDetail(u)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Add New User</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {serverMsg && (
              <div className={`alert ${serverMsg.startsWith('success') ? 'alert-success' : 'alert-error'}`}>
                {serverMsg.replace(/^(success|error):/, '')}
              </div>
            )}
            <form onSubmit={handleCreateUser}>
              {[['name', 'Full Name', 'text', 'Min 20, max 60 chars'], ['email', 'Email', 'email', ''], ['password', 'Password', 'password', '8-16 chars, uppercase, special']].map(([f, l, t, p]) => (
                <div className="form-group" key={f}>
                  <label>{l}</label>
                  <input type={t} placeholder={p} value={form[f]}
                    onChange={e => setForm({ ...form, [f]: e.target.value })} />
                  {formErrors[f] && <p className="error-text">{formErrors[f]}</p>}
                </div>
              ))}
              <div className="form-group">
                <label>Address</label>
                <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} />
                {formErrors.address && <p className="error-text">{formErrors.address}</p>}
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="user">Normal User</option>
                  <option value="admin">Admin</option>
                  <option value="store_owner">Store Owner</option>
                </select>
                {formErrors.role && <p className="error-text">{formErrors.role}</p>}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showDetail && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowDetail(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">User Details</h2>
              <button className="modal-close" onClick={() => setShowDetail(null)}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 700, color: '#fff'
                }}>{showDetail.name[0]}</div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>{showDetail.name}</p>
                  <span className={`badge badge-${showDetail.role}`}>{showDetail.role.replace('_', ' ')}</span>
                </div>
              </div>
              {[['Email', showDetail.email], ['Address', showDetail.address || '—']].map(([l, v]) => (
                <div key={l} style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                  <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 4 }}>{l}</p>
                  <p style={{ color: 'var(--text-primary)' }}>{v}</p>
                </div>
              ))}
              {showDetail.role === 'store_owner' && (
                <div style={{ padding: '12px 16px', background: 'var(--gold-soft)', borderRadius: 8, border: '1px solid rgba(245,200,66,0.2)' }}>
                  <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: 4 }}>Store Rating</p>
                  <p style={{ color: 'var(--gold)', fontWeight: 600, fontSize: 18 }}>
                    {parseFloat(showDetail.avg_rating || 0).toFixed(1)} ⭐
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
