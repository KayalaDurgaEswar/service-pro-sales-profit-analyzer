const Inventory = require('../models/Inventory');

// @desc    Add inventory item
// @route   POST /api/inventory
// @access  Private
const addInventory = async (req, res) => {
    const { businessId, name, costPrice, sellingPrice, stock, description } = req.body;

    if (!businessId || !name || !costPrice || !sellingPrice || stock === undefined) {
        return res.status(400).json({ message: 'Please add all required fields' });
    }

    // Check if product exists
    const existingItem = await Inventory.findOne({ businessId, name });

    if (existingItem) {
        existingItem.stock += Number(stock);
        existingItem.costPrice = costPrice;
        existingItem.sellingPrice = sellingPrice;
        existingItem.description = description || existingItem.description;
        await existingItem.save();
        return res.status(200).json(existingItem);
    }

    const inventory = await Inventory.create({
        businessId,
        name,
        costPrice,
        sellingPrice,
        stock,
        description
    });

    res.status(201).json(inventory);
};

// @desc    Get inventory
// @route   GET /api/inventory/:businessId
// @access  Private
const getInventory = async (req, res) => {
    const { businessId } = req.params;
    const inventory = await Inventory.find({ businessId });
    res.json(inventory);
};

module.exports = {
    addInventory,
    getInventory,
};
