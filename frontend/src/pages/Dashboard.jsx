import AlertCard from "../components/AlertCard";
import CameraPanel from "../components/CameraPanel";
import DevicePanel from "../components/DevicePanel";
import LatestCapture from "../components/LatestCapture";
import RecordingLibrary from "../components/RecordingLibrary";

function Dashboard({ alerts, loading, liveAlert, token }) {
    if (loading) {
        return <div className="page-loading">Loading security overview...</div>;
    }

    const currentAlert = liveAlert || alerts[0];

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

            <DevicePanel token={token} view="dashboard" />

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

            <RecordingLibrary token={token} />
        </div>
    );
}

export default Dashboard;
