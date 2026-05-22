const express = require('express');
const { body, param } = require('express-validator');
const deliveryController = require('../controllers/deliveryController');
const validateRequest = require('../middleware/validateRequest');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorizeRoles('deliveryPartner', 'admin'));

router.get('/orders/available', deliveryController.getAvailableOrders);
router.get('/orders/me', deliveryController.getMyDeliveries);
router.patch('/orders/:orderId/accept', [param('orderId').isMongoId(), validateRequest], deliveryController.acceptDelivery);
router.patch('/orders/:orderId/reject', [param('orderId').isMongoId(), validateRequest], deliveryController.rejectDelivery);
router.patch('/orders/:orderId/status', [param('orderId').isMongoId(), body('status').notEmpty(), validateRequest], deliveryController.updateDeliveryStatus);

module.exports = router;