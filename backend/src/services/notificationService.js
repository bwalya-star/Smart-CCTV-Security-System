const nodemailer = require("nodemailer");


// ==========================================
// NOTIFICATION COOLDOWN
// ==========================================

let lastNotificationTime = null;


// ==========================================
// EMAIL CONFIGURATION
// ==========================================

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});


// ==========================================
// NOTIFICATION DECISION
// ==========================================

function shouldNotify(alert) {
  if (!alert) {
    return false;
  }

  return alert.severity === "HIGH";
}


// ==========================================
// CHECK COOLDOWN
// ==========================================

function isCooldownActive() {
  if (!lastNotificationTime) {
    return false;
  }

  const cooldownMinutes = Number(
    process.env.NOTIFICATION_COOLDOWN_MINUTES || 5
  );
  const cooldownMilliseconds = cooldownMinutes * 60 * 1000;
  const elapsedTime = Date.now() - lastNotificationTime;

  return elapsedTime < cooldownMilliseconds;
}


// ==========================================
// GET REMAINING COOLDOWN
// ==========================================

function getRemainingCooldown() {
  if (!lastNotificationTime) {
    return 0;
  }

  const cooldownMinutes = Number(
    process.env.NOTIFICATION_COOLDOWN_MINUTES || 5
  );
  const cooldownMilliseconds = cooldownMinutes * 60 * 1000;
  const elapsedTime = Date.now() - lastNotificationTime;
  const remaining = cooldownMilliseconds - elapsedTime;

  return remaining <= 0
    ? 0
    : Math.ceil(remaining / 1000);
}


// ==========================================
// CREATE EMAIL CONTENT
// ==========================================

function createEmailContent(alert) {
  const identity = alert.identity_name || "Unknown";
  const similarity =
    alert.face_similarity !== null &&
    alert.face_similarity !== undefined
      ? alert.face_similarity
      : 0;
  const classification =
    alert.alert_classification || "UNKNOWN_EVENT";
  const imagePath = alert.image_path || "Not available";
  const subject =
    `Smart CCTV Security Alert - ${classification}`;

  const text = `
SMART CCTV SECURITY ALERT

A high-severity security event has been detected.

Classification:
${classification}

Severity:
${alert.severity}

Identity:
${identity}

Face Similarity:
${similarity}

Detection Confidence:
${alert.confidence || 0}

Image:
${imagePath}

Please check the Smart CCTV dashboard for further information.

This notification was generated automatically by the Smart CCTV Security System.
`;

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Smart CCTV Security Alert</h2>
      <p>A high-severity security event has been detected.</p>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
        <tr><td><strong>Classification</strong></td><td>${classification}</td></tr>
        <tr><td><strong>Severity</strong></td><td>${alert.severity}</td></tr>
        <tr><td><strong>Identity</strong></td><td>${identity}</td></tr>
        <tr><td><strong>Face Similarity</strong></td><td>${similarity}</td></tr>
        <tr><td><strong>Detection Confidence</strong></td><td>${alert.confidence || 0}</td></tr>
        <tr><td><strong>Image</strong></td><td>${imagePath}</td></tr>
      </table>
      <p>Please check the Smart CCTV dashboard for further information.</p>
      <p><small>This notification was generated automatically by the Smart CCTV Security System.</small></p>
    </div>
  `;

  return { subject, text, html };
}


// ==========================================
// SEND EMAIL
// ==========================================

async function sendEmailNotification(alert) {
  if (!process.env.EMAIL_USER) {
    console.error("EMAIL_USER is not configured.");
    return {
      sent: false,
      notificationStatus: "failed",
      notificationChannel: "email",
      reason: "Email configuration is missing."
    };
  }

  if (!process.env.EMAIL_PASSWORD) {
    console.error("EMAIL_PASSWORD is not configured.");
    return {
      sent: false,
      notificationStatus: "failed",
      notificationChannel: "email",
      reason: "Email password is missing."
    };
  }

  if (!process.env.ALERT_EMAIL) {
    console.error("ALERT_EMAIL is not configured.");
    return {
      sent: false,
      notificationStatus: "failed",
      notificationChannel: "email",
      reason: "Alert recipient is missing."
    };
  }

  const emailContent = createEmailContent(alert);

  try {
    const info = await transporter.sendMail({
      from: `"Smart CCTV Security System" <${process.env.EMAIL_USER}>`,
      to: process.env.ALERT_EMAIL,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    });

    lastNotificationTime = Date.now();

    console.log("Security email sent successfully.");
    console.log("Notification cooldown started.");

    return {
      sent: true,
      notificationStatus: "sent",
      notificationChannel: "email",
      messageId: info.messageId
    };
  } catch (error) {
    console.error(
      "Error sending security email:",
      error.message
    );

    return {
      sent: false,
      notificationStatus: "failed",
      notificationChannel: "email",
      reason: error.message
    };
  }
}


// ==========================================
// MAIN NOTIFICATION FUNCTION
// ==========================================

async function sendNotification(alert) {
  if (!shouldNotify(alert)) {
    console.log("Notification not required.");
    return {
      sent: false,
      notificationStatus: "not_required",
      notificationChannel: null,
      reason: "Notification policy did not require an alert."
    };
  }

  if (isCooldownActive()) {
    const remainingSeconds = getRemainingCooldown();

    console.log("Notification skipped.");
    console.log(
      `Cooldown active. ${remainingSeconds} seconds remaining.`
    );

    return {
      sent: false,
      cooldown: true,
      notificationStatus: "suppressed",
      notificationChannel: "email",
      remainingSeconds,
      reason: "Notification cooldown is active."
    };
  }

  console.log(
    "High severity event requires notification."
  );

  return sendEmailNotification(alert);
}


module.exports = {
  shouldNotify,
  sendNotification,
  sendEmailNotification,
  isCooldownActive,
  getRemainingCooldown
};
