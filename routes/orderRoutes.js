const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/AuthMiddleware');
const OrdersController = require('../controllers/OrdersController');

router.put('/delivered/:id', authMiddleware, authorize('ADMIN'), OrdersController.orderDelivered);

router.get('/shop', authMiddleware, authorize('SHOP'), OrdersController.getOrderByShop);

router.get('/recents', authMiddleware, authorize('ADMIN'), OrdersController.getRecentOrders);

router.get('/stats', authMiddleware, authorize('ADMIN'), OrdersController.getDashboardStats);

router.get('/stats/shop', authMiddleware, authorize('SHOP'), OrdersController.getShopStats);

router.get('/all', authMiddleware, authorize('ADMIN'), OrdersController.getAllOrders);

router.get('/:id', authMiddleware, OrdersController.getOrderDetail);

router.get('/', authMiddleware, OrdersController.getUserOrders);

router.post('/', authMiddleware, OrdersController.createOrder);

module.exports = router;