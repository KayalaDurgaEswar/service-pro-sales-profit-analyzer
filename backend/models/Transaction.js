const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
    },
    type: {
        type: String,
        enum: ['SALE', 'EXPENSE'],
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    // Optional fields for tracking Sales against Inventory
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory',
        required: function () { return this.type === 'SALE'; }
    },
    quantity: {
        type: Number,
        default: 1,
    },
    cogs: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Transaction', transactionSchema);
