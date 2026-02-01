const Business = require('../models/Business');

// @desc    Create new business
// @route   POST /api/business
// @access  Private
const createBusiness = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Please add a business name' });
    }

    const business = await Business.create({
        name,
        ownerId: req.user.id,
    });

    res.status(201).json(business);
};

// @desc    Get user businesses
// @route   GET /api/business
// @access  Private
const getMyBusinesses = async (req, res) => {
    const businesses = await Business.find({ ownerId: req.user.id });
    res.json(businesses);
};

module.exports = {
    createBusiness,
    getMyBusinesses,
};
