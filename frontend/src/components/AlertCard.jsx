const API_URL = "http://localhost:5000";

function AlertCard({ alert }) {

    const faceRecognition =
        alert.face_recognition || {
            performed:
                false,

            recognized:
                alert.identity_status === "known",

            name:
                alert.identity_name ||
                "not_checked",

            similarity:
                alert.face_similarity || 0,

            identity_status:
                alert.identity_status ||
                "not_checked"
        };

    const identityName =
        faceRecognition.name;

    const similarity =
        Number(
            faceRecognition.similarity || 0
        );

    const classification =
        alert.alert_classification ||
        "UNIDENTIFIED_PERSON";

    const severity =
        alert.severity ||
        "MEDIUM";

    const identityStatus =
        faceRecognition.identity_status;

    const notificationStatus =
        alert.notification_status ||
        "not_required";

    const getNotificationInfo = () => {
        switch (notificationStatus) {
            case "sent":
                return {
                    label: "Notification Sent",
                    icon: "📧",
                    className: "notification-sent"
                };

            case "suppressed":
                return {
                    label: "Notification Suppressed",
                    icon: "⏳",
                    className: "notification-suppressed"
                };

            case "failed":
                return {
                    label: "Notification Failed",
                    icon: "⚠️",
                    className: "notification-failed"
                };

            default:
                return {
                    label: "No Notification Required",
                    icon: "🔕",
                    className: "notification-not-required"
                };
        }
    };

    const notificationInfo =
        getNotificationInfo();

    const getClassificationInfo = () => {
        switch (classification) {
            case "NO_PERSON":
                return {
                    label: "No Person Detected",
                    icon: "🟢",
                    className: "classification-safe"
                };

            case "KNOWN_PERSON":
                return {
                    label: "Known Person",
                    icon: "🔵",
                    className: "classification-known"
                };

            case "UNKNOWN_PERSON":
                return {
                    label: "Unknown Person",
                    icon: "🟠",
                    className: "classification-unknown"
                };

            case "UNIDENTIFIED_PERSON":
                return {
                    label: "Person Unidentified",
                    icon: "🟣",
                    className: "classification-unidentified"
                };

            default:
                return {
                    label: "Unknown Classification",
                    icon: "❔",
                    className: "classification-unidentified"
                };
        }
    };

    const classificationInfo =
        getClassificationInfo();

    const getSeverityInfo = () => {
        switch (severity) {
            case "INFO":
                return {
                    label: "Informational",
                    icon: "🟢",
                    className: "severity-info"
                };

            case "LOW":
                return {
                    label: "Low Severity",
                    icon: "🔵",
                    className: "severity-low"
                };

            case "MEDIUM":
                return {
                    label: "Medium Severity",
                    icon: "🟠",
                    className: "severity-medium"
                };

            case "HIGH":
                return {
                    label: "High Severity",
                    icon: "🔴",
                    className: "severity-high"
                };

            default:
                return {
                    label: "Unknown Severity",
                    icon: "⚪",
                    className: "severity-info"
                };
        }
    };

    const severityInfo =
        getSeverityInfo();

    return (
        <div className="alert-card">

            <div className="alert-header">

                <h3>
                    {alert.status === "threat"
                        ? "🚨 Person Detected"
                        : "🟢 No Threat"}
                </h3>

                <span>
                    {new Date(
                        alert.created_at
                    ).toLocaleString()}
                </span>

            </div>


            {alert.image_path && (

                <img
                    src={`${API_URL}${alert.image_path}`}
                    alt="Security capture"
                    className="alert-image"
                />

            )}


            <div className="alert-info">

                <p>
                    <strong>Detection:</strong>{" "}
                    {alert.detected
                        ? "Person detected"
                        : "No person"}
                </p>

                <p>
                    <strong>Detection confidence:</strong>{" "}
                    {(
                        Number(
                            alert.confidence || 0
                        ) * 100
                    ).toFixed(1)}
                    %
                </p>

            </div>


            <div
                className={`classification-badge ${classificationInfo.className}`}
            >

                <span className="classification-icon">
                    {classificationInfo.icon}
                </span>

                <span>
                    {classificationInfo.label}
                </span>

            </div>


            <div
                className={`severity-badge ${severityInfo.className}`}
            >

                <span>
                    {severityInfo.icon}
                </span>

                <span>
                    {severityInfo.label}
                </span>

            </div>

            <div
                className={`notification-badge ${notificationInfo.className}`}
            >
                <span>
                    {notificationInfo.icon}
                </span>

                <span>
                    {notificationInfo.label}
                </span>
            </div>


            {classification !== "NO_PERSON" &&
                alert.detected && (

                <div className="face-recognition-info">

                    <h4>
                        👤 Identity Recognition
                    </h4>

                    <p>
                        <strong>Status:</strong>{" "}
                        {identityStatus === "known"
                            ? "✅ Known Person"
                            : identityStatus === "unknown"
                                ? "⚠️ Unknown Person"
                                : identityStatus === "unidentified"
                                    ? "❓ Identity Unavailable"
                                    : "Not Checked"}
                    </p>

                    {identityStatus === "known" && (
                        <p>
                            <strong>Name:</strong>{" "}
                            {identityName}
                        </p>
                    )}

                    {identityStatus === "unknown" && (
                        <p>
                            <strong>Name:</strong> Unknown
                        </p>
                    )}

                    {(identityStatus === "known" ||
                        identityStatus === "unknown") && (
                            <p>
                                <strong>Face similarity:</strong>{" "}
                                {(similarity * 100).toFixed(1)}%
                            </p>
                        )}

                </div>

            )}


        </div>
    );
}

export default AlertCard;