const { getUserById } = require("../services/databaseService");

async function requireAdmin(req, res, next) {
    try {
        const user = await getUserById(req.user.id);
        const configuredAdminEmail = (process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "").trim().toLowerCase();
        const isConfiguredAdmin = configuredAdminEmail && user?.email?.toLowerCase() === configuredAdminEmail;

        if (!user || (user.role !== "admin" && !isConfiguredAdmin)) {
            return res.status(403).json({ error: "Administrator access required." });
        }

        req.admin = user;
        return next();
    } catch (error) {
        console.error("Admin authorization error:", error.code || error.message);
        return res.status(500).json({ error: "Unable to verify administrator access." });
    }
}

module.exports = { requireAdmin };
