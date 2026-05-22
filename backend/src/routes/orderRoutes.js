const express = require('express');
const { body, param } = require('express-validator');
const orderController = require('../controllers/orderController');
const validateRequest = require('../middleware/validateRequest');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/',
  protect,
  authorizeRoles('customer'),
  [body('restaurantId').isMongoId(), body('deliveryAddress').notEmpty(), validateRequest],
  orderController.createOrderFromCart
);

router.get('/restaurant/:restaurantId', protect, authorizeRoles('restaurantOwner', 'admin'), orderController.getRestaurantOrders);
router.get('/partner/me', protect, authorizeRoles('deliveryPartner'), orderController.getPartnerOrders);
router.get('/admin/daily-stats', protect, authorizeRoles('admin'), orderController.getDailyStats);
router.get('/my-orders', protect, authorizeRoles('customer', 'restaurantOwner', 'admin', 'deliveryPartner'), orderController.getMyOrders);
router.get('/:id', protect, authorizeRoles('customer', 'restaurantOwner', 'admin', 'deliveryPartner'), [param('id').isMongoId(), validateRequest], orderController.getOrderById);
router.put('/:id/status', protect, authorizeRoles('restaurantOwner', 'deliveryPartner', 'admin'), orderController.updateOrderStatus);
router.patch('/:id/assign-delivery', protect, authorizeRoles('restaurantOwner', 'admin'), orderController.assignDeliveryPartner);

module.exports = router;
