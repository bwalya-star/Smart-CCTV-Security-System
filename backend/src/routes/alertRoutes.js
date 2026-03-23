const express = require('express');
const router = express.Router();
const { getAlerts, handleAlert } = require('../controllers/alertController');

router.get('/', getAlerts);
router.post('/', handleAlert);

module.exports = router;