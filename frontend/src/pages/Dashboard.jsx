import useAlerts from "../hooks/useAlerts";
import AlertCard from "../components/AlertCard";
import CameraPanel from "../components/CameraPanel";
import DevicePanel from "../components/DevicePanel";
import LatestCapture from "../components/LatestCapture";
import NotificationHistory from "../components/NotificationHistory";
import EventTimeline from "../components/EventTimeline";

function Dashboard({ user, token, onLogout }) {
    const {
        alerts,
        loading,
        liveAlert
    } = useAlerts(user?.id);

    if (loading) {
        return <h2>Loading...</h2>;
    }

    const totalAlerts = alerts.length;

    const threats = alerts.filter(
        alert => alert.status === "threat"
    ).length;

    const safeEvents = alerts.filter(
        alert => alert.status === "safe"
    ).length;

    const knownPeople = alerts.filter(
        alert =>
            alert.alert_classification === "KNOWN_PERSON" ||
            alert.identity_status === "known"
    ).length;

    const unknownPeople = alerts.filter(
        alert =>
            alert.alert_classification === "UNKNOWN_PERSON" ||
            alert.identity_status === "unknown"
    ).length;

    const unidentifiedPeople = alerts.filter(
        alert =>
            alert.alert_classification === "UNIDENTIFIED_PERSON" ||
            alert.identity_status === "unidentified"
    ).length;

    const notificationsSent = alerts.filter(
        alert => alert.notification_status === "sent"
    ).length;

    const notificationsSuppressed = alerts.filter(
        alert => alert.notification_status === "suppressed"
    ).length;

    const notificationFailures = alerts.filter(
        alert => alert.notification_status === "failed"
    ).length;

    let liveStatus = {
        label: "System Clear",
        icon: "🟢",
        className: "live-clear"
    };

    if (liveAlert) {
        const classification =
            liveAlert.alert_classification;

        const severity =
            liveAlert.severity;

        if (severity === "HIGH") {
            liveStatus = {
                label: "HIGH SEVERITY - Unknown Person",
                icon: "🔴",
                className: "live-threat"
            };
        } else {
            switch (classification) {
                case "KNOWN_PERSON":
                    liveStatus = {
                        label: `Known Person: ${
                            liveAlert.identity_name ||
                            liveAlert.face_recognition?.name ||
                            "Unknown"
                        }`,
                        icon: "🔵",
                        className: "live-known"
                    };
                    break;

                case "UNKNOWN_PERSON":
                    liveStatus = {
                        label: "Unknown Person Detected",
                        icon: "🟠",
                        className: "live-unknown"
                    };
                    break;

                case "UNIDENTIFIED_PERSON":
                    liveStatus = {
                        label: "Person Unidentified",
                        icon: "🟣",
                        className: "live-unidentified"
                    };
                    break;

                case "NO_PERSON":
                    liveStatus = {
                        label: "System Clear",
                        icon: "🟢",
                        className: "live-clear"
                    };
                    break;

                default:
                    liveStatus = {
                        label: "Security Event",
                        icon: "🔴",
                        className: "live-threat"
                    };
            }
        }
    }

    return (
        <div className="dashboard">

            <h1 className="dashboard-title">
                🛡 Smart CCTV Security Dashboard
            </h1>
            <div className="dashboard-user">

            <div>
                <strong>
                    {user?.name}
                </strong>

                <span>
                    {user?.email}
                </span>
            </div>

            <button
                onClick={onLogout}
                className="logout-button"
            >
                Logout
            </button>

        </div>

            <div className="status-banner">
                🟢 System Online
            </div>

            <div
                className={`live-threat-indicator ${liveStatus.className}`}
            >

                <div className="live-indicator-icon">
                    {liveStatus.icon}
                </div>

                <div className="live-indicator-content">
                    <span className="live-indicator-title">
                        LIVE SECURITY STATUS
                    </span>

                    <span className="live-indicator-status">
                        {liveStatus.label}
                    </span>
                </div>

                <div className="live-pulse"></div>

            </div>

            <div className="stats-container">

                <div className="stat-card">
                    <h2>{totalAlerts}</h2>
                    <p>Total Alerts</p>
                </div>

                <div className="stat-card danger">
                    <h2>{threats}</h2>
                    <p>Threats</p>
                </div>

                <div className="stat-card safe">
                    <h2>{safeEvents}</h2>
                    <p>Safe Events</p>
                </div>

                <div className="stat-card known">
                    <h2>{knownPeople}</h2>
                    <p>Known People</p>
                </div>

                <div className="stat-card unknown">
                    <h2>{unknownPeople}</h2>
                    <p>Unknown People</p>
                </div>

                <div className="stat-card unidentified">
                    <h2>{unidentifiedPeople}</h2>
                    <p>Unidentified</p>
                </div>

                <div className="stat-card notification">
                    <h2>{notificationsSent}</h2>
                    <p>Notifications Sent</p>
                </div>

                <div className="stat-card suppressed">
                    <h2>{notificationsSuppressed}</h2>
                    <p>Notifications Suppressed</p>
                </div>

                <div className="stat-card notification-failure">
                    <h2>{notificationFailures}</h2>
                    <p>Notification Failures</p>
                </div>

            </div>

            <DevicePanel
                token={token}
            />

            <div className="camera-grid">

                <CameraPanel />

                <LatestCapture
                    alert={alerts[0]}
                />

            </div>

            <h2>Recent Alerts</h2>

            {alerts.length === 0 ? (
                <p>No alerts found.</p>
            ) : (
                alerts.map(alert => (
                    <AlertCard
                        key={
                            alert.id ||
                            `${alert.created_at}-${alert.device_id}`
                        }
                        alert={alert}
                    />
                ))
            )}

            <NotificationHistory alerts={alerts} />

            <EventTimeline alerts={alerts} />

        </div>
    );
}

export default Dashboard;