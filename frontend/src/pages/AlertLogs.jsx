import { motion } from "framer-motion";
import AlertCard from "../components/AlertCard";
import EventTimeline from "../components/EventTimeline";

const MotionDiv = motion.div;

function AlertLogs({ alerts, loading }) {
    const statistics = [
        ["Total Alerts", alerts.length, "stat-neutral"],
        ["Threats", alerts.filter(alert => alert.status === "threat").length, "stat-danger"],
        ["Safe Events", alerts.filter(alert => alert.status === "safe").length, "stat-safe"],
        ["Known People", alerts.filter(alert => alert.alert_classification === "KNOWN_PERSON" || alert.identity_status === "known").length, "stat-known"],
        ["Unknown People", alerts.filter(alert => alert.alert_classification === "UNKNOWN_PERSON" || alert.identity_status === "unknown").length, "stat-warning"],
        ["Unidentified", alerts.filter(alert => alert.alert_classification === "UNIDENTIFIED_PERSON" || alert.identity_status === "unidentified").length, "stat-info"]
    ];

    if (loading) {
        return <div className="page-loading">Loading alert logs...</div>;
    }

    return (
        <div className="page-stack">
            <section className="page-intro">
                <div>
                    <span className="eyebrow">ANALYTICS</span>
                    <h2>Alert logs</h2>
                    <p>Review detection history and understand activity across your property.</p>
                </div>
                <span className="date-chip">Live data</span>
            </section>

            <div className="stats-grid">
                {statistics.map(([label, value, className], index) => (
                    <MotionDiv
                        className={`metric-card ${className}`}
                        key={label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.04 }}
                        whileHover={{ y: -3 }}
                    >
                        <span>{label}</span>
                        <strong>{value}</strong>
                    </MotionDiv>
                ))}
            </div>

            <EventTimeline alerts={alerts} />

            <section className="section-block">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">ARCHIVE</span>
                        <h2>Previous alerts</h2>
                    </div>
                    <span className="muted-label">{alerts.length} records</span>
                </div>
                {alerts.length === 0 ? (
                    <div className="empty-panel">No alerts recorded yet.</div>
                ) : (
                    alerts.map((alert, index) => (
                        <AlertCard
                            key={alert.id || `${alert.created_at}-${index}`}
                            alert={alert}
                        />
                    ))
                )}
            </section>
        </div>
    );
}

export default AlertLogs;
