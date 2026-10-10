import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
    createDevice,
    deleteDevice,
    getDevices,
    updateDeviceStatus
} from "../Services/api";

function DevicePanel({ token, view = "profile" }) {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [busyDeviceId, setBusyDeviceId] = useState(null);
    const [openDeviceMenuId, setOpenDeviceMenuId] = useState(null);
    const [savingDevice, setSavingDevice] = useState(false);
    const [form, setForm] = useState({ device_name: "", device_code: "", device_secret: "" });
    const isDashboard = view === "dashboard";

    useEffect(() => {
        async function loadDevices() {
            try {
                setLoading(true);
                setError("");
                setDevices(await getDevices(token));
            } catch (loadError) {
                console.error("Device loading error:", loadError);
                setError("Unable to load CCTV devices");
            } finally {
                setLoading(false);
            }
        }

        if (token) loadDevices();
    }, [token]);

    async function handleStatusChange(device) {
        setError("");
        setNotice("");
        setBusyDeviceId(device.id);
        try {
            const data = await updateDeviceStatus(token, device.id, !device.is_active);
            setDevices(current => current.map(item => item.id === device.id ? data.device : item));
            setNotice(`${device.device_name} ${data.device.is_active ? "activated" : "deactivated"}.`);
            setOpenDeviceMenuId(null);
        } catch (statusError) {
            setError(statusError.message || "Failed to update device status");
        } finally {
            setBusyDeviceId(null);
        }
    }

    async function handleRemove(device) {
        if (!window.confirm(`Remove ${device.device_name} from your account?`)) return;
        setError("");
        setNotice("");
        setBusyDeviceId(device.id);
        try {
            await deleteDevice(token, device.id);
            setDevices(current => current.filter(item => item.id !== device.id));
            setNotice(`${device.device_name} was removed.`);
        } catch (removeError) {
            setError(removeError.message || "Failed to remove device");
        } finally {
            setBusyDeviceId(null);
        }
    }

    async function handleAddDevice(event) {
        event.preventDefault();
        setError("");
        setNotice("");
        setSavingDevice(true);
        try {
            const data = await createDevice(token, form);
            setDevices(current => [data.device, ...current]);
            setForm({ device_name: "", device_code: "", device_secret: "" });
            setNotice("CCTV device added and activated.");
        } catch (createError) {
            setError(createError.message || "Failed to add device");
        } finally {
            setSavingDevice(false);
        }
    }

    const activeDevices = devices.filter(device => Boolean(device.is_active));

    if (loading) {
        return <section className={`device-panel ${isDashboard ? "device-dashboard" : ""}`}><h2>CCTV Devices</h2><p>Loading devices...</p></section>;
    }

    if (isDashboard) {
        return (
            <section className="device-panel device-dashboard">
                <details className="profile-card device-card-section device-dropdown">
                    <summary className="device-dropdown-summary">
                        <span className="device-dropdown-title device-dashboard-title">
                            <strong>CCTV Devices</strong>
                        </span>
                    </summary>
                    {error ? <p className="device-feedback error">{error}</p> : (
                        activeDevices.length ? (
                            <ul className="device-dropdown-list">
                                {activeDevices.map(device => (
                                    <li key={device.id}>
                                        <span className="device-row-info">
                                            <strong>{device.device_name}</strong>
                                            <small>{device.device_code}</small>
                                        </span>
                                        <span className="device-live-indicator"><span></span>Live</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="device-empty">No active CCTV devices.</p>
                    )}
                </details>
            </section>
        );
    }

    return (
        <section className="device-panel device-management profile-grid">
            <section className="profile-card device-card-section device-list-section">
                <div className="device-section-heading">
                    <div>
                        <span className="eyebrow">SECURITY HARDWARE</span>
                        <h2>REGISTERED CCTV Devices</h2>
                    </div>
                </div>
                <details className="device-dropdown">
                    <summary className="device-dropdown-summary">
                        <span className="device-dropdown-title">
                            <strong>Manage connected devices</strong>
                            <small>View status and update device access</small>
                        </span>
                    </summary>
                    {error && <p className="device-feedback error" role="alert">{error}</p>}
                    {notice && <p className="device-feedback success" role="status">{notice}</p>}
                    {devices.length === 0 ? <p className="device-empty">No CCTV devices registered yet.</p> : (
                        <ul className="device-dropdown-list device-profile-list">
                            {devices.map(device => (
                                <li key={device.id}>
                                    <span className="device-row-info">
                                        <strong>{device.device_name}</strong>
                                        <small>{device.device_code}</small>
                                    </span>
                                    <div className="device-action-menu">
                                        <button
                                            className="device-action-trigger"
                                            type="button"
                                            aria-label={`Actions for ${device.device_name}`}
                                            aria-expanded={openDeviceMenuId === device.id}
                                            aria-haspopup="menu"
                                            onClick={() => setOpenDeviceMenuId(current => current === device.id ? null : device.id)}
                                        >
                                            Actions <ChevronDown size={14} aria-hidden="true" />
                                        </button>
                                        {openDeviceMenuId === device.id && <div className="device-action-menu-items" role="menu">
                                            <button
                                                className={`device-menu-button device-menu-status ${device.is_active ? "active" : ""}`}
                                                type="button"
                                                role="menuitem"
                                                disabled
                                            >
                                                <span></span>{device.is_active ? "Active" : "Inactive"}
                                            </button>
                                            <button
                                                className="device-menu-button"
                                                type="button"
                                                role="menuitem"
                                                disabled={busyDeviceId === device.id}
                                                onClick={() => handleStatusChange(device)}
                                            >
                                                {busyDeviceId === device.id ? "Saving..." : device.is_active ? "Deactivate" : "Activate"}
                                            </button>
                                            <button
                                                className="device-menu-button device-menu-remove"
                                                type="button"
                                                role="menuitem"
                                                disabled={busyDeviceId === device.id}
                                                onClick={() => handleRemove(device)}
                                            >
                                                Remove
                                            </button>
                                        </div>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </details>
            </section>

            <section className="profile-card device-card-section device-add-section">
                <div>
                    <span className="eyebrow">DEVICE REGISTRATION</span>
                    <h3>Add a CCTV device</h3>
                    <p>Enter the name and credentials configured on the camera or bridge.</p>
                </div>
                <form className="device-add-form" onSubmit={handleAddDevice}>
                    <label>
                        Device name
                        <input
                            autoComplete="off"
                            maxLength={100}
                            name="device_name"
                            onChange={event => setForm(current => ({ ...current, device_name: event.target.value }))}
                            placeholder="Front entrance camera"
                            required
                            value={form.device_name}
                        />
                    </label>
                    <label>
                        Device code
                        <input
                            autoComplete="off"
                            maxLength={100}
                            name="device_code"
                            onChange={event => setForm(current => ({ ...current, device_code: event.target.value }))}
                            placeholder="Unique camera code"
                            required
                            value={form.device_code}
                        />
                    </label>
                    <label>
                        Device secret
                        <input
                            autoComplete="new-password"
                            name="device_secret"
                            onChange={event => setForm(current => ({ ...current, device_secret: event.target.value }))}
                            placeholder="Camera authentication secret"
                            required
                            type="password"
                            value={form.device_secret}
                        />
                    </label>
                    <button className="dashboard-button dashboard-button-primary" disabled={savingDevice} type="submit">
                        {savingDevice ? "Adding device..." : "Add device"}
                    </button>
                </form>
            </section>
        </section>
    );
}

export default DevicePanel;
