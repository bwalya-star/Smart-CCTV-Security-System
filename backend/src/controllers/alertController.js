const { detectPerson } = require('../services/aiService');

async function getAlerts(req, res) {
    try {
        const alerts = await detectPerson();
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function handleAlert(req, res) {
    try {
        const { image } = req.body;
        const alert = await detectPerson(image);
        res.json(alert);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getAlerts, handleAlert };