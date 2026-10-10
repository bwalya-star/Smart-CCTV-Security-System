const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const {
    findUserByEmail,
    getUserById,
    createPasswordReset,
    findValidPasswordReset,
    updatePasswordWithResetToken,
    clearPasswordReset
} = require("../services/databaseService");
const { isPasswordValid } = require("../services/passwordPolicy");
const { createAccountRequest } = require("../services/accountService");
const {
    sendPasswordResetEmail,
    sendAccountRequestEmail,
    sendAccountRequestReceivedEmail
} = require("../services/authEmailService");

const DATABASE_UNAVAILABLE_CODES = new Set([
    "ECONNREFUSED",
    "ECONNRESET",
    "ETIMEDOUT",
    "ENOTFOUND",
    "EAI_AGAIN",
    "EHOSTUNREACH",
    "PROTOCOL_CONNECTION_LOST"
]);

function isDatabaseUnavailable(error) {
    return DATABASE_UNAVAILABLE_CODES.has(error.code);
}


// ==========================================
// REGISTER
// ==========================================

async function register(req, res) {

    try {

        const {
            name,
            email,
            password,
            contactPhone,
            propertyType,
            propertyInformation
        } = req.body;

        if (![name, email, password, contactPhone, propertyType].every(value => typeof value === "string" && value.trim())) {
            return res.status(400).json({
                error: "Name, email, password, contact phone, and property type are required."
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return res.status(400).json({ error: "Enter a valid email address." });
        }
        if (name.trim().length > 100 || contactPhone.trim().length > 40) {
            return res.status(400).json({ error: "Name must be 100 characters or fewer and contact phone must be 40 characters or fewer." });
        }
        if (!["Business", "House"].includes(propertyType)) {
            return res.status(400).json({ error: "Choose Business or House as the property type." });
        }
        if (propertyInformation !== undefined && typeof propertyInformation !== "string") {
            return res.status(400).json({ error: "Additional property information must be text." });
        }
        if ((propertyInformation || "").length > 2000) {
            return res.status(400).json({ error: "Additional property information must be 2000 characters or fewer." });
        }

        if (!isPasswordValid(password)) {
            return res.status(400).json({
                error: "Password must be 8 to 16 characters and include uppercase and lowercase letters, a number, and a special symbol."
            });
        }


        const normalizedRequest = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            contactPhone: contactPhone.trim(),
            propertyType,
            propertyInformation: propertyInformation?.trim() || null,
            passwordHash: await bcrypt.hash(password, 10)
        };
        await createAccountRequest(normalizedRequest);
        let adminEmailSent = true;
        try {
            await sendAccountRequestEmail(normalizedRequest);
        } catch (emailError) {
            adminEmailSent = false;
            console.error("Admin account request email error:", emailError.code || emailError.message);
        }

        let applicantEmailSent = true;
        try {
            await sendAccountRequestReceivedEmail(normalizedRequest.email, normalizedRequest.name);
        } catch (emailError) {
            applicantEmailSent = false;
            console.error("Applicant account request email error:", emailError.code || emailError.message);
        }

        return res.status(202).json({
            message: "Your request has been sent and is waiting for administrator approval.",
            adminEmailSent,
            applicantEmailSent
        });

    } catch (error) {

        if (["EMAIL_IN_USE", "REQUEST_PENDING"].includes(error.code)) {
            return res.status(409).json({ error: error.message });
        }

        console.error(
            "Registration error:",
            error
        );

        res.status(500).json({
            error: "Server error."
        });

    }
}


async function requestPasswordReset(req, res) {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Enter a valid email address." });
    }

    try {
        const user = await findUserByEmail(email.trim());

        if (user) {
            const resetToken = crypto.randomBytes(32).toString("hex");
            const tokenHash = crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

            await createPasswordReset(user.id, tokenHash, expiresAt);

            try {
                await sendPasswordResetEmail(user.email, resetToken);
            } catch (emailError) {
                await clearPasswordReset(tokenHash);
                console.error("Password reset email error:", emailError);
            }
        }

        return res.json({
            message: "If an account exists for that email, a password reset link has been sent."
        });
    } catch (error) {
        console.error("Password reset request error:", error);
        return res.status(500).json({ error: "Unable to process the request right now." });
    }
}


