const router = require('express').Router();
const { register, login, updatePassword, getProfile } = require('../controllers/authController');
const { registerValidation, loginValidation, passwordUpdateValidation } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', authenticate, getProfile);
router.put('/update-password', authenticate, passwordUpdateValidation, updatePassword);

module.exports = router;
