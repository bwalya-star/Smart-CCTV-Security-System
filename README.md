# Smart AI CCTV Security System

A final-year project combining real-time CCTV monitoring, computer vision, a web dashboard, and Arduino Mega hardware integration.

## Features

- Real-time CCTV monitoring
- YOLO person detection
- Face recognition and individual identification
- Known, unknown, and unidentified identity classification
- Smart alert classification and severity levels
- Email notification delivery, cooldown protection, and history
- Event timeline and audit logging
- React dashboard with live Socket.IO updates
- Node.js/Express backend, Python/Flask AI service, and MySQL database
- Arduino Mega motion-sensor integration

## Architecture

```text
Arduino Mega / motion sensor
          |
          v
Python hardware bridge -> Camera capture service
          |                       |
          v                       v
       Node.js API <-------- Python AI service
          |  \                     |
          |   \--> MySQL database  |
          |                       |
          +----> React dashboard (REST + Socket.IO)
          +----> Email notifications
```

## Technology stack

| Area | Technology |
| --- | --- |
| Frontend | React, Vite, Socket.IO Client, Tailwind CSS |
| Backend | Node.js, Express, Socket.IO, Knex |
| Database | MySQL |
| AI service | Python, Flask, OpenCV, YOLO, face-recognition tooling |
| Hardware | Arduino Mega, motion sensor, serial bridge |

## Project structure

```text
ai/Service/             Python AI detection and face-recognition service
backend/                Express API, authentication, notifications, migrations
frontend/               React/Vite dashboard
hardware/arduino/       Arduino Mega sketches
hardware/bridge/        Serial-to-backend hardware bridge
database/               Database resources
```

## Local setup

### 1. Configure environment files

Copy the templates, then fill in local values. Do not commit the resulting `.env` files.

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

For local development, set the frontend API URL:

```ini
VITE_API_URL=http://localhost:5000
```

Configure MySQL, JWT, email, and AI-service values in `backend/.env`. For local browser development and Vite preview, use:

```ini
FRONTEND_URLS=http://localhost:5173,http://localhost:4173
```

### 2. Start MySQL and apply migrations

Create the database named by `DB_NAME` in `backend/.env`, then run:

```powershell
cd backend
npm install
npx knex migrate:latest --knexfile knexfile.js
```

### 3. Start the backend

```powershell
cd backend
npm run dev
```

The API runs on `http://localhost:5000` by default.

### 4. Start the frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite address shown in the terminal (normally `http://localhost:5173`). To test the production bundle locally, run `npm run build` followed by `npm run preview`.

### 5. Start the AI service

The AI service runs locally on port `8001` and is used by the backend through `AI_SERVICE_URL`.

```powershell
secure\Scripts\Activate.ps1
cd ai\Service
python app.py
```

> The committed `requirements.txt` is a starting point. Before deploying the AI service to a fresh environment, generate and review a complete requirements file from the working AI environment so it includes every detection and face-recognition dependency used by this project.

### 6. Hardware integration

Upload the Arduino sketch in `hardware/arduino/final_system/` to the Arduino Mega. With the camera capture service running, start the bridge:

```powershell
secure\Scripts\Activate.ps1
python hardware\bridge\main.py
```

Set the correct serial port and local camera address in the bridge configuration for the connected hardware.

## Security and repository hygiene

- Real `.env` files, virtual environments, uploaded captures, logs, and build output are excluded by `.gitignore`.
- Commit only `.env.example` templates with blank secret values.
- Use strong, unique values for database passwords, `JWT_SECRET`, email app passwords, and device credentials.
- Do not place device secrets, API keys, or passwords directly in source code.
- Set `VITE_API_URL` and `FRONTEND_URLS` to deployed HTTPS URLs when deploying.

## API services

| Service | Default local address |
| --- | --- |
| React dashboard | `http://localhost:5173` |
| Node.js backend | `http://localhost:5000` |
| Python AI service | `http://127.0.0.1:8001` |
| Camera capture service | `http://127.0.0.1:8000` |

## License

This project was developed as an academic final-year project.
