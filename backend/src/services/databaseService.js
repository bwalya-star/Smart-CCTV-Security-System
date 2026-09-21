const db = require('../config/db');


// =====================================================
// SAVE ALERT
// =====================================================

async function saveAlert(
    imagePath,
    detected,
    confidence,
    status,
    identityName = null,
    faceSimilarity = null,
    identityStatus = null,
    alertClassification = null,
    severity = null,
    userId = null,
    deviceId = null,
    notificationSent = false,
    notificationChannel = null,
    notificationStatus = null
) {

    const query = `
        INSERT INTO alerts
        (
            image_path,
            detected,
            confidence,
            status,
            identity_name,
            face_similarity,
            identity_status,
            alert_classification,
            severity,
            user_id,
            device_id,
            notification_sent,
            notification_channel,
            notification_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;


    const [result] = await db.query(
        query,
        [
            imagePath,
            detected,
            confidence,
            status,
            identityName,
            faceSimilarity,
            identityStatus,
            alertClassification,
            severity,
            userId,
            deviceId,
            notificationSent,
            notificationChannel,
            notificationStatus
        ]
    );


    return result;
}


// =====================================================
// GET ALL ALERTS
// =====================================================

async function getAlerts() {

    const query = `
        SELECT *
        FROM alerts
        ORDER BY created_at DESC
    `;


    const [rows] = await db.query(query);


    return rows;
}


// =====================================================
// GET ALERTS FOR SPECIFIC USER
// =====================================================

async function getAlertsByUser(userId) {

    const query = `
        SELECT
            alerts.*,
            cctv_devices.device_name,
            cctv_devices.device_code
        FROM alerts
        LEFT JOIN cctv_devices
            ON alerts.device_id = cctv_devices.id
        WHERE alerts.user_id = ?
        ORDER BY alerts.created_at DESC
    `;


    const [rows] = await db.query(
        query,
        [userId]
    );


    return rows;
}


async function createUser(name, email, passwordHash) {

    const query = `
        INSERT INTO users
        (name, email, password_hash)
        VALUES (?, ?, ?)
    `;


    const [result] = await db.query(
        query,
        [name, email, passwordHash]
    );


    return result;
}


async function findUserByEmail(email) {

    const query = `
        SELECT id, name, email, password_hash, role, created_at
        FROM users
        WHERE email = ?
        LIMIT 1
    `;


    const [rows] = await db.query(
        query,
        [email]
    );


    return rows[0] || null;
}


async function getUserById(userId) {

    const query = `
        SELECT id, name, email, role, created_at
        FROM users
        WHERE id = ?
        LIMIT 1
    `;


    const [rows] = await db.query(
        query,
        [userId]
    );


    return rows[0] || null;
}


module.exports = {
    saveAlert,
    getAlerts,
    getAlertsByUser,
    createUser,
    findUserByEmail,
    getUserById
};