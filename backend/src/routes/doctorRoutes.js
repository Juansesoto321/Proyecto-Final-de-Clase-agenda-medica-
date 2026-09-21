const express = require('express');
const { listDoctors } = require('../controllers/doctorController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, listDoctors);

module.exports = router;
