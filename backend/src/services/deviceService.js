const db = require("../config/db");


async function authenticateDevice(
    deviceCode,
    deviceSecret
) {

    const query = `
        SELECT
            id,
            user_id,
            device_name,
            device_code,
            is_active
        FROM cctv_devices
        WHERE device_code = ?
        AND device_secret = ?
        LIMIT 1
    `;


    const [rows] = await db.query(
        query,
        [
            deviceCode,
            deviceSecret
        ]
    );


    if (rows.length === 0) {

        return null;

    }


    const device = rows[0];


    if (!device.is_active) {

        return null;

    }


    return device;
}


async function getDevicesByUser(userId) {

    const query = `
        SELECT
            id,
            user_id,
            device_name,
            device_code,
            is_active,
            created_at,
            updated_at
        FROM cctv_devices
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;


    const [rows] = await db.query(
        query,
        [userId]
    );


    return rows;
}


async function getDeviceById(
    deviceId,
    userId
) {

    const query = `
        SELECT
            id,
            user_id,
            device_name,
            device_code,
            is_active,
            created_at,
            updated_at
        FROM cctv_devices
        WHERE id = ?
        AND user_id = ?
        LIMIT 1
    `;


    const [rows] = await db.query(
        query,
        [
            deviceId,
            userId
        ]
    );


    return rows.length > 0
        ? rows[0]
        : null;
}

async function createDevice(userId, deviceName, deviceCode, deviceSecret) {
    const query = `
        INSERT INTO cctv_devices (
            user_id,
            device_name,
            device_code,
            device_secret,
            is_active
        )
        VALUES (?, ?, ?, ?, 1)
    `;

    const [result] = await db.query(query, [
        userId,
        deviceName,
        deviceCode,
        deviceSecret
    ]);

    return result.insertId;
}


async function updateDeviceStatus(
    deviceId,
    userId,
    isActive
) {

    const query = `
        UPDATE cctv_devices
        SET
            is_active = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        AND user_id = ?
    `;


    const [result] = await db.query(
        query,
        [
            isActive ? 1 : 0,
            deviceId,
            userId
        ]
    );


    return result;
}


async function updateDeviceName(
    deviceId,
    userId,
    deviceName
) {

    const query = `
        UPDATE cctv_devices
        SET
            device_name = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        AND user_id = ?
    `;


    const [result] = await db.query(
        query,
        [
            deviceName,
            deviceId,
            userId
        ]
    );


    return result;
}

async function deleteDevice(deviceId, userId) {
    const [result] = await db.query(
        `DELETE FROM cctv_devices WHERE id = ? AND user_id = ?`,
        [deviceId, userId]
    );

    return result;
}


module.exports = {
    authenticateDevice,
    getDevicesByUser,
    getDeviceById,
    createDevice,
    updateDeviceStatus,
    updateDeviceName,
    deleteDevice
};