const express = require('express');
const { pullAppointments, pushAppointments } = require('../controllers/syncController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/appointments', authMiddleware, pullAppointments);
router.post('/appointments', authMiddleware, pushAppointments);

module.exports = router;
