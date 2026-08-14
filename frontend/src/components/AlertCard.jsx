function AlertCard({ alert }) {

    return (
        <div className="alert-card">

            <div className="alert-header">

                <h3>
                    {alert.status === "threat"
                        ? "⚠ Threat Detected"
                        : "✓ Safe Event"}
                </h3>

            </div>

            <p>
                <strong>Detection:</strong>{" "}
                {alert.detected ? "Person Detected" : "No Person"}
            </p>

            <p>
                <strong>Confidence:</strong>{" "}
                {(alert.confidence * 100).toFixed(0)}%
            </p>

            <p>
                <strong>Image:</strong>{" "}
                {alert.image_path}
            </p>

            <p>
                <strong>Timestamp:</strong>{" "}
                {new Date(alert.created_at).toLocaleString()}
            </p>

        </div>
    );
}

export default AlertCard;