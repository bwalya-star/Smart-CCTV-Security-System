import { useEffect, useState } from "react";
import { getAlerts } from "../services/api";
import socket from "../services/socket";

export default function useAlerts() {

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    async function loadAlerts() {

        try {

            const data = await getAlerts();

            setAlerts(data);

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

        socket.on("new_alert", (newAlert) => {

            console.log(
                "New security alert:",
                newAlert
            );

            setAlerts((currentAlerts) => [
                newAlert,
                ...currentAlerts
            ]);

        });

        return () => {

            socket.off("new_alert");

        };

    }, []);

    return {
        alerts,
        loading
    };
}