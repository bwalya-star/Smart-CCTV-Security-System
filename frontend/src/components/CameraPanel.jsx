import { useEffect, useState } from "react";
import {
    startRecording,
    stopRecording,
    getCameraStatus
} from "../Services/api";
import CameraSchedule from "./CameraSchedule";


function CameraPanel({ token }) {

    const [recording, setRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    useEffect(() => {

        async function loadCameraStatus() {

            try {

                const data =
                    await getCameraStatus(token);

                setRecording(
                    data.recording
                );

            } catch (error) {

                console.error(
                    "Camera status error:",
                    error
                );

                setError(
                    "Unable to connect to camera service"
                );
            }
        }

        loadCameraStatus();

    }, [token]);


    async function handleStartRecording() {

        setLoading(true);
        setError("");

        try {

            const data =
                await startRecording(token);

            setRecording(
                data.recording
            );

        } catch (error) {

            console.error(error);

            setError(
                "Failed to start recording"
            );

        } finally {

            setLoading(false);

        }
    }


    async function handleStopRecording() {

        setLoading(true);
        setError("");

        try {

            const data =
                await stopRecording(token);

            setRecording(
                data.recording
            );

        } catch (error) {

            console.error(error);

            setError(
                "Failed to stop recording"
            );

        } finally {

            setLoading(false);

        }
    }


    return (

        <section className="camera-panel">

            <div className="panel-header">

                <div>

                    <h2>
                        Camera View
                    </h2>

                    <p>
                        Security Camera
                    </p>

                </div>


                <div
                    className={
                        recording
                            ? "recording-status active"
                            : "recording-status"
                    }
                >

                    <span></span>

                    {recording
                        ? "Recording"
                        : "Recording Off"}

                </div>

            </div>


            <div className="camera-view">

                <img
                    src="http://127.0.0.1:8000/video"
                    alt="Live security camera"
                    className="camera-feed"
                />

            </div>


            {error && (

                <p className="camera-error">
                    {error}
                </p>

            )}


            <div className="camera-controls">

                {!recording ? (

                    <button
                            className="dashboard-button dashboard-button-primary start-recording"
                            onClick={
                                handleStartRecording
                            }
                            disabled={loading}
                        >

                            {loading
                                ? "Starting..."
                                : "▶ Start Recording"}

                    </button>

                ) : (

                    <button
                        className="dashboard-button dashboard-button-danger stop-recording"
                        onClick={
                            handleStopRecording
                        }
                        disabled={loading}
                    >

                        {loading
                            ? "Stopping..."
                            : "■ Stop Recording"}

                    </button>

                )}

            </div>

            <CameraSchedule token={token} />

        </section>

    );
}


export default CameraPanel;
