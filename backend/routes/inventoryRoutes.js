const express = require('express');
const router = express.Router();
const { addInventory, getInventory } = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addInventory);
router.get('/:businessId', protect, getInventory);

module.exports = router;
