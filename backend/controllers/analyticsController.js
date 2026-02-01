const Transaction = require('../models/Transaction');
const ss = require('simple-statistics');
const Inventory = require('../models/Inventory');

// @desc    Get Sales Forecast for next 7 days
// @route   GET /api/analytics/forecast/:businessId
// @access  Private (Owner/Editor)
const getSalesForecast = async (req, res) => {
    const { businessId } = req.params;

    try {
        // 1. Get daily sales for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const salesData = await Transaction.aggregate([
            {
                $match: {
                    businessId: new mongoose.Types.ObjectId(businessId),
                    type: 'SALE',
                    date: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    totalSales: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        if (salesData.length < 5) {
            return res.status(200).json({
                success: true,
                message: 'Not enough data for forecast',
                forecast: []
            });
        }

        // 2. Prepare data for regression [[dayIndex, salesAmount]]
        const regressionData = salesData.map((day, index) => [index, day.totalSales]);

        // 3. Calculate Linear Regression
        const line = ss.linearRegression(regressionData);
        const lineFunc = ss.linearRegressionLine(line);
        const rSquared = ss.rSquared(regressionData, lineFunc);

        // 4. Predict next 7 days
        const forecast = [];
        const lastDayIndex = salesData.length - 1;

        for (let i = 1; i <= 7; i++) {
            const nextIndex = lastDayIndex + i;
            const predictedAmount = Math.max(0, lineFunc(nextIndex)); // No negative sales

            const nextDate = new Date();
            nextDate.setDate(new Date().getDate() + i);

            forecast.push({
                date: nextDate.toISOString().split('T')[0],
                predictedAmount,
                confidence: rSquared // Return R^2 as confidence metric
            });
        }

        res.status(200).json({
            success: true,
            trend: line.m > 0 ? 'UP' : 'DOWN',
            rSquared,
            forecast
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Analytics Error' });
    }
};

// @desc    Get Inventory Analytics (Top Stock)
// @route   GET /api/analytics/inventory/:businessId
// @access  Private
const getInventoryAnalytics = async (req, res) => {
    const { businessId } = req.params;

    try {
        const inventory = await Inventory.find({ businessId }).sort({ stock: 1 }).limit(10);
        res.status(200).json(inventory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Inventory Analytics Error' });
    }
};

// @desc    Get Net Sales Analytics
// @route   GET /api/analytics/sales/:businessId?range=year
// @access  Private
const getNetSalesAnalytics = async (req, res) => {
    const { businessId } = req.params;
    const { range } = req.query; // 'week', 'month', 'year', '3years', '5years', '10years'

    try {
        let startDate = new Date();
        let groupBy = {};

        switch (range) {
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                groupBy = { $dateToString: { format: "%Y-%m", date: "$date" } };
                break;
            case '3years':
                startDate.setFullYear(startDate.getFullYear() - 3);
                groupBy = { $dateToString: { format: "%Y", date: "$date" } };
                break;
            case '5years':
                startDate.setFullYear(startDate.getFullYear() - 5);
                groupBy = { $dateToString: { format: "%Y", date: "$date" } };
                break;
            case '10years':
                startDate.setFullYear(startDate.getFullYear() - 10);
                groupBy = { $dateToString: { format: "%Y", date: "$date" } };
                break;
            default:
                startDate.setFullYear(startDate.getFullYear() - 1);
                groupBy = { $dateToString: { format: "%Y-%m", date: "$date" } };
        }

        const sales = await Transaction.aggregate([
            {
                $match: {
                    businessId: new mongoose.Types.ObjectId(businessId),
                    type: 'SALE',
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    totalSales: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json(sales);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sales Analytics Error' });
    }
};

// @desc    Get Top Selling Items
// @route   GET /api/analytics/top-items/:businessId
// @access  Private
const getTopSellingItems = async (req, res) => {
    const { businessId } = req.params;

    try {
        const topItems = await Transaction.aggregate([
            {
                $match: {
                    businessId: new mongoose.Types.ObjectId(businessId),
                    type: 'SALE',
                    productId: { $exists: true }
                }
            },
            {
                $lookup: {
                    from: "inventories",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $group: {
                    _id: "$product._id",
                    name: { $first: "$product.name" },
                    totalQuantity: { $sum: "$quantity" },
                    totalRevenue: { $sum: "$amount" }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 3 }
        ]);

        res.status(200).json(topItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Top Items Analytics Error' });
    }
};

const mongoose = require('mongoose');


// @desc    Get Product Analytics (Daily Sales for last 30 days)
// @route   GET /api/analytics/product/:businessId/:productId
// @access  Private
const getProductAnalytics = async (req, res) => {
    const { businessId, productId } = req.params;

    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sales = await Transaction.aggregate([
            {
                $match: {
                    businessId: new mongoose.Types.ObjectId(businessId),
                    type: 'SALE',
                    productId: new mongoose.Types.ObjectId(productId),
                    date: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    totalQuantity: { $sum: "$quantity" },
                    totalRevenue: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get product details for context
        const product = await Inventory.findById(productId);

        res.status(200).json({
            sales,
            product: {
                name: product.name,
                stock: product.stock,
                sellingPrice: product.sellingPrice
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Product Analytics Error' });
    }
};

module.exports = { getSalesForecast, getInventoryAnalytics, getNetSalesAnalytics, getTopSellingItems, getProductAnalytics };
