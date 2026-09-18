const express = require("express");

const {
    getUserDevices,
    getSingleDevice,
    changeDeviceStatus,
    renameDevice
} = require("../controllers/deviceController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();


router.get(
    "/",
    authenticateToken,
    getUserDevices
);


router.get(
    "/:id",
    authenticateToken,
    getSingleDevice
);


router.patch(
    "/:id/status",
    authenticateToken,
    changeDeviceStatus
);


router.patch(
    "/:id/name",
    authenticateToken,
    renameDevice
);


module.exports = router;