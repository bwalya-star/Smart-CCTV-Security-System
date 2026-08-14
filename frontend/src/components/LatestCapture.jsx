function LatestCapture({ alert }) {

    if (!alert) {
        return (
            <section className="latest-capture">

                <div className="panel-header">
                    <div>
                        <h2>Latest Capture</h2>
                        <p>No recent captures</p>
                    </div>
                </div>

                <div className="no-capture">
                    No image captured yet
                </div>

            </section>
        );
    }


    const imageName =
        alert.image_path
            ?.split("\\")
            .pop()
            ?.split("/")
            .pop();


    const imageUrl =
        `http://localhost:5000/uploads/${imageName}`;


    return (
        <section className="latest-capture">

            <div className="panel-header">

                <div>
                    <h2>Latest Capture</h2>
                    <p>Most recent security image</p>
                </div>

            </div>


            <div className="latest-image-container">

                <img
                    src={imageUrl}
                    alt="Latest security capture"
                    className="latest-image"
                />

            </div>


            <div className="capture-details">

                <div>
                    <strong>
                        {alert.label || "Unknown"}
                    </strong>

                    <span>
                        Detection
                    </span>
                </div>


                <div>
                    <strong>
                        {Math.round(
                            (alert.confidence || 0) * 100
                        )}%
                    </strong>

                    <span>
                        Confidence
                    </span>
                </div>

            </div>

        </section>
    );
}

export default LatestCapture;