import { useEffect, useRef, useState } from "react";
import { FastForward, Play, RefreshCw, SkipBack, SkipForward, Trash2, Video, X } from "lucide-react";
import { deleteRecordings, getRecordings } from "../Services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function formatSize(bytes) {
    if (bytes < 1024 * 1024) {
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function RecordingLibrary({ token }) {
    const [recordings, setRecordings] = useState([]);
    const [selectedRecording, setSelectedRecording] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [playbackError, setPlaybackError] = useState("");
    const [playbackRate, setPlaybackRate] = useState(1);
    const [refreshVersion, setRefreshVersion] = useState(0);
    const [selectedFilenames, setSelectedFilenames] = useState([]);
    const [deleting, setDeleting] = useState(false);
    const [deleteFeedback, setDeleteFeedback] = useState("");
    const videoRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        async function loadRecordings() {
            try {
                const data = await getRecordings(token);
                if (!cancelled) {
                    setRecordings(data.recordings || []);
                    setError("");
                    setSelectedFilenames(current => current.filter(filename =>
                        data.recordings.some(recording => recording.filename === filename && !recording.active)
                    ));
                }
            } catch (loadError) {
                if (!cancelled) {
                    setError(loadError.message || "Unable to load recordings.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadRecordings();
        const interval = window.setInterval(loadRecordings, 30000);
        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [token, refreshVersion]);

    useEffect(() => {
        if (!selectedRecording) {
            return undefined;
        }

        function closeOnEscape(event) {
            if (event.key === "Escape") {
                setSelectedRecording(null);
            }
        }

        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [selectedRecording]);

    function skip(seconds) {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(
                0,
                Math.min(videoRef.current.duration || Infinity, videoRef.current.currentTime + seconds)
            );
        }
    }

    function changePlaybackRate(rate) {
        setPlaybackRate(rate);
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
        }
    }

    const deletableRecordings = recordings.filter(recording => !recording.active);
    const allDeletableSelected = deletableRecordings.length > 0 &&
        deletableRecordings.every(recording => selectedFilenames.includes(recording.filename));

    function toggleRecordingSelection(filename) {
        setSelectedFilenames(current => current.includes(filename)
            ? current.filter(selectedFilename => selectedFilename !== filename)
            : [...current, filename]);
        setDeleteFeedback("");
    }

    function toggleAllRecordings() {
        setSelectedFilenames(current => allDeletableSelected
            ? current.filter(filename => !deletableRecordings.some(recording => recording.filename === filename))
            : [...new Set([...current, ...deletableRecordings.map(recording => recording.filename)])]);
        setDeleteFeedback("");
    }

    async function handleDeleteSelected() {
        const filenames = selectedFilenames.filter(filename =>
            deletableRecordings.some(recording => recording.filename === filename)
        );
        if (filenames.length === 0 || deleting) {
            return;
        }

        if (!window.confirm(`Delete ${filenames.length} selected recording${filenames.length === 1 ? "" : "s"}? This cannot be undone.`)) {
            return;
        }

        setDeleting(true);
        setDeleteFeedback("");
        try {
            const result = await deleteRecordings(token, filenames);
            const deletedNames = result.deleted || [];
            setRecordings(current => current.filter(recording => !deletedNames.includes(recording.filename)));
            setSelectedFilenames(current => current.filter(filename => !deletedNames.includes(filename)));
            if (selectedRecording && deletedNames.includes(selectedRecording.filename)) {
                setSelectedRecording(null);
            }
            if (result.failed?.length) {
                setDeleteFeedback(`Deleted ${deletedNames.length}; could not delete ${result.failed.length}: ${result.failed.map(item => item.filename).join(", ")}`);
            } else {
                setDeleteFeedback(`Deleted ${deletedNames.length} recording${deletedNames.length === 1 ? "" : "s"}.`);
            }
        } catch (deleteError) {
            setDeleteFeedback(deleteError.message || "Unable to delete selected recordings.");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <section className="section-block recordings-section">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">CAMERA ARCHIVE</span>
                        <h2>Recordings</h2>
                    </div>
                    <div className="recording-heading-actions">
                        <span className="muted-label">{recordings.length} saved</span>
                        <button
                            type="button"
                            className="recording-refresh"
                            onClick={toggleAllRecordings}
                            disabled={deletableRecordings.length === 0 || deleting}
                        >
                            {allDeletableSelected ? "Deselect all" : "Select all"}
                        </button>
                        {selectedFilenames.length > 0 && (
                            <button
                                type="button"
                                className="recording-delete-button"
                                onClick={handleDeleteSelected}
                                disabled={deleting}
                            >
                                <Trash2 size={14} />
                                {deleting ? "Deleting..." : `Delete (${selectedFilenames.length})`}
                            </button>
                        )}
                        <button
                            type="button"
                            className="recording-refresh"
                            onClick={() => setRefreshVersion(version => version + 1)}
                            aria-label="Refresh recordings"
                        >
                            <RefreshCw size={15} />
                            Refresh
                        </button>
                    </div>
                </div>

                {deleteFeedback && <p className="recording-delete-feedback" role="status">{deleteFeedback}</p>}

                {loading ? (
                    <div className="empty-panel">Loading recordings...</div>
                ) : error ? (
                    <div className="empty-panel recording-error" role="alert">{error}</div>
                ) : recordings.length === 0 ? (
                    <div className="empty-panel">No recordings yet. Start a recording or set an automatic schedule.</div>
                ) : (
                    <ul className="recording-list">
                        {recordings.map(recording => (
                            <li className={`recording-list-item-row ${recording.active ? "recording-current" : ""}`} key={recording.id}>
                                <input
                                    type="checkbox"
                                    className="recording-checkbox"
                                    aria-label={`Select recording ${recording.filename}`}
                                    checked={selectedFilenames.includes(recording.filename)}
                                    disabled={recording.active || deleting}
                                    onChange={() => toggleRecordingSelection(recording.filename)}
                                />
                                <button
                                    type="button"
                                    className="recording-list-item"
                                    onClick={() => {
                                        setPlaybackError("");
                                        setPlaybackRate(1);
                                        setSelectedRecording(recording);
                                    }}
                                >
                                    <span className="recording-file-icon"><Video size={19} /></span>
                                    <span className="recording-list-copy">
                                        <strong>{new Date(recording.createdAt).toLocaleString()}</strong>
                                        <small>{recording.filename} · {formatSize(recording.size)}{recording.active ? " · Recording now" : ""}</small>
                                    </span>
                                    <span className="recording-play"><Play size={16} fill="currentColor" /> Play</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {selectedRecording && (
                <div
                    className="recording-modal-backdrop"
                    onMouseDown={event => {
                        if (event.target === event.currentTarget) {
                            setSelectedRecording(null);
                        }
                    }}
                >
                    <section className="recording-modal" role="dialog" aria-modal="true" aria-labelledby="recording-modal-title">
                        <div className="recording-modal-header">
                            <div>
                                <span className="eyebrow">PLAYBACK</span>
                                <h2 id="recording-modal-title">{new Date(selectedRecording.createdAt).toLocaleString()}</h2>
                                <p>{selectedRecording.filename}</p>
                            </div>
                            <button
                                type="button"
                                className="alert-modal-close"
                                onClick={() => setSelectedRecording(null)}
                                aria-label="Close recording"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <video
                            ref={videoRef}
                            className="recording-video"
                            src={`${API_URL}${selectedRecording.url}`}
                            controls
                            playsInline
                            onError={() => setPlaybackError("This video format is not supported by your browser. You can download the recording to view it in a media player.")}
                        />
                        {playbackError && (
                            <div className="recording-playback-error" role="alert">
                                {playbackError}{" "}
                                <a href={`${API_URL}${selectedRecording.url}`} download={selectedRecording.filename}>Download recording</a>
                            </div>
                        )}

                        <div className="recording-playback-tools">
                            <button type="button" onClick={() => skip(-10)} aria-label="Go back 10 seconds">
                                <SkipBack size={17} /> 10 sec
                            </button>
                            <button type="button" onClick={() => skip(10)} aria-label="Go forward 10 seconds">
                                <SkipForward size={17} /> 10 sec
                            </button>
                            <label>
                                <FastForward size={16} />
                                <span>Speed</span>
                                <select value={playbackRate} onChange={event => changePlaybackRate(Number(event.target.value))}>
                                    {[0.5, 1, 1.25, 1.5, 2].map(rate => (
                                        <option key={rate} value={rate}>{rate}×</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}

export default RecordingLibrary;
