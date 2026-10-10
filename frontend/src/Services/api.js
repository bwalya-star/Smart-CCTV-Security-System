const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE_URL = `${API_URL}/api`;

async function adminRequest(token, path, options = {}) {
    const response = await fetch(`${API_BASE_URL}/admin${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers
        }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Administrator request failed.");
    return data;
}

export const getAccountRequests = token => adminRequest(token, "/account-requests");
export const reviewAccountRequest = (token, id, decision) => adminRequest(token, `/account-requests/${id}/${decision}`, { method: "PATCH" });
export const getManagedUsers = token => adminRequest(token, "/users");
export const createManagedUser = (token, user) => adminRequest(token, "/users", { method: "POST", body: JSON.stringify(user) });
export const updateManagedUser = (token, id, changes) => adminRequest(token, `/users/${id}`, { method: "PATCH", body: JSON.stringify(changes) });
export const deleteManagedUser = (token, id) => adminRequest(token, `/users/${id}`, { method: "DELETE" });

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

export async function createDevice(token, device) {
    const response = await fetch(`${API_BASE_URL}/devices`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(device)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Failed to add device");
    return data;
}

export async function deleteDevice(token, deviceId) {
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Failed to remove device");
    return data;
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

    let response;
    try {
        response = await fetch(
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
    } catch {
        throw new Error("Unable to reach the sign-in service. Check your connection and try again.");
    }

    let data = {};
    try {
        data = await response.json();
    } catch {
        data = {};
    }


    if (!response.ok) {
        const fallbackMessage = response.status === 400
            ? "Check that your email and password are entered correctly."
            : response.status === 401
                ? "The email or password is incorrect."
                : response.status === 503
                    ? "Sign-in is temporarily unavailable. Please try again later."
                    : response.status >= 500
                        ? "We couldn't complete sign-in because of a server error. Please try again later."
                        : "Sign-in could not be completed. Check your details and try again.";

        throw new Error(
            data.error ||
            fallbackMessage
        );

    }


    return data;
}
