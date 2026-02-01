const Transaction = require('../models/Transaction');
const ExcelJS = require('exceljs');

// Helper to calculate profit
const calculateSummary = (transactions) => {
    let totalSales = 0;
    let totalExpenses = 0;
    let totalCOGS = 0;

    transactions.forEach((txn) => {
        if (txn.type === 'SALE') {
            totalSales += txn.amount;
            totalCOGS += txn.cogs || 0;
        } else if (txn.type === 'EXPENSE') {
            totalExpenses += txn.amount;
        }
    });

    const profit = totalSales - totalExpenses - totalCOGS;

    return { totalSales, totalExpenses, totalCOGS, profit };
};

// @desc    Get profit summary
// @route   GET /api/reports/summary/:businessId
// @access  Private
const getSummary = async (req, res) => {
    const { businessId } = req.params;
    const { period } = req.query; // 'daily', 'weekly', 'monthly'

    let query = { businessId };
    const now = new Date();
    let startDate = new Date();

    if (period === 'daily') {
        startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
        startDate.setDate(now.getDate() - 7);
    } else if (period === 'monthly') {
        startDate.setMonth(now.getMonth() - 1);
    }

    query.date = { $gte: startDate };

    const transactions = await Transaction.find(query);
    const summary = calculateSummary(transactions);

    // Also group by date for charts
    // This is a simple aggregation (e.g. by day)
    // For simplicity, we just return the total summary and let frontend aggregate for charts if needed,
    // OR we can return a time series.
    // The Prompt asks for "Bar chart: Sales vs Expenses", "Line chart: Profit over time".
    // Let's provide a daily breakdown for the period.

    // Aggregate by day
    const dailyData = {};
    transactions.forEach(txn => {
        const day = txn.date.toISOString().split('T')[0];
        if (!dailyData[day]) dailyData[day] = { date: day, sales: 0, expenses: 0, cogs: 0, profit: 0 };

        if (txn.type === 'SALE') {
            dailyData[day].sales += txn.amount;
            dailyData[day].cogs += (txn.cogs || 0);
        } else {
            dailyData[day].expenses += txn.amount;
        }
        dailyData[day].profit = dailyData[day].sales - dailyData[day].expenses - dailyData[day].cogs;
    });

    res.json({ periodSummary: summary, chartData: Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date)) });
};

// @desc    Download Excel report
// @route   GET /api/reports/download/:businessId
// @access  Private
const downloadReport = async (req, res) => {
    const { businessId } = req.params;
    const transactions = await Transaction.find({ businessId }).sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');

    worksheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Type', key: 'type', width: 10 },
        { header: 'Category', key: 'category', width: 15 },
        { header: 'Product', key: 'productName', width: 15 },
        { header: 'Quantity', key: 'quantity', width: 10 },
        { header: 'Amount', key: 'amount', width: 10 },
        { header: 'COGS', key: 'cogs', width: 10 },
    ];

    transactions.forEach((txn) => {
        worksheet.addRow({
            date: txn.date.toISOString().split('T')[0],
            type: txn.type,
            category: txn.category,
            productName: txn.productName || '-',
            quantity: txn.quantity || '-',
            amount: txn.amount,
            cogs: txn.cogs || 0,
        });
    });

    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=report.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
};

module.exports = {
    getSummary,
    downloadReport,
};
