const express = require('express');
const router = express.Router();
const { getSalesForecast, getInventoryAnalytics, getNetSalesAnalytics, getTopSellingItems, getProductAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/forecast/:businessId', protect, getSalesForecast);
router.get('/inventory/:businessId', protect, getInventoryAnalytics);
router.get('/sales/:businessId', protect, getNetSalesAnalytics);
router.get('/top-items/:businessId', protect, getTopSellingItems);
router.get('/product/:businessId/:productId', protect, getProductAnalytics);

module.exports = router;
