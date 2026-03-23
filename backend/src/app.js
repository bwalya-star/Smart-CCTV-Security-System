const express = require('express');
const cors = require('cors');
require('dotenv').config();

const alertRoutes = require('./routes/alertRoutes');

const app = express();

app.use(cors());
app.use(express.json());
// Routes
app.use('/api/alerts', alertRoutes); // support API prefix
app.use('/alerts', alertRoutes); // backward-compatible route

app.get('/', (req, res) => {
    res.send('backend is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});