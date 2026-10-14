const {
    detectPerson
} = require("../services/aiService");

const {
    saveAlert,
    getAlertsByUser
} = require("../services/databaseService");
const db = require("../config/db");

const {
    sendNotification
} = require("../services/notificationService");


async function getAlerts(req, res) {

    try {

        const userId = req.user.id;

        const alerts =
            await getAlertsByUser(userId);

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

async function deleteAlerts(req, res) {
    const { ids } = req.body || {};

    if (!Array.isArray(ids) ||
        ids.length === 0 ||
        ids.length > 200 ||
        ids.some(id => !Number.isSafeInteger(id) || id < 1) ||
        new Set(ids).size !== ids.length) {
        return res.status(400).json({ error: "Provide a list of up to 200 unique valid alert IDs." });
    }

    try {
        const placeholders = ids.map(() => "?").join(", ");
        const [result] = await db.query(
            `DELETE FROM alerts WHERE user_id = ? AND id IN (${placeholders})`,
            [req.user.id, ...ids]
        );

        res.json({ deletedCount: result.affectedRows });
    } catch (error) {
        console.error("Unable to delete selected alerts:", error);
        res.status(500).json({ error: "Unable to delete selected alerts." });
    }
}


async function getEventTimeline(req, res) {

    try {

        const alerts =
            await getAlertsByUser(req.user.id);

        const timeline =
            alerts.map(alert => ({

                id: alert.id,

                timestamp:
                    alert.created_at,

                event_type:
                    alert.alert_classification ||
                    "SECURITY_EVENT",

                detected:
                    Boolean(alert.detected),

                confidence:
                    alert.confidence,

                identity:
                    alert.identity_name ||
                    "Unknown",

                identity_status:
                    alert.identity_status ||
                    "not_checked",

                face_similarity:
                    alert.face_similarity,

                severity:
                    alert.severity ||
                    "UNKNOWN",

                status:
                    alert.status,

                notification_sent:
                    Boolean(
                        alert.notification_sent
                    ),

                notification_status:
                    alert.notification_status ||
                    "not_required",

                notification_channel:
                    alert.notification_channel ||
                    null,

                image_path:
                    alert.image_path

            }));

        res.status(200).json({
            success: true,
            count: timeline.length,
            data: timeline
        });

    } catch (error) {

        console.error(
            "Error loading event timeline:",
            error
        );

        res.status(500).json({
            success: false,
            error:
                "Failed to load event timeline"
        });

    }

}


async function handleAlert(req, res) {

    try {

        const {
            imagePath
        } = req.body;

        console.log(
            "Alert received:",
            imagePath
        );

        // ==================================
        // DEVICE INFORMATION
        // ==================================

        const device = req.device;

        if (!device) {

            return res.status(401).json({
                error: "Unauthenticated CCTV device"
            });

        }

        const deviceId =
            device.id;

        const userId =
            device.user_id;

        console.log(
            "Device ID:",
            deviceId
        );

        console.log(
            "User ID:",
            userId
        );

        // ==================================
        // AI DETECTION
        // ==================================

        const result =
            await detectPerson(imagePath, userId);

        const detected =
            result.detected;

        const confidence =
            result.confidence || 0.0;

        const status =
            detected
                ? "threat"
                : "safe";

        const alertClassification =
            result.alert_classification ||
            "UNIDENTIFIED_PERSON";

        const severity =
            result.severity ||
            "MEDIUM";

        const faceRecognition =
            result.face_recognition || {
                performed: false,
                recognized: false,
                name: "not_checked",
                similarity: 0.0,
                identity_status: "not_checked"
            };

        console.log("--------------------------------");

        console.log(
            "Identity:",
            faceRecognition.name
        );

        console.log(
            "Identity status:",
            faceRecognition.identity_status
        );

        console.log(
            "Face similarity:",
            faceRecognition.similarity
        );

        console.log(
            "Alert classification:",
            alertClassification
        );

        console.log(
            "Severity:",
            severity
        );

        console.log("--------------------------------");

        const notificationResult =
            await sendNotification({
                image_path: imagePath,
                detected,
                confidence,
                status,
                identity_name: faceRecognition.name,
                face_similarity: faceRecognition.similarity,
                identity_status: faceRecognition.identity_status,
                alert_classification: alertClassification,
                severity
            });

        console.log(
            "Notification result:",
            notificationResult
        );

        const savedAlert = await saveAlert(
            imagePath,
            detected,
            confidence,
            status,
            faceRecognition.name,
            faceRecognition.similarity,
            faceRecognition.identity_status,
            alertClassification,
            severity,
            userId,
            deviceId,
            notificationResult.sent || false,
            notificationResult.notificationChannel || null,
            notificationResult.notificationStatus || "not_required"
        );

        console.log(
            "Alert and notification history saved to database."
        );

        // ==================================
        // REAL-TIME DASHBOARD UPDATE
        // ==================================

        const io =
            req.app.get("io");

        if (io) {

            io.to(
                `user_${userId}`
            ).emit(
                "new_alert",
                {

                    id:
                        savedAlert.insertId,

                    image_path:
                        imagePath,

                    detected,

                    confidence,

                    status,

                    label:
                        result.label ||
                        "unknown",

                    alert_classification:
                        alertClassification,

                    severity:
                        severity,

                    face_recognition:
                        faceRecognition,

                    notification_sent:
                        notificationResult.sent || false,

                    notification_channel:
                        notificationResult.notificationChannel || null,

                    notification_status:
                        notificationResult.notificationStatus ||
                        "not_required",

                    notification_required:
                        notificationResult.sent || false,

                    user_id:
                        userId,

                    device_id:
                        deviceId,

                    device_name:
                        device.device_name,

                    device_code:
                        device.device_code,

                    created_at:
                        new Date()

                }
            );

            console.log(
                "Real-time alert sent to dashboard."
            );
        }


        // ==================================
        // RESPONSE
        // ==================================

        let message;

        switch (alertClassification) {

            case "NO_PERSON":
                message = "No person detected";
                break;

            case "KNOWN_PERSON":
                message =
                    `Known person detected: ${faceRecognition.name}`;
                break;

            case "UNKNOWN_PERSON":
                message = "Unknown person detected";
                break;

            case "UNIDENTIFIED_PERSON":
                message = "Person detected but identity unavailable";
                break;

            default:
                message = "Security event detected";
        }

        res.status(200).json({

            message,

            data: result,

            notification:
                notificationResult,

            device: {

                id: deviceId,

                name:
                    device.device_name,

                code:
                    device.device_code

            }

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
            await getAlertsByUser(req.user.id);

        res.json(alerts);

    } catch (error) {

        console.error(
            "Backend Error in fetchAlerts:",
            error
        );

        res.status(500).json({
            error: error.message
        });
    }
}


module.exports = {
    getAlerts,
    deleteAlerts,
    handleAlert,
    fetchAlerts,
    getEventTimeline
};