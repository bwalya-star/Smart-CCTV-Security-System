const db = require('../config/db');

async function saveAlert(imagePath, detected, confidence, status) {
    const query = `
        INSERT INTO alerts (image_path, detected, confidence, status)
        VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [imagePath, detected, confidence, status]);
    return result;
}

async function getAlerts() {
    const query = 'SELECT * FROM alerts ORDER BY created_at DESC';
    const [rows] = await db.query(query);
    return rows;
}

module.exports = { saveAlert, getAlerts };