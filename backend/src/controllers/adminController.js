const {
    countAdministrators,
    createManagedUser,
    getAccountRequests,
    getManagedUsers,
    removeManagedUser,
    reviewAccountRequest,
    updateManagedUser
} = require("../services/accountService");
const { sendAccountDecisionEmail } = require("../services/authEmailService");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const { isPasswordValid } = require("../services/passwordPolicy");

async function listRequests(req, res) {
    try {
        return res.json(await getAccountRequests());
    } catch (error) {
        console.error("List account requests error:", error.code || error.message);
        return res.status(500).json({ error: "Unable to load account requests." });
    }
}

async function decideRequest(req, res) {
    const requestId = Number(req.params.id);
    const decision = req.params.decision;
    if (!Number.isInteger(requestId) || requestId < 1 || !["approved", "rejected"].includes(decision)) {
        return res.status(400).json({ error: "Invalid account request or decision." });
    }

    try {
        const { request, userId } = await reviewAccountRequest(requestId, req.admin.id, decision);
        try {
            await sendAccountDecisionEmail(request.email, request.name, decision);
        } catch (emailError) {
            console.error("Account decision email error:", emailError.message);
            return res.status(202).json({
                message: decision === "approved"
                    ? "Account approved, but the notification email could not be delivered."
                    : "Request rejected, but the notification email could not be delivered.",
                userId
            });
        }
        return res.json({
            message: decision === "approved" ? "Account approved and user notified." : "Request rejected and applicant notified.",
            userId
        });
    } catch (error) {
        const status = error.code === "REQUEST_NOT_PENDING" ? 404 : error.code === "EMAIL_IN_USE" ? 409 : 500;
        if (status === 500) console.error("Review account request error:", error.code || error.message);
        return res.status(status).json({ error: error.message || "Unable to review account request." });
    }
}

async function listUsers(req, res) {
    try {
        return res.json(await getManagedUsers());
    } catch (error) {
        console.error("List managed users error:", error.code || error.message);
        return res.status(500).json({ error: "Unable to load users." });
    }
}

async function createUser(req, res) {
    const { name, email, password, contact_phone, property_type, property_information, role = "user" } = req.body;
    if (![name, email, password, contact_phone, property_type].every(value => typeof value === "string" && value.trim())) {
        return res.status(400).json({ error: "Name, email, password, contact phone, and property type are required." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return res.status(400).json({ error: "Enter a valid email address." });
    if (!isPasswordValid(password)) return res.status(400).json({ error: "Password must be 8 to 16 characters and include uppercase and lowercase letters, a number, and a special symbol." });
    if (!["Business", "House"].includes(property_type) || !["user", "admin"].includes(role)) return res.status(400).json({ error: "Choose a valid property type and role." });
    if (name.trim().length > 100 || contact_phone.trim().length > 40 || (property_information || "").length > 2000) return res.status(400).json({ error: "Name, contact phone, or property information exceeds its length limit." });
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const userId = await createManagedUser({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            passwordHash,
            contactPhone: contact_phone.trim(),
            propertyType: property_type,
            propertyInformation: typeof property_information === "string" ? property_information.trim() || null : null,
            role
        });
        const users = await getManagedUsers();
        return res.status(201).json({ user: users.find(user => user.id === userId) });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "That email address is already in use." });
        console.error("Create managed user error:", error.code || error.message);
        return res.status(500).json({ error: "Unable to create user." });
    }
}

async function editUser(req, res) {
    const userId = Number(req.params.id);
    const { name, email, contact_phone, property_type, property_information, role } = req.body;
    if (!Number.isInteger(userId) || userId < 1) return res.status(400).json({ error: "Invalid user ID." });
    if (role !== undefined && !["user", "admin"].includes(role)) return res.status(400).json({ error: "Role must be user or admin." });
    if (name !== undefined && (typeof name !== "string" || !name.trim() || name.trim().length > 100)) return res.status(400).json({ error: "Name is required and must be 100 characters or fewer." });
    if (email !== undefined && (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) return res.status(400).json({ error: "Enter a valid email address." });
    if (contact_phone !== undefined && contact_phone !== null && typeof contact_phone !== "string") return res.status(400).json({ error: "Contact phone must be text." });
    if (contact_phone !== undefined && typeof contact_phone === "string" && contact_phone.trim().length > 40) return res.status(400).json({ error: "Contact phone must be 40 characters or fewer." });
    if (property_information !== undefined && property_information !== null && typeof property_information !== "string") return res.status(400).json({ error: "Property information must be text." });
    if (property_type !== undefined && property_type !== null && property_type !== "" && !["Business", "House"].includes(property_type)) return res.status(400).json({ error: "Property type must be Business or House." });
    if (property_information !== undefined && typeof property_information === "string" && property_information.length > 2000) return res.status(400).json({ error: "Property information must be 2000 characters or fewer." });

    const changes = {};
    if (name !== undefined) changes.name = name.trim();
    if (email !== undefined) changes.email = email.trim().toLowerCase();
    if (contact_phone !== undefined) changes.contact_phone = contact_phone?.trim() || null;
    if (property_type !== undefined) changes.property_type = property_type || null;
    if (property_information !== undefined) changes.property_information = property_information?.trim() || null;
    if (role !== undefined) changes.role = role;

    try {
        if (userId === req.admin.id && role === "user") return res.status(400).json({ error: "You cannot remove your own administrator access." });
        if (role === "user") {
            const [users] = await db.query("SELECT role FROM users WHERE id = ?", [userId]);
            if (users[0]?.role === "admin" && await countAdministrators() <= 1) return res.status(400).json({ error: "The last administrator cannot be demoted." });
        }
        const updated = await updateManagedUser(userId, changes);
        if (!updated) return res.status(404).json({ error: "User not found." });
        const users = await getManagedUsers();
        return res.json({ user: users.find(user => user.id === userId) });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "That email address is already in use." });
        console.error("Update managed user error:", error.code || error.message);
        return res.status(500).json({ error: "Unable to update user." });
    }
}

async function deleteUser(req, res) {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId < 1) return res.status(400).json({ error: "Invalid user ID." });
    if (userId === req.admin.id) return res.status(400).json({ error: "You cannot delete your own administrator account." });
    try {
        const [users] = await db.query("SELECT role FROM users WHERE id = ?", [userId]);
        if (!users.length) return res.status(404).json({ error: "User not found." });
        if (users[0].role === "admin" && await countAdministrators() <= 1) return res.status(400).json({ error: "The last administrator cannot be deleted." });
        if (!await removeManagedUser(userId)) return res.status(404).json({ error: "User not found." });
        return res.json({ message: "User deleted." });
    } catch (error) {
        console.error("Delete managed user error:", error.code || error.message);
        return res.status(500).json({ error: "Unable to delete user." });
    }
}

module.exports = { listRequests, decideRequest, listUsers, createUser, editUser, deleteUser };
