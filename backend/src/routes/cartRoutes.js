const express = require('express');
const { body, param } = require('express-validator');
const cartController = require('../controllers/cartController');
const validateRequest = require('../middleware/validateRequest');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, authorizeRoles('customer'), cartController.getCart);
router.post('/', protect, authorizeRoles('customer'), [body('foodItemId').isMongoId(), body('restaurantId').isMongoId(), body('name').notEmpty(), body('price').isNumeric(), validateRequest], cartController.addItem);
router.patch('/:itemId', protect, authorizeRoles('customer'), [param('itemId').isMongoId(), body('quantity').isInt({ min: 1 }), validateRequest], cartController.updateItemQuantity);
router.delete('/:itemId', protect, authorizeRoles('customer'), cartController.removeItem);
router.delete('/', protect, authorizeRoles('customer'), cartController.clearCart);

module.exports = router;
