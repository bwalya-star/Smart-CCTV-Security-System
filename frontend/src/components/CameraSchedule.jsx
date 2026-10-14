import { useEffect, useState } from "react";
import { getRecordingSchedule, saveRecordingSchedule } from "../Services/api";

const WEEKDAYS = [
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
    { value: 0, label: "Sun" }
];

function getDefaultSchedule() {
    return {
        enabled: false,
        startTime: "20:00",
        endTime: "06:00",
        days: WEEKDAYS.map(day => day.value),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    };
}

function CameraSchedule({ token }) {
    const [schedule, setSchedule] = useState(getDefaultSchedule);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadSchedule() {
            try {
                const data = await getRecordingSchedule(token);
                if (!cancelled && data.schedule) {
                    setSchedule({
                        ...getDefaultSchedule(),
                        ...data.schedule,
                        timeZone: data.schedule.timeZone || getDefaultSchedule().timeZone
                    });
                }
            } catch (loadError) {
                if (!cancelled) {
                    setError(loadError.message || "Unable to load recording schedule.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadSchedule();
        return () => {
            cancelled = true;
        };
    }, [token]);

    function updateSchedule(field, value) {
        setSchedule(current => ({ ...current, [field]: value }));
        setMessage("");
    }

    function toggleDay(day) {
        const days = schedule.days.includes(day)
            ? schedule.days.filter(value => value !== day)
            : [...schedule.days, day];
        updateSchedule("days", days);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const data = await saveRecordingSchedule(token, schedule);
            setSchedule(current => ({ ...current, ...data.schedule }));
            setMessage("Recording schedule saved.");
        } catch (saveError) {
            setError(saveError.message || "Unable to save recording schedule.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form className="camera-schedule" onSubmit={handleSubmit}>
            <div className="schedule-heading">
                <div>
                    <h3>Automatic recording</h3>
                    <p>Choose when this camera should record each week.</p>
                </div>
                <label className="schedule-enabled">
                    <input
                        type="checkbox"
                        checked={schedule.enabled}
                        onChange={event => updateSchedule("enabled", event.target.checked)}
                        disabled={loading || saving}
                    />
                    <span>{schedule.enabled ? "Enabled" : "Disabled"}</span>
                </label>
            </div>

            {loading ? (
                <p className="schedule-feedback">Loading schedule...</p>
            ) : (
                <>
                    <div className="schedule-time-fields">
                        <label>
                            Start time
                            <input
                                type="time"
                                value={schedule.startTime}
                                onChange={event => updateSchedule("startTime", event.target.value)}
                                required
                                disabled={saving}
                            />
                        </label>
                        <label>
                            End time
                            <input
                                type="time"
                                value={schedule.endTime}
                                onChange={event => updateSchedule("endTime", event.target.value)}
                                required
                                disabled={saving}
                            />
                        </label>
                    </div>

                    <fieldset className="schedule-weekdays">
                        <legend>Repeat on</legend>
                        <div>
                            {WEEKDAYS.map(day => (
                                <label className="schedule-day" key={day.value}>
                                    <input
                                        type="checkbox"
                                        checked={schedule.days.includes(day.value)}
                                        onChange={() => toggleDay(day.value)}
                                        disabled={saving}
                                    />
                                    <span>{day.label}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <p className="schedule-timezone">Times use {schedule.timeZone}.</p>
                    {error && <p className="schedule-feedback error" role="alert">{error}</p>}
                    {message && <p className="schedule-feedback success" role="status">{message}</p>}
                    <button className="dashboard-button dashboard-button-primary schedule-save" type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save schedule"}
                    </button>
                </>
            )}

            {loading && error && <p className="schedule-feedback error" role="alert">{error}</p>}
        </form>
    );
}

export default CameraSchedule;
