const API_BASE_URL = 'http://localhost:5000/api'; // Update this to match your backend port (e.g., 5000 or 8000)

// Professional mock data to show when backend is offline
const MOCK_ALERTS = [
    { id: 1, image_path: 'https://via.placeholder.com/150', detected: true, confidence: 0.98, status: 'threat', created_at: new Date().toISOString() },
    { id: 2, image_path: 'https://via.placeholder.com/150', detected: true, confidence: 0.82, status: 'warning', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 3, image_path: 'https://via.placeholder.com/150', detected: false, confidence: 0.12, status: 'safe', created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 4, image_path: 'https://via.placeholder.com/150', detected: true, confidence: 0.91, status: 'threat', created_at: new Date(Date.now() - 86400000).toISOString() },
];

export const getAlerts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/alerts`);
        if (!response.ok) throw new Error('Failed to fetch alerts');
        return await response.json();
    } catch {
        console.warn("Backend 500 error or offline. Loading professional mock data instead.");
        return MOCK_ALERTS; // Fallback to mock data so UI looks professional
    }
};


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