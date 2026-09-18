import "./EventTimeline.css";

function EventTimeline({ alerts }) {
    if (!alerts || alerts.length === 0) {
        return (
            <div className="event-timeline">
                <h2>System Event Timeline</h2>

                <div className="timeline-empty">
                    No security events recorded yet.
                </div>
            </div>
        );
    }

    return (
        <div className="event-timeline">
            <div className="timeline-header">
                <div>
                    <h2>System Event Timeline</h2>
                    <p>Chronological security activity</p>
                </div>

                <span className="timeline-count">
                    {alerts.length} events
                </span>
            </div>

            <div className="timeline">
                {alerts.map((alert, index) => (
                    <div
                        className="timeline-item"
                        key={
                            alert.id ||
                            `${alert.created_at}-${index}`
                        }
                    >
                        <div
                            className={`timeline-marker ${
                                alert.severity === "HIGH"
                                    ? "marker-high"
                                    : alert.severity === "MEDIUM"
                                        ? "marker-medium"
                                        : alert.severity === "LOW"
                                            ? "marker-low"
                                            : "marker-info"
                            }`}
                        >
                            ●
                        </div>

                        <div className="timeline-content">
                            <div className="timeline-top">
                                <strong>
                                    {alert.alert_classification ||
                                        "SECURITY_EVENT"}
                                </strong>

                                <span>
                                    {alert.created_at
                                        ? new Date(
                                            alert.created_at
                                        ).toLocaleString()
                                        : "Unknown time"}
                                </span>
                            </div>

                            <div className="timeline-details">
                                <span>
                                    Identity: {alert.identity_name || "Unknown"}
                                </span>

                                <span>
                                    Severity: {alert.severity || "UNKNOWN"}
                                </span>

                                <span>
                                    Confidence: {
                                        alert.confidence !== null &&
                                        alert.confidence !== undefined
                                            ? Number(alert.confidence).toFixed(2)
                                            : "N/A"
                                    }
                                </span>
                            </div>

                            <div className="timeline-notification">
                                {alert.notification_status === "sent" ? (
                                    <span>📧 Notification sent</span>
                                ) : alert.notification_status === "suppressed" ? (
                                    <span>⏳ Notification suppressed</span>
                                ) : alert.notification_status === "failed" ? (
                                    <span>⚠️ Notification failed</span>
                                ) : (
                                    <span>🔕 No notification required</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default EventTimeline;
