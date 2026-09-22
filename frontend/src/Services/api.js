const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE_URL = `${API_URL}/api`;

export const getAlerts = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_BASE_URL}/alerts`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch alerts");
    }

    return response.json();
};


export async function getDevices(token) {

    const response = await fetch(
        `${API_BASE_URL}/devices`,
        {
            method: "GET",

            headers: {
                "Authorization":
                    `Bearer ${token}`,

                "Content-Type":
                    "application/json"
            }
        }
    );

    if (!response.ok) {

        throw new Error(
            "Failed to load devices"
        );

    }

    return response.json();
}


export async function updateDeviceStatus(
    token,
    deviceId,
    isActive
) {

    const response = await fetch(
        `${API_BASE_URL}/devices/${deviceId}/status`,
        {
            method: "PATCH",

            headers: {
                "Authorization":
                    `Bearer ${token}`,

                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                is_active: isActive
            })
        }
    );

    if (!response.ok) {

        throw new Error(
            "Failed to update device status"
        );

    }

    return response.json();
}


export async function renameDevice(
    token,
    deviceId,
    deviceName
) {

    const response = await fetch(
        `${API_BASE_URL}/devices/${deviceId}/name`,
        {
            method: "PATCH",

            headers: {
                "Authorization":
                    `Bearer ${token}`,

                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                device_name: deviceName
            })
        }
    );

    if (!response.ok) {

        throw new Error(
            "Failed to rename device"
        );

    }

    return response.json();
}


export async function startRecording(token) {

    const response = await fetch(
        `${API_BASE_URL}/camera/start`,
        {
            method: "POST"
            ,headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to start recording"
        );
    }

    return response.json();
}


export async function stopRecording(token) {

    const response = await fetch(
        `${API_BASE_URL}/camera/stop`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to stop recording"
        );
    }

    return response.json();
}


export async function getCameraStatus(token) {

    const response = await fetch(
        `${API_BASE_URL}/camera/status`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to get camera status"
        );
    }

    return response.json();
}


export async function loginUser(
    email,
    password
) {

    const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })
        }
    );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.error ||
            "Login failed."
        );

    }


    return data;
}
