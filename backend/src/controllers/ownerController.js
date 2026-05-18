const pool = require('../config/db');

const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const [stores] = await pool.execute(
      'SELECT id, name FROM stores WHERE owner_id = ?',
      [ownerId]
    );

    if (stores.length === 0) {
      return res.json({ store: null, avg_rating: 0, ratings: [] });
    }

    const store = stores[0];

    const [[{ avg_rating, total_ratings }]] = await pool.execute(
      'SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total_ratings FROM ratings WHERE store_id = ?',
      [store.id]
    );

    const [ratings] = await pool.execute(`
      SELECT r.id, r.rating, r.created_at, r.updated_at,
        u.name as user_name, u.email as user_email
      FROM ratings r
      JOIN users u ON u.id = r.user_id
      WHERE r.store_id = ?
      ORDER BY r.updated_at DESC
    `, [store.id]);

    res.json({
      store,
      avg_rating: parseFloat(avg_rating).toFixed(1),
      total_ratings,
      ratings
    });
  } catch (error) {
    console.error('Owner dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getOwnerDashboard };
