const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const alertRoutes = require('./routes/alertRoutes');
const authRoutes = require('./routes/authRoutes');
const cameraRoutes = require('./routes/cameraRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('Dashboard connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Dashboard disconnected:', socket.id);
    });
});

app.set('io', io); 

app.use(cors());
app.use(express.json());

app.use(
    '/uploads',
    express.static(
        path.join(__dirname, '../../uploads')
    )
);

// Routes
app.use('/api/alerts', alertRoutes); // support API prefix
app.use('/alerts', alertRoutes); // backward-compatible route
app.use('/api/auth', authRoutes);
app.use('/api/camera', cameraRoutes); 

app.get('/', (req, res) => {
    res.send('backend is running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});