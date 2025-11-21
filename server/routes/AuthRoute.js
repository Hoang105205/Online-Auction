const express = require('express');
const router = express.Router();
const { signup, login, refreshToken } = require('../controllers/AuthController');

router.post('/signup', signup);

router.post('/login', login);

router.get('/refresh-token', refreshToken);

module.exports = router;