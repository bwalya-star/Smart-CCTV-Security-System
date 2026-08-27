const db = require('../config/db');


// =====================================================
// SAVE ALERT
// =====================================================

async function saveAlert(
    imagePath,
    detected,
    confidence,
    status,
    userId = null
) {

    const query = `
        INSERT INTO alerts
        (
            image_path,
            detected,
            confidence,
            status,
            user_id
        )
        VALUES (?, ?, ?, ?, ?)
    `;


    const [result] = await db.query(
        query,
        [
            imagePath,
            detected,
            confidence,
            status,
            userId
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
        SELECT *
        FROM alerts
        WHERE user_id = ?
        ORDER BY created_at DESC
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