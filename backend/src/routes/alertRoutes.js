const express = require('express');
const router = express.Router();
const { getAlerts, handleAlert, fetchAlerts } = require('../controllers/alertController');

router.get('/', getAlerts);
router.post('/', handleAlert);
router.get('/fetch', fetchAlerts);

module.exports = router;