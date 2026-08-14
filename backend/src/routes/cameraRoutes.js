const express = require("express");

const {
    getCameraStatus,
    startRecording,
    stopRecording
} = require("../controllers/cameraController");

const router = express.Router();


router.get(
    "/status",
    getCameraStatus
);


router.post(
    "/start",
    startRecording
);


router.post(
    "/stop",
    stopRecording
);


module.exports = router;