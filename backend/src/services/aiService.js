const axios = require('axios');

async function detectImage(imagePath) {
    try {
        const response = await axios.post('http://localhost:8000/detect', 
            { imagePath });
        return response.data;
    } catch (error) {
        console.error('Error detecting image:', error);
        throw error;
    }
}
