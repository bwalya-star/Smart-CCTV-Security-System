const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const alertRoutes = require('./routes/alertRoutes');
const authRoutes = require('./routes/authRoutes');
const cameraRoutes = require('./routes/cameraRoutes');
const deviceRoutes =
    require("./routes/deviceRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
        return next(new Error("Authentication required"));
    }

    try {
        socket.user = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        next();
    } catch (error) {
        next(new Error("Invalid or expired token"));
    }
});

io.on('connection', (socket) => {
    console.log('Dashboard connected:', socket.id);

    socket.on(
        "join_user_room",
        () => {
            const room =
                `user_${socket.user.id}`;

            socket.join(room);

            console.log(
                `Dashboard ${socket.id} joined ${room}`
            );

        }
    );

    socket.on("disconnect", () => {
        console.log('Dashboard disconnected:', socket.id);
    });
});

app.set('io', io); 

app.use(
    cors({
        origin: "http://localhost:5173"
    })
);
app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    '/uploads',
    express.static(
        path.join(__dirname, '../../uploads')
    )
);

// Routes
app.use('/api/alerts', alertRoutes); // support API prefix
app.use('/alerts', alertRoutes); // backward-compatible route
app.use(
    "/api/devices",
    deviceRoutes
);
app.use('/api/auth', authRoutes);
app.use('/api/camera', cameraRoutes); 

app.get('/', (req, res) => {
    res.send('backend is running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});