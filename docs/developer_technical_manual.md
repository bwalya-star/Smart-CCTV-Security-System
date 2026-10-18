# Developer / Technical Manual

## 1. Repository Structure

```text
Smart CCTV Security System/
├── ai/
│   └── Service/
│       ├── app.py
│       ├── aiService.py
│       ├── routes/
│       ├── models/
│       ├── recognition/
│       └── face_data/
├── backend/
│   ├── src/
│   ├── migrations/
│   ├── knexfile.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── hardware/
│   ├── arduino/
│   ├── bridge/
│   ├── camera/
│   └── utils/
├── database/
│   └── ca.pem
├── docs/
│   ├── Diagrams/
│   └── *.md
├── logs/
├── uploads/
├── README.md
├── requirements.txt
├── package.json
└── yolo11n.pt
```

---

## 2. Technology Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express.js, JWT, Socket.IO
- AI layer: Python, Flask, OpenCV, YOLO, InsightFace
- Database: MySQL 8 with Knex migrations
- Hardware: Arduino Mega 2560 and serial bridge services

---

## 3. Local Development Setup

1. Install project dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
cd .. && pip install -r requirements.txt
```

2. Configure `.env` files for backend and AI service.

3. Start the AI service:

```bash
cd ai/Service
python app.py
```

4. Start the backend API:

```bash
cd backend
npm run dev
```

5. Start the frontend app:

```bash
cd frontend
npm run dev
```

---

## 4. Database and Migration Workflow

This project uses Knex migrations rather than the legacy `docs/schema.sql` model.

Apply migrations with:

```bash
cd backend
npx knex migrate:latest
```

Migration files live in:

```text
backend/migrations/
```

The database connection configuration is defined in:

```text
backend/knexfile.js
```

Additional runtime DB setup resides in:

```text
backend/src/config/db.js
```

---

## 5. Core Backend Modules

### API entry point

```text
backend/src/app.js
```

This file configures Express, Socket.IO, API routes, JWT authentication, and static uploads.

### Route modules

Key routes include:

- `backend/src/routes/authRoutes.js`
- `backend/src/routes/alertRoutes.js`
- `backend/src/routes/deviceRoutes.js`
- `backend/src/routes/cameraRoutes.js`
- `backend/src/routes/peopleRoutes.js`
- `backend/src/routes/adminRoutes.js`

### Service layers

The backend uses modular services for:

- AI calls: `backend/src/services/aiService.js`
- Auth/email processing: `backend/src/services/authEmailService.js`
- Database queries: `backend/src/services/databaseService.js`
- Notifications: `backend/src/services/notificationService.js`
- Device/account logic: `backend/src/services/deviceService.js`, `accountService.js`

---

## 6. AI Service Layout

The AI processing layer is in:

```text
ai/Service/
```

Important modules include:

- `app.py` - Flask service entry point
- `aiService.py` - detection and recognition orchestration
- `routes/detect.py` - detection and enrollment validation endpoints
- `models/detectionModel.py` - detector logic
- `recognition/face_recognition_module.py` - face matching logic

This service exposes endpoints such as:

- `POST /api/detect`
- `POST /api/validate-enrollment`

---

## 7. Frontend Layout

The dashboard is a React single-page application in:

```text
frontend/src/
```

Main entry files:

- `frontend/src/App.jsx`
- `frontend/src/components/AppShell.jsx`
- `frontend/src/pages/Dashboard.jsx`

The app uses a token-based session flow and calls backend APIs through the configured `VITE_API_URL` value or the default `http://localhost:5000`.

---

## 8. Debugging and Operational Notes

- Backend logs: view terminal output from `npm run dev`
- AI service logs: view terminal output from `python app.py`
- Database inspection: use MySQL CLI or a client such as MySQL Workbench
- Hardware tracing: monitor the Arduino serial bridge in `hardware/bridge/serial_communication.py`
- Uploaded images: stored under the project root `uploads/` directory

---

## 9. Git and Contribution Workflow

1. Create a feature branch from the main branch.
2. Make small, focused changes.
3. Validate with the relevant backend/frontend build or test commands.
4. Commit the patch with a clear message.
5. Open a pull request for review.

Example:

```bash
git checkout -b feature/enrollment-validation
git add .
git commit -m "feat: add enrollment validation"
git push origin feature/enrollment-validation
```

---

## 10. Known Project Notes

- The project is currently implemented as a working local security system with service-oriented components.
- Some old documentation still references older file names or a single schema.sql flow; the active system is driven by migration files and the backend logic under `src/`.
- The `ai/Service` module is the live AI processing component used by the backend for detection and identity validation.
