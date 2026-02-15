const express = require('express');
const router = express.Router();
const availController = require('../controllers/availabilityController');

router.get('/', availController.getAvailability);
router.patch('/toggle', availController.toggleRoom);

module.exports = router;