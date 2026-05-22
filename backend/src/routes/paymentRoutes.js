const express = require('express');
const { body, param } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const validateRequest = require('../middleware/validateRequest');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-order', protect, authorizeRoles('customer'), [body('orderId').isMongoId(), validateRequest], paymentController.createPaymentOrder);
router.post('/verify', protect, authorizeRoles('customer', 'admin', 'restaurantOwner', 'deliveryPartner'), paymentController.verifyPayment);
router.get('/:orderId', protect, [param('orderId').isMongoId(), validateRequest], paymentController.getPaymentStatus);

module.exports = router;
