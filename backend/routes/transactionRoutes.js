const express = require('express');
const router = express.Router();
const { addTransaction, getTransactions } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addTransaction);
router.get('/:businessId', protect, getTransactions);

module.exports = router;
