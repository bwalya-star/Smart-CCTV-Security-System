function NotificationHistory({ alerts }) {
    const notificationAlerts = alerts.filter(
        alert =>
            alert.notification_status === "sent" ||
            alert.notification_status === "suppressed" ||
            alert.notification_status === "failed"
    );

    return (
        <div className="notification-history">
            <div className="section-header">
                <h2>Notification History</h2>
                <span>{notificationAlerts.length} events</span>
            </div>

            {notificationAlerts.length === 0 ? (
                <div className="empty-notifications">
                    No notification activity yet.
                </div>
            ) : (
                <div className="notification-list">
                    {notificationAlerts.slice(0, 10).map((alert, index) => (
                        <div
                            className="notification-history-item"
                            key={
                                alert.id ||
                                `${alert.created_at}-${index}`
                            }
                        >
                            <div className="notification-history-icon">
                                {alert.notification_status === "sent"
                                    ? "📧"
                                    : alert.notification_status === "suppressed"
                                        ? "⏳"
                                        : "⚠️"}
                            </div>

                            <div className="notification-history-content">
                                <strong>
                                    {alert.alert_classification ||
                                        "Security Event"}
                                </strong>
                                <span>
                                    Severity: {alert.severity || "UNKNOWN"}
                                </span>
                                <span>
                                    Identity: {alert.identity_name || "Unknown"}
                                </span>
                                <span>
                                    Status: {alert.notification_status}
                                </span>
                            </div>

                            <div className="notification-history-time">
                                {alert.created_at
                                    ? new Date(
                                        alert.created_at
                                    ).toLocaleString()
                                    : "Unknown time"}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default NotificationHistory;
