import { X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AlertDetailModal({ alert, onClose }) {
    if (!alert) {
        return null;
    }

    return (
        <div className="alert-modal-backdrop" onMouseDown={event => {
            if (event.target === event.currentTarget) {
                onClose();
            }
        }}>
            <div className="alert-detail-modal" role="dialog" aria-modal="true" aria-labelledby="alert-detail-title">
                <div className="alert-modal-header">
                    <div>
                        <span className="eyebrow">ALERT DETAILS</span>
                        <h2 id="alert-detail-title">{alert.alert_classification || "Security event"}</h2>
                    </div>
                    <button className="alert-modal-close" onClick={onClose} type="button" aria-label="Close alert details">
                        <X size={18} />
                    </button>
                </div>

                {alert.image_path && (
                    <img
                        className="alert-detail-image"
                        src={`${API_URL}${alert.image_path}`}
                        alt="Security event capture"
                    />
                )}

                <div className="alert-detail-grid">
                    <div><span>Detection</span><strong>{alert.detected ? "Person detected" : "No person"}</strong></div>
                    <div><span>Confidence</span><strong>{alert.confidence !== null && alert.confidence !== undefined ? `${(Number(alert.confidence) * 100).toFixed(1)}%` : "N/A"}</strong></div>
                    <div><span>Status</span><strong>{alert.status || "Unknown"}</strong></div>
                    <div><span>Severity</span><strong>{alert.severity || "UNKNOWN"}</strong></div>
                    <div><span>Identity</span><strong>{alert.identity_name || "Unknown"}</strong></div>
                    <div><span>Identity status</span><strong>{alert.identity_status || "not_checked"}</strong></div>
                    <div><span>Face similarity</span><strong>{alert.face_similarity !== null && alert.face_similarity !== undefined ? `${(Number(alert.face_similarity) * 100).toFixed(1)}%` : "N/A"}</strong></div>
                    <div><span>Notification</span><strong>{alert.notification_status || "not_required"}</strong></div>
                    <div><span>Date and time</span><strong>{alert.created_at ? new Date(alert.created_at).toLocaleString() : "Unknown time"}</strong></div>
                </div>
            </div>
        </div>
    );
}

export default AlertDetailModal;
