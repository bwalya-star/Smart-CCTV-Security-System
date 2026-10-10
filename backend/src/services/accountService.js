const db = require("../config/db");

async function createAccountRequest(request) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [users] = await connection.query(
            "SELECT id FROM users WHERE email = ? LIMIT 1",
            [request.email]
        );
        if (users.length) {
            const error = new Error("An account with this email already exists.");
            error.code = "EMAIL_IN_USE";
            throw error;
        }

        const [pendingRequests] = await connection.query(
            "SELECT id FROM account_requests WHERE email = ? AND status = 'pending' LIMIT 1 FOR UPDATE",
            [request.email]
        );
        if (pendingRequests.length) {
            const error = new Error("An account request for this email is already awaiting review.");
            error.code = "REQUEST_PENDING";
            throw error;
        }

        const [result] = await connection.query(
            `INSERT INTO account_requests
                (name, email, contact_phone, property_type, property_information, password_hash)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [request.name, request.email, request.contactPhone, request.propertyType, request.propertyInformation, request.passwordHash]
        );
        await connection.commit();
        return result.insertId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function getAccountRequests() {
    const [rows] = await db.query(
        `SELECT id, name, email, contact_phone, property_type, property_information, status, created_at
         FROM account_requests WHERE status = 'pending' ORDER BY created_at ASC`
    );
    return rows;
}

async function reviewAccountRequest(requestId, reviewerId, decision) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [rows] = await connection.query(
            "SELECT * FROM account_requests WHERE id = ? FOR UPDATE",
            [requestId]
        );
        const request = rows[0];
        if (!request || request.status !== "pending") {
            const error = new Error("Pending account request not found.");
            error.code = "REQUEST_NOT_PENDING";
            throw error;
        }

        let userId = null;
        if (decision === "approved") {
            const [existing] = await connection.query(
                "SELECT id FROM users WHERE email = ? LIMIT 1",
                [request.email]
            );
            if (existing.length) {
                const error = new Error("An account with this email now exists. Reject this request instead.");
                error.code = "EMAIL_IN_USE";
                throw error;
            }
            const [created] = await connection.query(
                `INSERT INTO users
                    (name, email, password_hash, role, contact_phone, property_type, property_information)
                 VALUES (?, ?, ?, 'user', ?, ?, ?)`,
                [request.name, request.email, request.password_hash, request.contact_phone, request.property_type, request.property_information]
            );
            userId = created.insertId;
        }

        await connection.query(
            "UPDATE account_requests SET status = ?, password_hash = '', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'pending'",
            [decision, reviewerId, requestId]
        );
        await connection.commit();
        return { request, userId };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function getManagedUsers() {
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "").trim().toLowerCase();
    const [rows] = await db.query(
        `SELECT id, name, email,
                CASE WHEN role = 'admin' OR LOWER(email) = ? THEN 'admin' ELSE role END AS role,
                contact_phone, property_type, property_information, created_at
         FROM users ORDER BY created_at DESC`,
        [configuredAdminEmail]
    );
    return rows;
}

async function createManagedUser(user) {
    const [result] = await db.query(
        `INSERT INTO users
            (name, email, password_hash, role, contact_phone, property_type, property_information)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user.name, user.email, user.passwordHash, user.role, user.contactPhone, user.propertyType, user.propertyInformation]
    );
    return result.insertId;
}

async function updateManagedUser(userId, changes) {
    const allowed = ["name", "email", "contact_phone", "property_type", "property_information", "role"];
    const fields = allowed.filter(field => Object.hasOwn(changes, field));
    if (!fields.length) return false;
    const values = fields.map(field => changes[field]);
    const assignments = fields.map(field => `${field} = ?`).join(", ");
    values.push(userId);
    const [result] = await db.query(`UPDATE users SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    return result.affectedRows === 1;
}

async function removeManagedUser(userId) {
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [userId]);
    return result.affectedRows === 1;
}

async function countAdministrators() {
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "").trim().toLowerCase();
    const [rows] = await db.query(
        "SELECT COUNT(*) AS count FROM users WHERE role = 'admin' OR LOWER(email) = ?",
        [configuredAdminEmail]
    );
    return Number(rows[0].count);
}

module.exports = {
    createAccountRequest,
    getAccountRequests,
    reviewAccountRequest,
    getManagedUsers,
    createManagedUser,
    updateManagedUser,
    removeManagedUser,
    countAdministrators
};
