import { useEffect, useState } from "react";
import {
    getDevices,
    updateDeviceStatus
} from "../services/api";


function DevicePanel({ token }) {

    const [devices, setDevices] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        async function loadDevices() {

            try {

                setLoading(true);

                const data =
                    await getDevices(token);

                setDevices(data);

            } catch (error) {

                console.error(
                    "Device loading error:",
                    error
                );

                setError(
                    "Unable to load CCTV devices"
                );

            } finally {

                setLoading(false);

            }

        }


        if (token) {
            loadDevices();
        }

    }, [token]);


    if (loading) {

        return (
            <section className="device-panel">

                <h2>
                    CCTV Devices
                </h2>

                <p>
                    Loading devices...
                </p>

            </section>
        );

    }


    if (error) {

        return (
            <section className="device-panel">

                <h2>
                    CCTV Devices
                </h2>

                <p className="camera-error">
                    {error}
                </p>

            </section>
        );

    }


    return (

        <section className="device-panel">

            <div className="panel-header">

                <div>

                    <h2>
                        CCTV Devices
                    </h2>

                    <p>
                        Registered security cameras
                    </p>

                </div>

            </div>


            {devices.length === 0 ? (

                <p>
                    No CCTV devices registered.
                </p>

            ) : (

                <div className="device-list">

                    {devices.map(device => (

                        <div
                            className="device-card"
                            key={device.id}
                        >

                            <div>

                                <h3>
                                    {device.device_name}
                                </h3>

                                <p>
                                    {device.device_code}
                                </p>

                            </div>


                            <div
                                className={
                                    device.is_active
                                        ? "device-status active"
                                        : "device-status"
                                }
                            >

                                <span></span>

                                {device.is_active
                                    ? "Active"
                                    : "Inactive"}

                            </div>

                            <button
                                className="dashboard-button dashboard-button-primary device-action-button"
                                onClick={async () => {

                                    try {

                                        const data =
                                            await updateDeviceStatus(
                                                token,
                                                device.id,
                                                !device.is_active
                                            );

                                        setDevices(current =>
                                            current.map(item =>
                                                item.id === device.id
                                                    ? data.device
                                                    : item
                                            )
                                        );

                                    } catch (error) {

                                        console.error(error);

                                        setError(
                                            "Failed to update device status"
                                        );

                                    }

                                }}
                            >
                                {device.is_active
                                    ? "Deactivate"
                                    : "Activate"}
                            </button>

                        </div>

                    ))}

                </div>

            )}

        </section>

    );

}


export default DevicePanel;