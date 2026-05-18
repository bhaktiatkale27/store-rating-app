import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import StarRating from '../components/StarRating';
import SortableHeader from '../components/SortableHeader';

const UserStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [ratingModal, setRatingModal] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchStores = useCallback(() => {
    setLoading(true);
    axios.get('/api/stores', { params: { ...filters, sortBy, sortOrder } })
      .then(({ data }) => setStores(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, sortBy, sortOrder]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(field); setSortOrder('ASC'); }
  };

  const openRating = (store) => {
    setRatingModal(store);
    setSelectedRating(store.user_rating || 0);
    setMsg('');
  };

  const submitRating = async () => {
    if (!selectedRating) { setMsg('error:Please select a rating'); return; }
    setSubmitting(true);
    try {
      const method = ratingModal.user_rating ? 'put' : 'post';
      await axios[method](`/api/stores/${ratingModal.id}/ratings`, { rating: selectedRating });
      setMsg('success:Rating submitted!');
      fetchStores();
      setTimeout(() => setRatingModal(null), 1000);
    } catch (err) {
      setMsg('error:' + (err.response?.data?.message || 'Failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stores</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Discover and rate stores on our platform</p>
        </div>
      </div>

      <div className="filter-bar">
        <input type="text" placeholder="Search by name..." value={filters.name}
          onChange={e => setFilters({ ...filters, name: e.target.value })} />
        <input type="text" placeholder="Search by address..." value={filters.address}
          onChange={e => setFilters({ ...filters, address: e.target.value })} />
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <SortableHeader label="Store Name" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Address" field="address" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Overall Rating" field="avg_rating" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <th>Your Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stores.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No stores found</td></tr>
              ) : stores.map(s => (
                <tr key={s.id}>
                  <td>
                    <p style={{ fontWeight: 600 }}>{s.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.email}</p>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.address || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StarRating value={Math.round(parseFloat(s.avg_rating))} readonly size="sm" />
                      <span style={{ fontWeight: 600 }}>{parseFloat(s.avg_rating).toFixed(1)}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({s.total_ratings})</span>
                    </div>
                  </td>
                  <td>
                    {s.user_rating ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <StarRating value={s.user_rating} readonly size="sm" />
                        <span style={{ fontWeight: 600, color: 'var(--gold)' }}>{s.user_rating}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Not rated</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => openRating(s)}
                      className={s.user_rating ? 'btn-secondary' : 'btn-primary'}
                      style={{ padding: '5px 14px', fontSize: 13 }}
                    >
                      {s.user_rating ? 'Modify' : 'Rate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ratingModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setRatingModal(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2 className="modal-title">{ratingModal.user_rating ? 'Update Rating' : 'Rate Store'}</h2>
              <button className="modal-close" onClick={() => setRatingModal(null)}>×</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontWeight: 500 }}>{ratingModal.name}</p>

            {msg && (
              <div className={`alert ${msg.startsWith('success') ? 'alert-success' : 'alert-error'}`}>
                {msg.replace(/^(success|error):/, '')}
              </div>
            )}

            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
                Select your rating
              </p>
              <div style={{ justifyContent: 'center', display: 'flex' }}>
                <StarRating value={selectedRating} onChange={setSelectedRating} size="lg" />
              </div>
              {selectedRating > 0 && (
                <p style={{ marginTop: 12, color: 'var(--gold)', fontWeight: 600, fontSize: 16 }}>
                  {['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent'][selectedRating]}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setRatingModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={submitRating} disabled={submitting || !selectedRating}>
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStores;
