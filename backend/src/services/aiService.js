const axios = require('axios');

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

async function detectPerson(imagePath) {
    try {
        const response = await axios.post(`${AI_URL}/detect`, 
            { image: imagePath });
        return response.data;
    } catch (error) {
        console.error('Error detecting person:', error);
        throw error;
    }
}

module.exports = { detectPerson };