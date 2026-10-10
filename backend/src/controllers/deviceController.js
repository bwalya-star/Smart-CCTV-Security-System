const {
    getDevicesByUser,
    getDeviceById,
    createDevice,
    updateDeviceStatus,
    updateDeviceName,
    deleteDevice
} = require("../services/deviceService");

async function createUserDevice(req, res) {
    const userId = req.user.id;
    const { device_name, device_code, device_secret } = req.body;

    if ([device_name, device_code, device_secret].some(value => typeof value !== "string" || !value.trim())) {
        return res.status(400).json({ error: "Device name, code, and secret are required" });
    }

    const cleanedName = device_name.trim();
    const cleanedCode = device_code.trim();
    const cleanedSecret = device_secret.trim();

    if (cleanedName.length > 100 || cleanedCode.length > 100 || cleanedSecret.length > 255) {
        return res.status(400).json({ error: "Device name and code must be 100 characters or less; secret must be 255 characters or less" });
    }

    try {
        const deviceId = await createDevice(userId, cleanedName, cleanedCode, cleanedSecret);
        const device = await getDeviceById(deviceId, userId);
        return res.status(201).json({ message: "Device added", device });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "That device code or secret is already registered" });
        }
        console.error("Error creating device:", error);
        return res.status(500).json({ error: "Failed to add device" });
    }
}

async function removeUserDevice(req, res) {
    const userId = req.user.id;
    const deviceId = Number(req.params.id);

    if (!Number.isInteger(deviceId) || deviceId < 1) {
        return res.status(400).json({ error: "Invalid device ID" });
    }

    try {
        const result = await deleteDevice(deviceId, userId);
        if (!result.affectedRows) {
            return res.status(404).json({ error: "Device not found" });
        }
        return res.json({ message: "Device removed" });
    } catch (error) {
        console.error("Error removing device:", error);
        return res.status(500).json({ error: "Failed to remove device" });
    }
}


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
    renameDevice,
    createUserDevice,
    removeUserDevice
};