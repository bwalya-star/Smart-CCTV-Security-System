const express = require("express");

const {
    getCameraStatus,
    startRecording,
    stopRecording,
    listRecordings,
    deleteRecordings,
    getRecordingSchedule,
    updateRecordingSchedule,
    getMotionSettings,
    updateMotionSettings
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

router.get(
    "/recordings",
    authenticateToken,
    listRecordings
);
router.delete(
    "/recordings",
    authenticateToken,
    deleteRecordings
);

router.get(
    "/schedule",
    authenticateToken,
    getRecordingSchedule
);

router.put(
    "/schedule",
    authenticateToken,
    updateRecordingSchedule
);

router.get(
    "/motion",
    authenticateToken,
    getMotionSettings
);

router.put(
    "/motion",
    authenticateToken,
    updateMotionSettings
);


module.exports = router;