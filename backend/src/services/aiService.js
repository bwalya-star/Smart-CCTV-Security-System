const axios = require('axios');

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_TIMEOUT = parseInt(process.env.AI_SERVICE_TIMEOUT_MS, 10) || 5000;

async function detectPerson(imagePath) {
    try {
        const response = await axios.post(
            `${AI_URL}/detect`,
            { image: imagePath },
            { timeout: AI_TIMEOUT }
        );
        return response.data;
    } catch (error) {
        const details = error.response
            ? error.response.data
            : error.message;

        console.error('Error detecting person:', details);
        throw new Error(`AI service error: ${details}`);
    }
}

module.exports = { detectPerson };