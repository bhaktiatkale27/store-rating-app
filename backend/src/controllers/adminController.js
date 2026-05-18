const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.execute(
      "SELECT COUNT(*) as totalUsers FROM users WHERE role != 'admin'"
    );
    const [[{ totalStores }]] = await pool.execute('SELECT COUNT(*) as totalStores FROM stores');
    const [[{ totalRatings }]] = await pool.execute('SELECT COUNT(*) as totalRatings FROM ratings');

    res.json({ totalUsers, totalStores, totalRatings });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const allowedSortFields = ['name', 'email', 'address', 'role', 'created_at'];
    const allowedSortOrders = ['ASC', 'DESC'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
        COALESCE(AVG(r.rating), 0) as avg_rating
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (name) { query += ' AND u.name LIKE ?'; params.push(`%${name}%`); }
    if (email) { query += ' AND u.email LIKE ?'; params.push(`%${email}%`); }
    if (address) { query += ' AND u.address LIKE ?'; params.push(`%${address}%`); }
    if (role) { query += ' AND u.role = ?'; params.push(role); }

    query += ` GROUP BY u.id ORDER BY u.${safeSortBy} ${safeSortOrder}`;

    const [users] = await pool.execute(query, params);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(`
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
        s.id as store_id, s.name as store_name,
        COALESCE(AVG(r.rating), 0) as avg_rating
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE u.id = ?
      GROUP BY u.id
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!['admin', 'user', 'store_owner'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address || null, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const allowedSortFields = ['name', 'email', 'address', 'avg_rating'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id,
        u.name as owner_name,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN users u ON u.id = s.owner_id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (name) { query += ' AND s.name LIKE ?'; params.push(`%${name}%`); }
    if (email) { query += ' AND s.email LIKE ?'; params.push(`%${email}%`); }
    if (address) { query += ' AND s.address LIKE ?'; params.push(`%${address}%`); }

    query += ` GROUP BY s.id ORDER BY ${safeSortBy === 'avg_rating' ? 'avg_rating' : `s.${safeSortBy}`} ${safeSortOrder}`;

    const [stores] = await pool.execute(query, params);
    res.json(stores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    const [existing] = await pool.execute('SELECT id FROM stores WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Store email already exists' });
    }

    if (owner_id) {
      const [owner] = await pool.execute(
        "SELECT id FROM users WHERE id = ? AND role = 'store_owner'",
        [owner_id]
      );
      if (owner.length === 0) {
        return res.status(400).json({ message: 'Invalid store owner' });
      }
    }

    const [result] = await pool.execute(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address || null, owner_id || null]
    );

    res.status(201).json({
      message: 'Store created successfully',
      storeId: result.insertId
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getUserById,
  createUser,
  getStores,
  createStore
};
