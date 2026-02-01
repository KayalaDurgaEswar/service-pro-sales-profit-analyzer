const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest, schemas } = require('../middleware/validationMiddleware');

router.post('/register', validateRequest(schemas.register), registerUser);
router.post('/login', validateRequest(schemas.login), loginUser);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

module.exports = router;
