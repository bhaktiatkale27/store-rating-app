const router = require('express').Router();
const {
  getDashboardStats,
  getUsers,
  getUserById,
  createUser,
  getStores,
  createStore
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { registerValidation, storeValidation } = require('../middleware/validation');

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', registerValidation, createUser);
router.get('/stores', getStores);
router.post('/stores', storeValidation, createStore);

module.exports = router;
