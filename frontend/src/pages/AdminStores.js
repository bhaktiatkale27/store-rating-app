import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SortableHeader from '../components/SortableHeader';
import StarRating from '../components/StarRating';

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [showModal, setShowModal] = useState(false);
  const [owners, setOwners] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [formErrors, setFormErrors] = useState({});
  const [serverMsg, setServerMsg] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchStores = useCallback(() => {
    setLoading(true);
    axios.get('/api/admin/stores', { params: { ...filters, sortBy, sortOrder } })
      .then(({ data }) => setStores(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, sortBy, sortOrder]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const fetchOwners = () => {
    axios.get('/api/admin/users', { params: { role: 'store_owner' } })
      .then(({ data }) => setOwners(data));
  };

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(field); setSortOrder('ASC'); }
  };

  const validate = (f) => {
    const errors = {};
    if (!f.name || f.name.length < 20 || f.name.length > 60) errors.name = 'Name must be 20–60 characters';
    if (!f.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) errors.email = 'Valid email required';
    if (f.address && f.address.length > 400) errors.address = 'Max 400 characters';
    return errors;
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setFormErrors({}); setServerMsg(''); setCreating(true);
    try {
      await axios.post('/api/admin/stores', { ...form, owner_id: form.owner_id || null });
      setServerMsg('success:Store created!');
      setForm({ name: '', email: '', address: '', owner_id: '' });
      fetchStores();
      setTimeout(() => setShowModal(false), 1200);
    } catch (err) {
      setServerMsg('error:' + (err.response?.data?.message || 'Failed'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stores</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{stores.length} stores registered</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowModal(true); setServerMsg(''); fetchOwners(); }}>
          + Add Store
        </button>
      </div>

      <div className="filter-bar">
        {['name', 'email', 'address'].map(f => (
          <input key={f} type="text" placeholder={`Filter by ${f}...`}
            value={filters[f]} onChange={e => setFilters({ ...filters, [f]: e.target.value })} />
        ))}
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <SortableHeader label="Name" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Email" field="email" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Address" field="address" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <th>Owner</th>
                <SortableHeader label="Rating" field="avg_rating" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {stores.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No stores found</td></tr>
              ) : stores.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.address || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.owner_name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StarRating value={Math.round(s.avg_rating)} readonly size="sm" />
                      <span style={{ fontWeight: 600 }}>{parseFloat(s.avg_rating).toFixed(1)}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({s.total_ratings})</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Add New Store</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {serverMsg && (
              <div className={`alert ${serverMsg.startsWith('success') ? 'alert-success' : 'alert-error'}`}>
                {serverMsg.replace(/^(success|error):/, '')}
              </div>
            )}
            <form onSubmit={handleCreateStore}>
              <div className="form-group">
                <label>Store Name</label>
                <input type="text" placeholder="Min 20, max 60 chars" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
                {formErrors.name && <p className="error-text">{formErrors.name}</p>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                {formErrors.email && <p className="error-text">{formErrors.email}</p>}
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} />
                {formErrors.address && <p className="error-text">{formErrors.address}</p>}
              </div>
              <div className="form-group">
                <label>Store Owner (optional)</label>
                <select value={form.owner_id} onChange={e => setForm({ ...form, owner_id: e.target.value })}>
                  <option value="">— No owner —</option>
                  {owners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStores;
