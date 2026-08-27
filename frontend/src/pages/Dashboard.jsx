import useAlerts from "../hooks/useAlerts";
import AlertCard from "../components/AlertCard";
import CameraPanel from "../components/CameraPanel";
import LatestCapture from "../components/LatestCapture";

function Dashboard({ user, onLogout }) {
    const { alerts, loading } = useAlerts();

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

            </div>

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
                        key={alert.id}
                        alert={alert}
                    />
                ))
            )}

        </div>
    );
}

export default Dashboard;