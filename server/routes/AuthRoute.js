const express = require('express');
const router = express.Router();
const { signup, login, refreshToken, logoutUser } = require('../controllers/AuthController');

router.post('/signup', signup);

router.post('/login', login);

router.get('/refresh-token', refreshToken);

router.get('/logout', logoutUser);

module.exports = router;