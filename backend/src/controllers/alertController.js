const { detectPerson } = require('../services/aiService');
const {
    saveAlert,
    getAlerts: getAlertsFromDB
} = require('../services/databaseService');


// Get all alerts
async function getAlerts(req, res) {
    try {

        const alerts = await getAlertsFromDB();

        res.json(alerts);

    } catch (error) {

        console.error(
            "Backend Error in getAlerts:",
            error
        );

        res.status(500).json({
            error: error.message
        });
    }
}


// Handle a new security alert
async function handleAlert(req, res) {

    try {

        const { imagePath } = req.body;

        console.log(
            "Alert received:",
            imagePath
        );


        // ==============================
        // AI DETECTION
        // ==============================

        const result = await detectPerson(imagePath);

        const detected = result.detected;

        const confidence =
            result.confidence;

        const status =
            result.status || (
                detected
                    ? "threat"
                    : "safe"
            );


        // ==============================
        // SAVE TO DATABASE
        // ==============================

        await saveAlert(
            imagePath,
            detected,
            confidence,
            status
        );


        // ==============================
        // REAL-TIME DASHBOARD UPDATE
        // ==============================

        const io = req.app.get("io");

        if (io) {

            io.emit("new_alert", {

                image_path: imagePath,

                detected: detected,

                confidence: confidence,

                status: status,

                label:
                    result.label ||
                    "unknown",

                detections:
                    result.detections ||
                    [],

                created_at:
                    new Date()

            });

            console.log(
                "Real-time alert sent to dashboard."
            );
        }


        // ==============================
        // RESPONSE TO PYTHON BRIDGE
        // ==============================

        res.status(200).json({

            message: detected
                ? "Person detected"
                : "No threat",

            data: result

        });


    } catch (error) {

        console.error(
            "Error processing alert:",
            error
        );

        res.status(500).json({
            error: "Server error"
        });
    }
}


// Fetch alerts
async function fetchAlerts(req, res) {

    try {

        const alerts =
            await getAlertsFromDB();

        res.json(alerts);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });
    }
}


module.exports = {
    getAlerts,
    handleAlert,
    fetchAlerts
};