const API_BASE_URL = 'http://localhost:5000/api'; // Update this to match your backend port (e.g., 5000 or 8000)

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
        "http://localhost:5000/api/devices",
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
        `http://localhost:5000/api/devices/${deviceId}/status`,
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
        `http://localhost:5000/api/devices/${deviceId}/name`,
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


export async function startRecording() {

    const response = await fetch(
        "http://localhost:5000/api/camera/start",
        {
            method: "POST"
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to start recording"
        );
    }

    return response.json();
}


export async function stopRecording() {

    const response = await fetch(
        "http://localhost:5000/api/camera/stop",
        {
            method: "POST"
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to stop recording"
        );
    }

    return response.json();
}


export async function getCameraStatus() {

    const response = await fetch(
        "http://localhost:5000/api/camera/status"
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
        "http://localhost:5000/api/auth/login",
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