const express = require("express");

const {
    getUserDevices,
    getSingleDevice,
    changeDeviceStatus,
    renameDevice,
    createUserDevice,
    removeUserDevice
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

router.post(
    "/",
    authenticateToken,
    createUserDevice
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

router.delete(
    "/:id",
    authenticateToken,
    removeUserDevice
);


router.patch(
    "/:id/name",
    authenticateToken,
    renameDevice
);


module.exports = router;