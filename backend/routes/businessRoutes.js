const express = require('express');
const router = express.Router();
const { createBusiness, getMyBusinesses } = require('../controllers/businessController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBusiness);
router.get('/', protect, getMyBusinesses);

module.exports = router;
