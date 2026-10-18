# Deployment Guide

## 1. Prerequisites

Ensure the target workstation or deployment server has the following installed:

- Node.js 18 or later
- Python 3.10 or later
- MySQL 8.0 or later
- Git
- Arduino IDE for firmware uploads (optional for hardware demo builds)

---

## 2. Required Environment Configuration

Create environment files in the backend and AI service directories before running the application.

### Backend `.env` (backend/.env)

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=cctv_security_system
JWT_SECRET=replace_with_a_long_secret
AI_SERVICE_URL=http://127.0.0.1:8001/api/detect
AI_ENROLLMENT_VALIDATION_URL=http://127.0.0.1:8001/api/validate-enrollment
FRONTEND_URLS=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
ALERT_EMAIL=alerts@example.com
```

### AI service `.env` (ai/Service/.env)

```env
FLASK_ENV=development
```

The backend `knexfile.js` also supports remote MySQL deployments using `DATABASE_URL` and optionally a `DB_SSL_CA` certificate file for TLS connections.

---

## 3. Installation Steps

1. Clone the repository:

```bash
git clone https://github.com/bwalya-star/Smart-CCTV-Security-System.git
cd "Smart CCTV Security System"
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

4. Install Python dependencies from the repository root:

```bash
cd ..
pip install -r requirements.txt
```

5. Create the database and apply migrations:

```bash
cd backend
npx knex migrate:latest
```

This project uses Knex migrations in `backend/migrations` instead of a single `docs/schema.sql` file.

6. Upload the Arduino firmware if the hardware layer is required:

- Open the sketch in `hardware/arduino/final_system/smart_cctv.ino`
- Select the correct board and port in the Arduino IDE
- Upload the firmware to the connected Arduino Mega 2560

---

## 4. Start the Services

Start the services in separate terminals.

### Terminal 1 - AI service

```bash
cd ai/Service
python app.py
```

The service listens on `http://127.0.0.1:8001` by default.

### Terminal 2 - Backend API

```bash
cd backend
npm run dev
```

The API serves on `http://localhost:5000`.

### Terminal 3 - Frontend dashboard

```bash
cd frontend
npm run dev
```

The dashboard runs at `http://localhost:5173`.

---

## 5. Access Points

- Frontend dashboard: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- AI detection service: `http://127.0.0.1:8001`
- MySQL database: `localhost:3306`

---

## 6. Production Build Notes

For a frontend production build:

```bash
cd frontend
npm run build
```

The project also supports deployment to remote MySQL and HTTPS frontends through the environment variables configured in `backend/knexfile.js` and the React frontend environment config.

---

## 7. Troubleshooting

| Issue | Likely Cause | Resolution |
| :--- | :--- | :--- |
| Database connection refused | MySQL is stopped or credentials are wrong | Check the MySQL service and verify `DB_*` values in `backend/.env` |
| AI service unreachable | Python service is not running | Start `ai/Service/app.py` and confirm `http://127.0.0.1:8001` is responding |
| Frontend fails to load data | Backend is not running or CORS is misconfigured | Start the Node API and ensure `FRONTEND_URLS` includes the frontend origin |
| Email notifications fail | SMTP variables are missing or invalid | Check `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, and `ALERT_EMAIL` |
| Hardware actions do not trigger | Arduino port or sketch mismatch | Verify the board port in the Arduino IDE and re-upload the sketch |

---

## 8. Common Deployment Checklist

- [ ] MySQL server is running and reachable
- [ ] Backend `.env` values are set
- [ ] AI service `.env` values are set
- [ ] `npx knex migrate:latest` completed successfully
- [ ] Python AI service is running
- [ ] Express backend is running
- [ ] React dashboard is running
- [ ] Email and database alerts are configured if required
