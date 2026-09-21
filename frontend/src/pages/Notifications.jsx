import { motion } from "framer-motion";
import NotificationHistory from "../components/NotificationHistory";

const MotionDiv = motion.div;

function Notifications({ alerts, loading }) {
    const notificationAlerts = alerts.filter(alert =>
        ["sent", "suppressed", "failed"].includes(alert.notification_status)
    );

    const sent = alerts.filter(alert => alert.notification_status === "sent").length;
    const suppressed = alerts.filter(alert => alert.notification_status === "suppressed").length;
    const failed = alerts.filter(alert => alert.notification_status === "failed").length;

    if (loading) {
        return <div className="page-loading">Loading notifications...</div>;
    }

    return (
        <div className="page-stack">
            <section className="page-intro">
                <div>
                    <span className="eyebrow">DELIVERY CENTER</span>
                    <h2>Notifications</h2>
                    <p>Track security messages, delivery outcomes, and suppressed alerts.</p>
                </div>
                <span className="date-chip">Email channel</span>
            </section>

            <div className="stats-grid notification-metrics">
                {[
                    ["Sent", sent, "stat-safe"],
                    ["Suppressed", suppressed, "stat-warning"],
                    ["Failed", failed, "stat-danger"]
                ].map(([label, value, className], index) => (
                    <MotionDiv
                        className={`metric-card ${className}`}
                        key={label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.06 }}
                        whileHover={{ y: -3 }}
                    >
                        <span>{label}</span>
                        <strong>{value}</strong>
                    </MotionDiv>
                ))}
            </div>

            <NotificationHistory alerts={alerts} />

            <section className="section-block">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">DELIVERY LOG</span>
                        <h2>Notification activity</h2>
                    </div>
                    <span className="muted-label">{notificationAlerts.length} events</span>
                </div>
                {notificationAlerts.length === 0 ? (
                    <div className="empty-panel">No notification activity yet.</div>
                ) : (
                    <div className="notification-table">
                        {notificationAlerts.map((alert, index) => (
                            <div className="notification-row" key={alert.id || `${alert.created_at}-${index}`}>
                                <div className={`status-dot status-${alert.notification_status}`}></div>
                                <div className="notification-row-main">
                                    <strong>{alert.alert_classification || "Security event"}</strong>
                                    <span>{alert.notification_channel || "No channel"} · {alert.identity_name || "Unknown identity"}</span>
                                </div>
                                <span className={`status-pill status-pill-${alert.notification_status}`}>
                                    {alert.notification_status || "not required"}
                                </span>
                                <time>{alert.created_at ? new Date(alert.created_at).toLocaleString() : "Unknown time"}</time>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Notifications;
