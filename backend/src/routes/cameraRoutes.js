const express = require("express");

const {
    getCameraStatus,
    startRecording,
    stopRecording
} = require("../controllers/cameraController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();


router.get(
    "/status",
    authenticateToken,
    getCameraStatus
);


router.post(
    "/start",
    authenticateToken,
    startRecording
);


router.post(
    "/stop",
    authenticateToken,
    stopRecording
);


module.exports = router;