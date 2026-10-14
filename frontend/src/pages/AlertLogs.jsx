import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Search, ShieldAlert, ShieldCheck, UserCheck, UserX, HelpCircle, Trash2 } from "lucide-react";
import AlertDetailModal from "../components/AlertDetailModal";
import { deleteAlerts } from "../Services/api";

const MotionDiv = motion.div;

function AlertLogs({ alerts, loading, token, removeAlerts }) {
    const [activeCategory, setActiveCategory] = useState("total");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [selectedAlertIds, setSelectedAlertIds] = useState([]);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const statistics = [
        ["Total Alerts", "total", alerts, "stat-neutral", <Layers size={16} />],
        ["Threats", "threats", alerts.filter(alert => alert.status === "threat"), "stat-danger", <ShieldAlert size={16} />],
        ["Safe Events", "safe", alerts.filter(alert => alert.status === "safe"), "stat-safe", <ShieldCheck size={16} />],
        ["Known People", "known", alerts.filter(alert => alert.alert_classification === "KNOWN_PERSON" || alert.identity_status === "known"), "stat-known", <UserCheck size={16} />],
        ["Unknown People", "unknown", alerts.filter(alert => alert.alert_classification === "UNKNOWN_PERSON" || alert.identity_status === "unknown"), "stat-warning", <UserX size={16} />],
        ["Unidentified", "unidentified", alerts.filter(alert => alert.alert_classification === "UNIDENTIFIED_PERSON" || alert.identity_status === "unidentified"), "stat-info", <HelpCircle size={16} />]
    ];

    const selectedCategory = statistics.find(item => item[1] === activeCategory);
    const categoryAlerts = selectedCategory ? selectedCategory[2] : alerts;
    const query = searchTerm.trim().toLowerCase();
    const filteredAlerts = query
        ? categoryAlerts.filter(alert => [
            alert.created_at,
            alert.status,
            alert.severity,
            alert.alert_classification,
            alert.identity_name,
            alert.identity_status,
            alert.notification_status,
            alert.notification_channel,
            alert.detected ? "person detected" : "no person"
        ].some(value => String(value || "").toLowerCase().includes(query)))
        : categoryAlerts;
    const filteredIds = filteredAlerts
        .map(alert => Number(alert.id))
        .filter(id => Number.isSafeInteger(id) && id > 0);
    const allFilteredSelected = filteredIds.length > 0 &&
        filteredIds.every(id => selectedAlertIds.includes(id));

    function toggleAlertSelection(id) {
        setSelectedAlertIds(current => current.includes(id)
            ? current.filter(selectedId => selectedId !== id)
            : [...current, id]);
        setDeleteError("");
    }

    function toggleFilteredSelection() {
        setSelectedAlertIds(current => allFilteredSelected
            ? current.filter(id => !filteredIds.includes(id))
            : [...new Set([...current, ...filteredIds])]);
        setDeleteError("");
    }

    async function handleDeleteSelected() {
        const selectedIds = selectedAlertIds.filter(id => alerts.some(alert => Number(alert.id) === id));
        if (selectedIds.length === 0 || deleting) {
            return;
        }

        if (!window.confirm(`Delete ${selectedIds.length} selected alert${selectedIds.length === 1 ? "" : "s"}? This cannot be undone.`)) {
            return;
        }

        setDeleting(true);
        setDeleteError("");
        try {
            await deleteAlerts(token, selectedIds);
            removeAlerts(selectedIds);
            setSelectedAlertIds(current => current.filter(id => !selectedIds.includes(id)));
            setSelectedAlert(current => current && selectedIds.includes(Number(current.id)) ? null : current);
        } catch (error) {
            setDeleteError(error.message || "Unable to delete selected alerts.");
        } finally {
            setDeleting(false);
        }
    }

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
                {statistics.map(([label, category, categoryAlerts, className, icon], index) => (
                    <MotionDiv
                        className={`metric-card ${className} ${activeCategory === category ? "metric-card-selected" : ""}`}
                        key={label}
                        onClick={() => setActiveCategory(category)}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.04 }}
                        whileHover={{ y: -3 }}
                        role="button"
                        tabIndex="0"
                        onKeyDown={event => {
                            if (event.key === "Enter" || event.key === " ") {
                                setActiveCategory(category);
                            }
                        }}
                    >
                        <div className={`metric-icon ${className.replace("stat-", "icon-")}`}>{icon}</div>
                        <span>{label}</span>
                        <strong>{categoryAlerts.length}</strong>
                    </MotionDiv>
                ))}
            </div>

            <section className="section-block">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">ARCHIVE</span>
                        <h2>{statistics.find(item => item[1] === activeCategory)?.[0] || "Alert records"}</h2>
                    </div>
                    <div className="alert-archive-actions">
                        <span className="muted-label">{filteredAlerts.length} records</span>
                        <button
                            className="archive-selection-button"
                            onClick={toggleFilteredSelection}
                            type="button"
                            disabled={filteredIds.length === 0 || deleting}
                        >
                            {allFilteredSelected ? "Deselect all" : "Select all"}
                        </button>
                        {selectedAlertIds.length > 0 && (
                            <button
                                className="archive-delete-button"
                                onClick={handleDeleteSelected}
                                type="button"
                                disabled={deleting}
                            >
                                <Trash2 size={15} />
                                {deleting ? "Deleting..." : `Delete selected (${selectedAlertIds.length})`}
                            </button>
                        )}
                    </div>
                </div>

                <div className="record-search">
                    <Search size={18} />
                    <input
                        value={searchTerm}
                        onChange={event => setSearchTerm(event.target.value)}
                        placeholder="Search date, identity, severity, status..."
                        aria-label="Search alert records"
                    />
                    <button type="button" onClick={() => setSearchTerm("")}>Clear</button>
                </div>

                {deleteError && <p className="archive-delete-error" role="alert">{deleteError}</p>}

                {filteredAlerts.length === 0 ? (
                    <div className="empty-panel"><span>No matching alert records found.</span></div>
                ) : (
                    <div className="alert-record-list">
                        {filteredAlerts.map((alert, index) => (
                            <div
                                className="alert-record-row"
                                key={alert.id || `${alert.created_at}-${index}`}
                            >
                                <input
                                    className="alert-record-checkbox"
                                    type="checkbox"
                                    aria-label={`Select alert from ${alert.created_at ? new Date(alert.created_at).toLocaleString() : "unknown time"}`}
                                    checked={selectedAlertIds.includes(Number(alert.id))}
                                    disabled={!Number.isSafeInteger(Number(alert.id)) || Number(alert.id) < 1 || deleting}
                                    onChange={() => toggleAlertSelection(Number(alert.id))}
                                />
                                <span className={`record-status-dot ${alert.status === "threat" ? "record-threat" : "record-safe"}`}></span>
                                <button
                                    className="alert-record-main alert-record-open"
                                    onClick={() => setSelectedAlert(alert)}
                                    type="button"
                                >
                                    <strong>{alert.detected ? "Person detected" : "No person detected"}</strong>
                                    <small>{alert.alert_classification || "Security event"}</small>
                                </button>
                                <span className="alert-record-value">{alert.confidence !== null && alert.confidence !== undefined ? `${(Number(alert.confidence) * 100).toFixed(1)}%` : "N/A"}</span>
                                <span className="alert-record-value">{alert.status || "Unknown"}</span>
                                <time>{alert.created_at ? new Date(alert.created_at).toLocaleString() : "Unknown time"}</time>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <AlertDetailModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
        </div>
    );
}

export default AlertLogs;
