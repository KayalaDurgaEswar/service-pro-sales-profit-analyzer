const express = require('express');
const router = express.Router();
const { getSummary, downloadReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary/:businessId', protect, getSummary);
router.get('/download/:businessId', protect, downloadReport);

module.exports = router;
