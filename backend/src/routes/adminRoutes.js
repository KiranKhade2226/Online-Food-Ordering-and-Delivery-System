const express = require('express');
const adminController = require('../controllers/adminController');
const { verifyJWT, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyJWT, authorizeRole('admin'));

router.get('/users', adminController.getUsers);
router.get('/restaurants', adminController.getRestaurants);
router.put('/restaurants/:id/approve', adminController.updateRestaurantApproval);
router.get('/orders', adminController.getOrders);
router.get('/stats', adminController.getDashboardStats);
router.delete('/users/:id', adminController.deleteUser);
router.delete('/user/:id', adminController.deleteUser);

module.exports = router;
