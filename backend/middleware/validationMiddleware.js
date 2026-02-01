const Joi = require('joi');

const validateRequest = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

const schemas = {
    register: Joi.object({
        name: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    }),
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),
    business: Joi.object({
        name: Joi.string().min(3).required(),
    }), // Added validation for business
    transaction: Joi.object({
        businessId: Joi.string().required(),
        type: Joi.string().valid('SALE', 'EXPENSE').required(), // Match mongoose model
        amount: Joi.number().positive().required(),
        category: Joi.string().required(),
        description: Joi.string().optional().allow(''),
        date: Joi.date().iso().required(),
    }),
    inventory: Joi.object({
        businessId: Joi.string().required(),
        itemName: Joi.string().required(),
        quantity: Joi.number().integer().min(0).required(),
        costPerUnit: Joi.number().min(0).required(),
        sellingPrice: Joi.number().min(0).required(),
    })
};

module.exports = { validateRequest, schemas };
