import { useEffect, useState } from "react";
import {
    startRecording,
    stopRecording,
    getCameraStatus,
    getMotionDetectionSettings,
    updateMotionDetectionSettings
} from "../Services/api";
import CameraSchedule from "./CameraSchedule";


function CameraPanel({ token }) {

    const [recording, setRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [motionSettings, setMotionSettings] = useState(null);
    const [motionSaving, setMotionSaving] = useState(false);
    const [motionError, setMotionError] = useState("");
    const [failSafeTime, setFailSafeTime] = useState("18:00");
    const [failSafeEnabled, setFailSafeEnabled] = useState(false);


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

            try {
                const settings = await getMotionDetectionSettings(token);
                setMotionSettings(settings);
                setFailSafeTime(settings.failsafeTime);
                setFailSafeEnabled(settings.failsafeEnabled);
            } catch (error) {
                console.error("Motion detection settings error:", error);
                setMotionError("Unable to load motion detection settings");
            }
        }

        loadCameraStatus();

    }, [token]);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const settings = await getMotionDetectionSettings(token);
                setMotionSettings(settings);
            } catch (error) {
                console.error("Unable to refresh motion detection settings:", error);
            }
        }, 15000);

        return () => clearInterval(interval);
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

    async function saveMotionSettings(changes) {
        if (!motionSettings) {
            return;
        }

        setMotionSaving(true);
        setMotionError("");
        try {
            const updated = await updateMotionDetectionSettings(token, {
                enabled: changes.enabled ?? motionSettings.enabled,
                failsafeEnabled: changes.failsafeEnabled ?? failSafeEnabled,
                failsafeTime: changes.failsafeTime ?? failSafeTime,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || motionSettings.timeZone
            });
            setMotionSettings(updated);
            setFailSafeEnabled(updated.failsafeEnabled);
            setFailSafeTime(updated.failsafeTime);
        } catch (error) {
            console.error("Unable to update motion detection settings:", error);
            setMotionError(error.message || "Unable to update motion detection settings");
        } finally {
            setMotionSaving(false);
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

                <div className="motion-detection-controls">
                    <div className="motion-detection-heading">
                        <div>
                            <strong>Motion detection</strong>
                            <span>
                                {motionSettings?.enabled
                                    ? "Monitoring is enabled"
                                    : "Monitoring is paused"}
                            </span>
                        </div>
                        <button
                            className={`dashboard-button ${motionSettings?.enabled ? "dashboard-button-danger" : "dashboard-button-success"}`}
                            onClick={() => saveMotionSettings({ enabled: !motionSettings?.enabled })}
                            disabled={!motionSettings || motionSaving}
                            type="button"
                            aria-pressed={Boolean(motionSettings?.enabled)}
                        >
                            {motionSaving
                                ? "Saving..."
                                : motionSettings?.enabled
                                    ? "Disable detection"
                                    : "Enable detection"}
                        </button>
                    </div>

                    <div className="motion-failsafe">
                        <label className="motion-failsafe-toggle">
                            <input
                                type="checkbox"
                                checked={failSafeEnabled}
                                onChange={event => setFailSafeEnabled(event.target.checked)}
                                disabled={!motionSettings || motionSaving}
                            />
                            <span>Automatically enable detection if it is still off</span>
                        </label>
                        <div className="motion-failsafe-time">
                            <label htmlFor="motion-failsafe-time">Daily fail-safe time</label>
                            <input
                                id="motion-failsafe-time"
                                type="time"
                                value={failSafeTime}
                                onChange={event => setFailSafeTime(event.target.value)}
                                disabled={!motionSettings || motionSaving}
                            />
                            <button
                                className="dashboard-button"
                                onClick={() => saveMotionSettings({ failsafeEnabled: failSafeEnabled, failsafeTime: failSafeTime })}
                                disabled={!motionSettings || motionSaving}
                                type="button"
                            >
                                Save fail-safe
                            </button>
                        </div>
                        <small>
                            Uses {motionSettings?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone}.
                            When enabled, detection automatically turns on at this time if it was off.
                        </small>
                    </div>
                    {motionError && <p className="camera-error" role="alert">{motionError}</p>}
                </div>

            </div>

            <CameraSchedule token={token} />

        </section>

    );
}


export default CameraPanel;
