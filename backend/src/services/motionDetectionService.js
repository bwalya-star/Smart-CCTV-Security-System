const db = require("../config/db");
const { getLocalDateTime } = require("./recordingScheduleService");

function normalizeDate(value) {
    if (!value) {
        return null;
    }

    return value instanceof Date
        ? value.toISOString().slice(0, 10)
        : String(value).slice(0, 10);
}

async function getMotionDetectionSettings() {
    const [rows] = await db.query(
        `SELECT enabled, failsafe_enabled, failsafe_time, time_zone,
                DATE_FORMAT(last_failsafe_date, '%Y-%m-%d') AS last_failsafe_date
         FROM camera_motion_settings WHERE id = 1`
    );

    if (!rows.length) {
        throw new Error("Motion detection settings have not been initialized.");
    }

    const settings = rows[0];
    return {
        enabled: Boolean(settings.enabled),
        failsafeEnabled: Boolean(settings.failsafe_enabled),
        failsafeTime: String(settings.failsafe_time).slice(0, 5),
        timeZone: settings.time_zone,
        lastFailsafeDate: normalizeDate(settings.last_failsafe_date)
    };
}

async function isMotionDetectionEnabled() {
    const [rows] = await db.query(
        "SELECT enabled FROM camera_motion_settings WHERE id = 1"
    );

    if (!rows.length) {
        throw new Error("Motion detection settings have not been initialized.");
    }

    return Boolean(rows[0].enabled);
}

async function saveMotionDetectionSettings(settings, userId) {
    const current = await getMotionDetectionSettings();
    const changedFailsafe = current.failsafeEnabled !== settings.failsafeEnabled ||
        current.failsafeTime !== settings.failsafeTime ||
        current.timeZone !== settings.timeZone;
    let lastFailsafeDate = changedFailsafe ? null : current.lastFailsafeDate;

    if (settings.enabled && settings.failsafeEnabled) {
        const local = getLocalDateTime(settings.timeZone, new Date());
        const [hour, minute] = settings.failsafeTime.split(":").map(Number);
        if (local.minuteOfDay >= hour * 60 + minute) {
            lastFailsafeDate = local.date;
        }
    }

    await db.query(
        `UPDATE camera_motion_settings
         SET enabled = ?, failsafe_enabled = ?, failsafe_time = ?, time_zone = ?,
             last_failsafe_date = ?, updated_by = ?
         WHERE id = 1`,
        [
            settings.enabled,
            settings.failsafeEnabled,
            `${settings.failsafeTime}:00`,
            settings.timeZone,
            lastFailsafeDate,
            userId
        ]
    );

    await enforceMotionDetectionFailSafe();
    return getMotionDetectionSettings();
}

async function enforceMotionDetectionFailSafe() {
    try {
        const settings = await getMotionDetectionSettings();
        if (!settings.failsafeEnabled) {
            return;
        }

        const local = getLocalDateTime(settings.timeZone, new Date());
        const [hour, minute] = settings.failsafeTime.split(":").map(Number);
        if (local.minuteOfDay < hour * 60 + minute ||
            settings.lastFailsafeDate === local.date) {
            return;
        }

        const [result] = await db.query(
            `UPDATE camera_motion_settings
             SET enabled = TRUE, last_failsafe_date = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = 1 AND failsafe_enabled = TRUE
               AND failsafe_time <= ? AND (last_failsafe_date IS NULL OR last_failsafe_date <> ?)`,
            [local.date, `${settings.failsafeTime}:00`, local.date]
        );

        if (result.affectedRows && !settings.enabled) {
            console.log(`Motion detection fail-safe enabled monitoring for ${local.date}.`);
        }
    } catch (error) {
        console.error("Unable to enforce motion detection fail-safe:", error);
    }
}

setInterval(enforceMotionDetectionFailSafe, 15000);
enforceMotionDetectionFailSafe();

module.exports = {
    getMotionDetectionSettings,
    isMotionDetectionEnabled,
    saveMotionDetectionSettings,
    enforceMotionDetectionFailSafe
};
