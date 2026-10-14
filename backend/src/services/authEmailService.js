const nodemailer = require("nodemailer");
const loginUrl = "https://smart-cctv-security-systemfrontend.vercel.app";

function createTransporter() {
    const port = Number(process.env.EMAIL_PORT || 587);

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port,
        secure: port === 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
}

async function sendPasswordResetEmail(email, token) {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new Error("Email delivery is not configured.");
    }

    const frontendUrl = process.env.FRONTEND_URL ||
        (process.env.FRONTEND_URLS || "http://localhost:5173").split(",")[0].trim();
    const resetUrl = new URL("/", frontendUrl);
    resetUrl.searchParams.set("resetToken", token);
    const transporter = createTransporter();

    await transporter.sendMail({
        from: `"Smart CCTV Security System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset your Smart CCTV password",
        text: `Use this link to choose a new password. It expires in 30 minutes and can only be used once:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #17202a;"><h2>Reset your password</h2><p>Use the link below to choose a new password. It expires in 30 minutes and can only be used once.</p><p><a href="${resetUrl}">Choose a new password</a></p><p>If you did not request this, you can ignore this email.</p></div>`
    });
}

function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    })[character]);
}

async function sendAccountRequestEmail(request) {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new Error("Email delivery is not configured.");
    }
    const adminEmail = (process.env.ADMIN_EMAIL || process.env.EMAIL_USER).trim();
    const details = [
        ["Name", request.name],
        ["Email", request.email],
        ["Contact phone", request.contactPhone],
        ["Property type", request.propertyType],
        ["Additional property information", request.propertyInformation || "Not provided"]
    ];
    const text = `A new Smart CCTV account request is awaiting approval.\n\n${details.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\nSign in to the administrator account and review Account Requests.\n\nLog in: ${loginUrl}`;
    const htmlDetails = details.map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`).join("");
    await createTransporter().sendMail({
        from: `"Smart CCTV Security System" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `Account approval request: ${request.name}`,
        text,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#17202a"><h2>New account request</h2>${htmlDetails}<p>Sign in to the administrator account and review Account Requests.</p><p><a href="${loginUrl}">Log in to Smart CCTV</a></p></div>`
    });
}

async function sendAccountRequestReceivedEmail(email, name) {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new Error("Email delivery is not configured.");
    }

    const message = "We received your Smart CCTV account request. It is now waiting for administrator approval. We will email you when a decision has been made. You cannot sign in until your account is approved.";
    await createTransporter().sendMail({
        from: `"Smart CCTV Security System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "We received your Smart CCTV account request",
        text: `Hello ${name},\n\n${message}`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#17202a"><h2>Request received</h2><p>Hello ${escapeHtml(name)},</p><p>${escapeHtml(message)}</p></div>`
    });
}

async function sendAccountDecisionEmail(email, name, decision) {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new Error("Email delivery is not configured.");
    }
    const approved = decision === "approved";
    const message = approved
        ? "Your account request has been approved and your Smart CCTV account has been created. You can now sign in."
        : "Your Smart CCTV account request was not approved. If you believe this was a mistake, please contact the administrator.";
    const loginInstructions = approved ? `\n\nLog in: ${loginUrl}` : "";
    const loginLink = approved ? `<p><a href="${loginUrl}">Log in to Smart CCTV</a></p>` : "";
    await createTransporter().sendMail({
        from: `"Smart CCTV Security System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: approved ? "Your Smart CCTV account is approved" : "Update on your Smart CCTV account request",
        text: `Hello ${name},\n\n${message}${loginInstructions}`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#17202a"><p>Hello ${escapeHtml(name)},</p><p>${escapeHtml(message)}</p>${loginLink}</div>`
    });
}

module.exports = { sendPasswordResetEmail, sendAccountRequestEmail, sendAccountRequestReceivedEmail, sendAccountDecisionEmail };