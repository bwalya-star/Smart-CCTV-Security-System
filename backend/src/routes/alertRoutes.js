const express = require('express');
const {
	authenticateToken
} = require("../middleware/authMiddleware");
const {
    authenticateDeviceRequest
} = require("../middleware/deviceMiddleware");
const router = express.Router();
const {
    getAlerts,
    deleteAlerts,
    handleAlert,
    fetchAlerts,
    getEventTimeline
} = require('../controllers/alertController');

router.get(
    "/",
    authenticateToken,
    getAlerts
);
router.delete(
    "/",
    authenticateToken,
    deleteAlerts
);
router.get(
    "/timeline",
    authenticateToken,
    getEventTimeline
);
router.post(
    "/",
    authenticateDeviceRequest,
    handleAlert
);
router.get(
    "/fetch",
    authenticateToken,
    fetchAlerts
);

module.exports = router;