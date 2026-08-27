const axios = require("axios");

const AI_SERVICE_URL =
    process.env.AI_SERVICE_URL ||
    "http://127.0.0.1:8001/api/detect";

async function detectPerson(imagePath) {

    try {

        console.log(
            "Sending image to Python AI service..."
        );

        console.log(
            "Image:",
            imagePath
        );

        const response = await axios.post(
            AI_SERVICE_URL,
            {
                imagePath: imagePath
            },
            {
                timeout: 30000
            }
        );

        console.log(
            "AI response:",
            response.data
        );

        return response.data;


    } catch (error) {

        console.error(
            "AI Service Error:",
            error.message
        );

        if (error.response) {

            console.error(
                "AI response:",
                error.response.data
            );

        }

        throw error;
    }
}


module.exports = {
    detectPerson
};