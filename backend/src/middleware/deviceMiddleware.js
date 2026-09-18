const {
    authenticateDevice
} = require("../services/deviceService");


async function authenticateDeviceRequest(
    req,
    res,
    next
) {

    try {

        const deviceCode =
            req.headers["x-device-code"];

        const deviceSecret =
            req.headers["x-device-secret"];


        if (
            !deviceCode ||
            !deviceSecret
        ) {

            return res.status(401).json({
                error: "Device credentials required"
            });

        }


        const device =
            await authenticateDevice(
                deviceCode,
                deviceSecret
            );


        if (!device) {

            return res.status(403).json({
                error: "Invalid or inactive device"
            });

        }


        // Store authenticated device
        req.device = device;


        console.log(
            "Authenticated CCTV device:",
            device.device_code
        );


        next();


    } catch (error) {

        console.error(
            "Device authentication error:",
            error
        );


        return res.status(500).json({
            error: "Device authentication failed"
        });

    }

}


module.exports = {
    authenticateDeviceRequest
};