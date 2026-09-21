const {
    getDevicesByUser,
    getDeviceById,
    updateDeviceStatus,
    updateDeviceName
} = require("../services/deviceService");


async function getUserDevices(req, res) {

    try {

        const userId =
            req.user.id;

        const devices =
            await getDevicesByUser(userId);

        res.json(devices);

    } catch (error) {

        console.error(
            "Error getting user devices:",
            error
        );

        res.status(500).json({
            error: "Failed to retrieve devices"
        });

    }

}


async function getSingleDevice(req, res) {

    try {

        const userId =
            req.user.id;

        const deviceId =
            Number(req.params.id);


        if (
            Number.isNaN(deviceId)
        ) {

            return res.status(400).json({
                error: "Invalid device ID"
            });

        }


        const device =
            await getDeviceById(
                deviceId,
                userId
            );


        if (!device) {

            return res.status(404).json({
                error: "Device not found"
            });

        }


        res.json(device);

    } catch (error) {

        console.error(
            "Error getting device:",
            error
        );

        res.status(500).json({
            error: "Failed to retrieve device"
        });

    }

}


async function changeDeviceStatus(req, res) {

    try {

        const userId = req.user.id;

        const deviceId =
            Number(req.params.id);

        const {
            is_active
        } = req.body;

        if (Number.isNaN(deviceId)) {

            return res.status(400).json({
                error: "Invalid device ID"
            });

        }

        if (
            typeof is_active !==
            "boolean"
        ) {

            return res.status(400).json({
                error:
                    "is_active must be true or false"
            });

        }

        const device =
            await getDeviceById(
                deviceId,
                userId
            );

        if (!device) {

            return res.status(404).json({
                error: "Device not found"
            });

        }

        await updateDeviceStatus(
            deviceId,
            userId,
            is_active
        );

        const updatedDevice =
            await getDeviceById(
                deviceId,
                userId
            );

        res.json({
            message:
                is_active
                    ? "Device activated"
                    : "Device deactivated",

            device: updatedDevice
        });

    } catch (error) {

        console.error(
            "Error changing device status:",
            error
        );

        res.status(500).json({
            error:
                "Failed to update device status"
        });

    }

}


async function renameDevice(req, res) {

    try {

        const userId = req.user.id;

        const deviceId =
            Number(req.params.id);

        const {
            device_name
        } = req.body;

        if (Number.isNaN(deviceId)) {

            return res.status(400).json({
                error: "Invalid device ID"
            });

        }

        if (
            typeof device_name !==
                "string" ||
            !device_name.trim()
        ) {

            return res.status(400).json({
                error:
                    "Device name is required"
            });

        }

        const cleanedName =
            device_name.trim();

        if (cleanedName.length > 100) {

            return res.status(400).json({
                error:
                    "Device name must be 100 characters or less"
            });

        }

        const device =
            await getDeviceById(
                deviceId,
                userId
            );

        if (!device) {

            return res.status(404).json({
                error: "Device not found"
            });

        }

        await updateDeviceName(
            deviceId,
            userId,
            cleanedName
        );

        const updatedDevice =
            await getDeviceById(
                deviceId,
                userId
            );

        res.json({
            message:
                "Device name updated",

            device: updatedDevice
        });

    } catch (error) {

        console.error(
            "Error renaming device:",
            error
        );

        res.status(500).json({
            error:
                "Failed to rename device"
        });

    }

}


module.exports = {
    getUserDevices,
    getSingleDevice,
    changeDeviceStatus,
    renameDevice
};