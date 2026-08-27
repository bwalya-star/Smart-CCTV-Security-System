const API_URL = "http://localhost:5000";

function AlertCard({ alert }) {

    const imageUrl = alert.image_path
        ? `${API_URL}${alert.image_path}`
        : null;

    return (
        <div className="alert-card">

            <div className="alert-information">

                <h3>
                    {alert.label || "Security Event"}
                </h3>

                <p>
                    Status: {alert.status}
                </p>

                <p>
                    Confidence:{" "}
                    {alert.confidence
                        ? `${Math.round(
                            alert.confidence * 100
                        )}%`
                        : "N/A"}
                </p>

                <p>
                    {new Date(
                        alert.created_at
                    ).toLocaleString()}
                </p>

            </div>


            {imageUrl && (

                <img
                    src={imageUrl}
                    alt="Captured security event"
                    className="alert-image"
                />

            )}

        </div>
    );
}

export default AlertCard;