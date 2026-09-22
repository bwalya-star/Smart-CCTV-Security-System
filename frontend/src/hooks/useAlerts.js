import { useEffect, useState } from "react";
import { getAlerts } from "../services/api";
import socket from "../services/socket";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function useAlerts(userId) {

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [liveAlert, setLiveAlert] = useState(null);

    async function loadAlerts() {

        try {

            const data = await getAlerts();

            setAlerts(data);

            if (data.length > 0) {
                setLiveAlert(data[0]);
            }

        } catch (error) {

            console.error(
                "Failed to load alerts:",
                error
            );

        } finally {

            setLoading(false);

        }
    }

    useEffect(() => {

        loadAlerts();

        const token = localStorage.getItem("token");

        if (!token) {
            return undefined;
        }

        socket.auth = { token };
        socket.connect();

        function joinUserRoom() {

            if (userId) {
                socket.emit(
                    "join_user_room",
                    userId
                );
            }
        }

        socket.on("connect", joinUserRoom);

        if (socket.connected) {
            joinUserRoom();
        }

        socket.on("new_alert", (newAlert) => {

            console.log(
                "New security alert:",
                newAlert
            );

            setAlerts((currentAlerts) => [
                newAlert,
                ...currentAlerts
            ]);

            setLiveAlert(newAlert);

        });

        return () => {

            socket.off("connect", joinUserRoom);
            socket.off("new_alert");
            socket.disconnect();

        };

    }, [userId]);

    return {
        alerts,
        loading,
        liveAlert
    };
}