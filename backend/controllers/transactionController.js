const Transaction = require('../models/Transaction');
const Inventory = require('../models/Inventory');

// @desc    Add new transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
    const { businessId, type, category, amount, date, productId, quantity } = req.body;

    if (!businessId || !type || !category || !amount) {
        return res.status(400).json({ message: 'Please add all required fields' });
    }

    let cogs = 0;

    // If SALE, handle inventory updates and calculate COGS
    if (type === 'SALE' && productId) {
        const inventoryItem = await Inventory.findById(productId);

        if (inventoryItem) {
            if (inventoryItem.stock < (quantity || 1)) {
                return res.status(400).json({ message: 'Insufficient inventory' });
            }
            inventoryItem.stock -= (quantity || 1);
            cogs = inventoryItem.costPrice * (quantity || 1);
            await inventoryItem.save();
        } else {
            return res.status(400).json({ message: 'Product not found in inventory. Please add it first.' });
        }
    }

    const transaction = await Transaction.create({
        businessId,
        type,
        category,
        amount,
        date: date || Date.now(),
        productId,
        quantity,
        cogs
    });

    res.status(201).json(transaction);
};

// @desc    Get transactions
// @route   GET /api/transactions/:businessId
// @access  Private
const getTransactions = async (req, res) => {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;

    let query = { businessId };

    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        };
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    res.json(transactions);
};

module.exports = {
    addTransaction,
    getTransactions,
};
