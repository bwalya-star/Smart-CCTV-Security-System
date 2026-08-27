function LatestCapture({ alert }) {

    if (!alert) {

        return (
            <section className="latest-capture">

                <h2>Latest Capture</h2>

                <p>
                    No captured images yet.
                </p>

            </section>
        );
    }


    const imageUrl = alert.image_path
        ? `http://localhost:5000${alert.image_path}`
        : null;


    return (
        <section className="latest-capture">

            <div className="panel-header">

                <div>
                    <h2>
                        Latest Capture
                    </h2>

                    <p>
                        Most recent security event
                    </p>
                </div>

            </div>


            {imageUrl ? (

                <img
                    src={imageUrl}
                    alt="Latest security capture"
                    className="latest-capture-image"
                />

            ) : (

                <p>
                    No image available.
                </p>

            )}


            <div className="capture-details">

                <p>
                    <strong>Status:</strong>{" "}
                    {alert.status}
                </p>

                <p>
                    <strong>Detection:</strong>{" "}
                    {alert.label || "Unknown"}
                </p>

                <p>
                    <strong>Confidence:</strong>{" "}
                    {alert.confidence
                        ? `${Math.round(
                            alert.confidence * 100
                        )}%`
                        : "N/A"}
                </p>

            </div>

        </section>
    );
}

export default LatestCapture;