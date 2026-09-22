import { ShieldAlert, UserCheck, Eye, ShieldCheck } from "lucide-react";
import AlertCard from "../components/AlertCard";
import CameraPanel from "../components/CameraPanel";
import DevicePanel from "../components/DevicePanel";
import LatestCapture from "../components/LatestCapture";

function Dashboard({ alerts, loading, liveAlert, token }) {
    if (loading) {
        return <div className="page-loading">Loading security overview...</div>;
    }

    const currentAlert = liveAlert || alerts[0];
    const liveStatus = currentAlert?.severity === "HIGH"
        ? { label: "High severity event detected", icon: <ShieldAlert size={26} />, className: "live-threat" }
        : currentAlert?.alert_classification === "KNOWN_PERSON"
            ? { label: `Known person: ${currentAlert.identity_name || "Recognized"}`, icon: <UserCheck size={26} />, className: "live-known" }
            : currentAlert
                ? { label: "Security activity being monitored", icon: <Eye size={26} />, className: "live-unknown" }
                : { label: "No active security events", icon: <ShieldCheck size={26} />, className: "live-clear" };

    return (
        <div className="page-stack overview-page">
            <section className="status-banner">
                <div>
                    <span className="eyebrow">SYSTEM STATUS</span>
                    <strong>System Online</strong>
                    <p>All connected security services are responding normally.</p>
                </div>
                <span className="online-indicator"><span className="connection-dot"></span>Operational</span>
            </section>

            <section className={`live-threat-indicator ${liveStatus.className}`}>
                <div className="live-indicator-icon">{liveStatus.icon}</div>
                <div className="live-indicator-content">
                    <span className="live-indicator-title">LIVE SECURITY STATUS</span>
                    <span className="live-indicator-status">{liveStatus.label}</span>
                </div>
                <div className="live-pulse"></div>
            </section>

            <DevicePanel token={token} />

            <div className="camera-grid">
                <CameraPanel token={token} />
                <LatestCapture alert={alerts[0]} />
            </div>

            <section className="section-block recent-alert-section">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">MOST RECENT</span>
                        <h2>Recent alert</h2>
                    </div>
                    <span className="muted-label">Live feed</span>
                </div>
                {currentAlert ? <AlertCard alert={currentAlert} /> : <div className="empty-panel">No recent alerts found.</div>}
            </section>
        </div>
    );
}

export default Dashboard;
