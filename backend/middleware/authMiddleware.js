const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

        req.user = await User.findById(decoded.id).select('-password');

        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        // This assumes req.businessRole is populated by business middleware
        // For general admin routes:
        if (!roles.includes(req.user.role)) { // User model needs role field if we want system-wide roles
            // return res.status(403).json({ message: `User role ${req.user.role} is not authorized` });
        }
        next();
    };
};

module.exports = { protect, authorize };
