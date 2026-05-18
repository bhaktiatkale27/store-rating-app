const router = require('express').Router();
const { getStores, submitRating } = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/auth');
const { ratingValidation } = require('../middleware/validation');

router.use(authenticate, authorize('user'));

router.get('/', getStores);
router.post('/:storeId/ratings', ratingValidation, submitRating);
router.put('/:storeId/ratings', ratingValidation, submitRating);

module.exports = router;
