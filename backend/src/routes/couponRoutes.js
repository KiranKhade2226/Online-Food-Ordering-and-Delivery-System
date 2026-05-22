const express = require('express');
const { body } = require('express-validator');
const couponController = require('../controllers/couponController');
const validateRequest = require('../middleware/validateRequest');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, authorizeRoles('admin'), couponController.getCoupons);
router.post('/', protect, authorizeRoles('admin'), [body('code').notEmpty(), body('discountValue').isNumeric(), body('expiry').isISO8601(), validateRequest], couponController.createCoupon);
router.get('/:code/validate', couponController.validateCoupon);

module.exports = router;
