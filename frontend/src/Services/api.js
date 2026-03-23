export async function sendAlert(imagePath) {
    const res = await fetch('http://localhost:5000/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imagePath })
    });
    return res.json();
}