import { useState } from "react";
import { motion } from "framer-motion";
import { Send, ShieldOff, MailWarning, Inbox, Search } from "lucide-react";
import NotificationHistory from "../components/NotificationHistory";
import AlertDetailModal from "../components/AlertDetailModal";

const MotionDiv = motion.div;

function Notifications({ alerts, loading }) {
    const notificationAlerts = alerts.filter(alert =>
        ["sent", "suppressed", "failed"].includes(alert.notification_status)
    );

    const [activeCategory, setActiveCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAlert, setSelectedAlert] = useState(null);

    const metrics = [
        ["All notifications", "all", notificationAlerts, "stat-neutral", <Inbox size={16} />],
        ["Sent", "sent", alerts.filter(alert => alert.notification_status === "sent"), "stat-safe", <Send size={16} />],
        ["Suppressed", "suppressed", alerts.filter(alert => alert.notification_status === "suppressed"), "stat-warning", <ShieldOff size={16} />],
        ["Failed", "failed", alerts.filter(alert => alert.notification_status === "failed"), "stat-danger", <MailWarning size={16} />]
    ];

    const selectedCategory = metrics.find(item => item[1] === activeCategory);
    const categoryAlerts = selectedCategory ? selectedCategory[2] : notificationAlerts;
    const query = searchTerm.trim().toLowerCase();
    const filteredNotifications = query
        ? categoryAlerts.filter(alert => [
            alert.created_at,
            alert.notification_status,
            alert.notification_channel,
            alert.alert_classification,
            alert.identity_name,
            alert.severity
        ].some(value => String(value || "").toLowerCase().includes(query)))
        : categoryAlerts;

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
                {metrics.map(([label, category, categoryAlerts, className, icon], index) => (
                    <MotionDiv
                        className={`metric-card ${className} ${activeCategory === category ? "metric-card-selected" : ""}`}
                        key={label}
                        onClick={() => setActiveCategory(category)}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.06 }}
                        whileHover={{ y: -3 }}
                    >
                        <div className={`metric-icon ${className.replace("stat-", "icon-")}`}>{icon}</div>
                        <span>{label}</span>
                        <strong>{categoryAlerts.length}</strong>
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
                    <span className="muted-label">{filteredNotifications.length} events</span>
                </div>
                <div className="record-search">
                    <Search size={18} />
                    <input
                        value={searchTerm}
                        onChange={event => setSearchTerm(event.target.value)}
                        placeholder="Search date, channel, status, identity..."
                        aria-label="Search notification records"
                    />
                    <button type="button" onClick={() => setSearchTerm("")}>Clear</button>
                </div>
                {filteredNotifications.length === 0 ? (
                    <div className="empty-panel">
                        <div className="empty-panel-icon"><Inbox size={18} /></div>
                        <span>No notification activity yet.</span>
                    </div>
                ) : (
                    <div className="notification-table">
                        {filteredNotifications.map((alert, index) => (
                            <button className="notification-row" onClick={() => setSelectedAlert(alert)} key={alert.id || `${alert.created_at}-${index}`} type="button">
                                <div className={`status-dot status-${alert.notification_status}`}></div>
                                <div className="notification-row-main">
                                    <strong>{alert.alert_classification || "Security event"}</strong>
                                    <span>{alert.notification_channel || "No channel"} · {alert.identity_name || "Unknown identity"}</span>
                                </div>
                                <span className={`status-pill status-pill-${alert.notification_status}`}>
                                    {alert.notification_status || "not required"}
                                </span>
                                <time>{alert.created_at ? new Date(alert.created_at).toLocaleString() : "Unknown time"}</time>
                            </button>
                        ))}
                    </div>
                )}
            </section>
            <AlertDetailModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
        </div>
    );
}

export default Notifications;
