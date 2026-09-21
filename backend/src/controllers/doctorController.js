const { Doctor } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

const listDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.findAll({ order: [['name', 'ASC']] });
  res.json({ doctors });
});

module.exports = { listDoctors };