async function validatePasswordReset(req, res) {
    try {
        const tokenHash = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");
        const reset = await findValidPasswordReset(tokenHash);

        if (!reset) {
            return res.status(400).json({ error: "This password reset link is invalid or has expired." });
        }

        return res.json({ valid: true });
    } catch (error) {
        console.error("Password reset validation error:", error);
        return res.status(500).json({ error: "Unable to validate the reset link right now." });
    }
}


async function resetPassword(req, res) {
    const { password, confirmPassword } = req.body;

    if (!isPasswordValid(password)) {
        return res.status(400).json({
            error: "Password must be 8 to 16 characters and include uppercase and lowercase letters, a number, and a special symbol."
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match." });
    }

    try {
        const tokenHash = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");
        const passwordHash = await bcrypt.hash(password, 10);
        const updated = await updatePasswordWithResetToken(tokenHash, passwordHash);

        if (!updated) {
            return res.status(400).json({ error: "This password reset link is invalid or has expired." });
        }

        return res.json({ message: "Your password has been updated. You can now sign in." });
    } catch (error) {
        console.error("Password reset error:", error);
        return res.status(500).json({ error: "Unable to update the password right now." });
    }
}


// ==========================================
// LOGIN
// ==========================================

async function login(req, res) {

    try {

        const {
            email,
            password
        } = req.body;


        // Validate input
        if (!email || !password) {

            return res.status(400).json({
                error: "Email and password are required."
            });

        }


        // Find user
        const user =
            await findUserByEmail(email);


        if (!user) {

            return res.status(401).json({
                error: "The email or password is incorrect."
            });

        }


        // Compare password
        const passwordValid =
            await bcrypt.compare(
                password,
                user.password_hash
            );


        if (!passwordValid) {

            return res.status(401).json({
                error: "The email or password is incorrect."
            });

        }


        // Create JWT
        const token =
            jwt.sign(

                {
                    id: user.id,
                    email: user.email,
                    role: user.role === "admin" || user.email.toLowerCase() === (process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "").trim().toLowerCase()
                        ? "admin"
                        : user.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "24h"
                }

            );


        res.json({

            message: "Login successful.",

            token,

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role === "admin" || user.email.toLowerCase() === (process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "").trim().toLowerCase()
                    ? "admin"
                    : user.role,
                contact_phone: user.contact_phone,
                property_type: user.property_type,
                property_information: user.property_information
            }

        });

    } catch (error) {

        console.error(
            "Login error:",
            error.code || error.message
        );

        const databaseUnavailable = isDatabaseUnavailable(error);
        res.status(databaseUnavailable ? 503 : 500).json({
            error: databaseUnavailable
                ? "Sign-in is temporarily unavailable because the database cannot be reached. Please try again later."
                : "We couldn't complete sign-in because of a server error. Please try again later."
        });

    }
}


// ==========================================
// GET CURRENT USER
// ==========================================

async function getMe(req, res) {

    try {

        const user =
            await getUserById(
                req.user.id
            );


        if (!user) {

            return res.status(404).json({
                error: "User not found."
            });

        }


        const configuredAdminEmail = (process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "").trim().toLowerCase();
        res.json({
            user: {
                ...user,
                role: user.role === "admin" || user.email.toLowerCase() === configuredAdminEmail ? "admin" : user.role
            }
        });

    } catch (error) {

        console.error(
            "Get current user error:",
            error
        );

        res.status(500).json({
            error: "Server error."
        });

    }
}


module.exports = {
    register,
    login,
    getMe,
    requestPasswordReset,
    validatePasswordReset,
    resetPassword
};