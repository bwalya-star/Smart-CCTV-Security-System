# Smart AI CCTV Security System

An intelligent CCTV-based security system that uses computer vision, artificial intelligence, and automated alerting to detect and identify people in real time.

## 1. Project Overview

The **Smart AI CCTV Security System** is a software and hardware-based surveillance solution designed to improve security for homes and small businesses.

Traditional CCTV systems primarily record video footage for later review. This project extends conventional surveillance by integrating artificial intelligence to automatically analyse captured images, detect people, identify known individuals, and generate security alerts.

The system combines:

* Real-time camera monitoring
* Motion/camera capture
* AI-based person detection
* Face recognition
* Known and unknown person identification
* Automated security alerts
* Image capture and event recording
* Notification services
* Web-based monitoring
* Event history and audit logging
* Arduino-based hardware integration

The system is designed with affordability and practical deployment in mind, particularly for environments where a conventional enterprise security system may be too expensive.

---

# 2. Main Objectives

The main objective is to develop an intelligent CCTV security system capable of automatically detecting and identifying people and notifying users when potentially significant security events occur.

### Specific objectives

1. Capture images from a surveillance camera.
2. Detect people using an AI object-detection model.
3. Identify known individuals using facial recognition.
4. Distinguish between known and unknown individuals.
5. Record security events in a database.
6. Generate alerts when relevant security events occur.
7. Provide notifications to users.
8. Provide a web-based dashboard for monitoring events.
9. Maintain an event history and audit trail.
10. Integrate the software system with Arduino-based hardware.
11. Provide an architecture that can operate locally while supporting cloud deployment.

---

# 3. Key Features

## 3.1 Person Detection

The system uses the **YOLO object-detection model** to detect people captured by the CCTV camera.

The AI service determines whether a person is present and records the detection confidence.

## 3.2 Face Recognition

When a person is detected, the system performs facial recognition using **InsightFace**.

The system compares the detected face against registered individuals.

Example results include:

* Bwalya — Known
* Sekelani — Known
* Unknown person — Not recognised

## 3.3 Intelligent Alert Classification

Detected events are classified according to their security significance.

The system can use information such as:

* Person detection
* Face identity
* Confidence
* Known/unknown status
* Event status
* Previous alerts

to determine how the event should be handled.

## 3.4 Image Capture

When a security event occurs, the system captures and stores an image associated with the event.

## 3.5 Web Dashboard

The React dashboard provides a user interface for:

* Monitoring security events
* Viewing alerts
* Viewing event history
* Viewing identity information
* Monitoring system status
* Viewing camera-related information

## 3.6 Notifications

The system provides automated notifications for relevant security events.

Notification handling includes:

* Alert generation
* Notification delivery
* Notification cooldown
* Duplicate-alert prevention
* Notification history

## 3.7 Event Timeline

Security events are recorded in an event timeline/audit log.

This allows users to review previous system activity.

## 3.8 Hardware Integration

The project includes an Arduino Mega 2560 as part of the hardware architecture.

The hardware bridge communicates with the software system to support hardware-triggered security operations.

---

# 4. System Architecture

The primary architecture used for the project presentation and local demonstration is the **local execution architecture**.

The complete AI processing and hardware interaction are performed on the local computer.

The deployed frontend, backend, and database are also functional and available as a deployment configuration, but the project's main demonstration flow remains local.

### Local execution flow

```text
Camera
   │
   ▼
Hardware / Capture
   │
   ▼
Python AI Service
   │
   ├── YOLO Person Detection
   │
   └── InsightFace Recognition
   │
   ▼
Node.js / Express Backend
   │
   ├── Alert Processing
   ├── Event Management
   ├── Notification Service
   └── Database Service
   │
   ▼
MySQL Database
   │
   ▼
React Web Dashboard
```

## 4.1 Architecture Diagram

The following PlantUML code can be used to generate the project's architecture diagram.
![Smart CCTV Security System Architecture](docs/diagrams/system-architecture.png)

---

# 5. Technology Stack

| Layer                   | Technology           |
| ----------------------- | -------------------- |
| Frontend                | React                |
| Build Tool              | Vite                 |
| Backend                 | Node.js              |
| API Framework           | Express.js           |
| AI Service              | Python               |
| Computer Vision         | OpenCV               |
| Object Detection        | YOLO / Ultralytics   |
| Face Recognition        | InsightFace          |
| Database                | MySQL                |
| Database Hosting        | Aiven                |
| Frontend Hosting        | Vercel               |
| Backend Hosting         | Vercel               |
| Hardware                | Arduino Mega 2560    |
| Hardware Communication  | Serial communication |
| Version Control         | Git / GitHub         |
| Development Environment | Visual Studio Code   |

---

# 6. Project Structure

```text
smart-security-system/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── alertController.js
│   │   │
│   │   ├── routes/
│   │   │   └── alertRoutes.js
│   │   │
│   │   ├── services/
│   │   │   ├── aiService.js
│   │   │   ├── notificationService.js
│   │   │   └── databaseService.js
│   │   │
│   │   ├── models/
│   │   │   └── eventModel.js
│   │   │
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   │
│   │   └── app.js
│   │
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── index.html
│   └── package.json
│
├── ai/
│   └── Service/
│       ├── face_data/
│       │   └── known_faces/
│       │       ├── bwalya/
│       │       └── sekelani/
│       │
│       ├── evaluation/
│       │   └── results/
│       │
│       └── Python AI service files
│
├── hardware/
│   └── bridge/
│       └── main.py
│
├── uploads/
│
├── .gitignore
└── README.md
```

---

# 7. System Workflow

The system operates through the following workflow:

```text
1. Camera captures an image
          │
          ▼
2. Image sent to AI service
          │
          ▼
3. YOLO detects whether a person is present
          │
          ├── No person
          │       │
          │       ▼
          │   Event ends
          │
          └── Person detected
                  │
                  ▼
4. InsightFace performs face recognition
                  │
                  ▼
5. Identity determined
                  │
          ┌───────┴────────┐
          │                │
       Known            Unknown
          │                │
          └───────┬────────┘
                  ▼
6. AI result sent to backend
                  │
                  ▼
7. Backend classifies event
                  │
                  ▼
8. Event stored in MySQL
                  │
                  ▼
9. Notification logic evaluated
                  │
                  ▼
10. Dashboard updated
```

---

# 8. AI Processing Pipeline

The AI processing pipeline consists of two major stages.

## Stage 1 — Person Detection

YOLO analyses the captured image.

The system determines:

```text
Person detected = True / False
```

When a person is detected, the system records the confidence score.

## Stage 2 — Face Recognition

If a person is detected, InsightFace analyses the detected face.

The face embedding is compared against registered known faces.

The current system contains registered identities including:

```text
Bwalya
Sekelani
```

The system can classify the detected person as:

```text
Known
```

or:

```text
Unknown
```

---

# 9. Alert Processing

When an important security event is detected, the AI service sends the detection result to the backend.

A typical event contains information such as:

```json
{
  "detected": true,
  "confidence": 0.91,
  "identity": "unknown",
  "status": "alert"
}
```

The backend then:

1. Receives the AI result.
2. Processes the event.
3. Classifies the alert.
4. Stores the event.
5. Applies duplicate-alert prevention.
6. Applies notification cooldown rules.
7. Sends notifications when required.
8. Makes the event available to the dashboard.

---

# 10. Database

The system uses **MySQL** to persist security events.

A primary `alerts` table contains information such as:

| Field      | Description                             |
| ---------- | --------------------------------------- |
| id         | Unique event identifier                 |
| image_path | Path/reference to captured image        |
| detected   | Indicates whether a person was detected |
| confidence | AI detection confidence                 |
| status     | Security event status                   |
| created_at | Event creation timestamp                |

Additional event information can be handled through the application's event and audit mechanisms.

The production database is hosted using **Aiven** and has been successfully connected to the backend.

---

# 11. Deployment

The system supports both local execution and cloud deployment.

## Local Development Architecture

The main project demonstration uses the local architecture:

```text
Camera
   ↓
Local AI
   ↓
Local Backend
   ↓
Local/Configured MySQL
   ↓
React Dashboard
```

## Deployed Components

The following components have also been successfully deployed:

### Frontend

The React frontend is deployed using **Vercel**.

### Backend

The Node.js/Express backend is deployed using **Vercel**.

### Database

The MySQL database is deployed using **Aiven**.

The deployed components have been tested and are functioning.

The project's presentation and primary system demonstration will continue to use the local execution flow because it provides direct access to the camera, AI service, and Arduino hardware.

---

# 12. Testing and Evaluation

The AI system was evaluated using a small test dataset containing different scenarios.

The object-detection evaluation included:

* Empty scene
* Person nearby
* Person far away
* Multiple people
* Low-light scene

The evaluation produced:

* 4 true positives
* 1 true negative
* 0 false positives
* 0 false negatives
* 100% accuracy on the test dataset

The average detection confidence was approximately:

```text
0.9137
```

The AI processing benchmark produced approximately:

```text
270–374 ms
```

per tested image after warm-up, depending on the scenario.

---

# 13. Face Recognition Evaluation

The face-recognition system was evaluated using registered known individuals and an unknown-person test.

The current test dataset included:

* Bwalya
* Sekelani
* Unknown person

The evaluation achieved:

```text
Accuracy:             100%
Recognition Rate:     100%
False Positive Rate:  0%
False Negative Rate:  0%
Average Similarity:   0.8234
```

These results are based on the project's current small evaluation dataset and should not be interpreted as a general real-world accuracy guarantee.

---

# 14. Security Considerations

Sensitive configuration information must not be committed to GitHub.

The following should remain in environment variables:

* Database passwords
* Gmail App Passwords
* JWT signing secrets
* API keys
* Other authentication credentials

Generate a unique JWT signing secret for each deployment with Node.js:

```powershell
node -p "require('node:crypto').randomBytes(64).toString('base64url')"
```

Place the generated value in `backend/.env` as `JWT_SECRET`. Never reuse a development placeholder or commit the generated value. Rotating `JWT_SECRET` invalidates existing tokens, so users will need to sign in again.

The following files/directories should not be committed:

```text
.env
*.pem
*.key
*.p12
*.pfx
secure/
node_modules/
uploads/
__pycache__/
dist/
```

An `.env.example` file may be provided containing variable names without secret values.

---

# 15. Installation

## Prerequisites

Install:

* Node.js
* Python
* MySQL or access to the configured MySQL database
* Git
* Visual Studio Code
* Arduino IDE
* A compatible webcam/CCTV camera

---

# 16. Backend Setup

Navigate to:

```powershell
cd backend
```

Install dependencies:

```powershell
npm install
```

Configure the environment variables in:

```text
backend/.env
```

Before starting the backend, apply any pending database migrations:

```powershell
npx knex migrate:latest
```

Password reset and account-approval emails use `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, and `EMAIL_PASSWORD`. Set `ADMIN_EMAIL` to the inbox that should receive new account-request notifications. If it is empty, the mail sender (`EMAIL_USER`) is used. Applicants receive a request-received email immediately, then an approval or rejection email after review.

Set `FRONTEND_URL` to the public frontend origin used in reset links, and allow that origin in `FRONTEND_URLS` for CORS. For local development, the defaults use `http://localhost:5173`. For TLS-enabled MySQL, set `DB_SSL_CA` to the local CA certificate path provided by the database host. Keep CA and private-key files local; Git ignores certificate/key extensions.

After configuring `backend/.env`, apply pending database migrations before starting the backend:

```powershell
npx knex migrate:latest
```

The dashboard's automatic camera schedule is saved in the database by the
`camera_recording_schedules` migration. Schedules apply to the shared camera,
repeat on the selected weekdays, and use the timezone shown in the dashboard.
Motion detection can be paused from the camera controls; events received while
it is paused are acknowledged without running AI detection or creating alerts.
The daily fail-safe can automatically re-enable it at a configured local time.
These settings are shared by the system and stored by the
`camera_motion_settings` migration.
The dashboard also lists saved video files from `uploads/recordings`.
In both the alert archive and recording list, select individual items or use
the select-all control to bulk-delete them. Active recordings are protected
from deletion until recording has stopped.

The Profile page supports face enrollment with a name, relationship or role,
optional notes, and 5–10 JPEG, PNG, or WebP photos. The AI service checks that
each image contains one face and that the selected photos are visually distinct.
Private enrollment images are stored under `ai/Service/face_data/enrolled_people`
and excluded from version control. Apply the `enrolled_people` database migration
before using enrollment.
On first profile load, legacy face folders are imported as managed enrollments
only when alert history associates that identity with exactly one account.

Start the development server:

```powershell
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

when using the local development configuration.

---

# 17. Frontend Setup

Navigate to:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Vite will provide the local frontend address.

---

# 18. AI Service Setup

Activate the Python virtual environment:

```powershell
.\secure\Scripts\activate
```

Install the required Python packages:

```powershell
pip install -r ai/requirements.txt
```

Navigate to the AI service directory:

```powershell
cd ai\Service
```

Start the AI service using the project's configured Python entry point.

The AI service provides:

* Image processing
* YOLO detection
* Face recognition
* Identity classification
* AI result generation

---

# 19. Hardware Setup

The hardware component uses an:

```text
Arduino Mega 2560
```

The Arduino communicates with the computer through serial communication.

The hardware bridge is located at:

```text
hardware/bridge/main.py
```

The Arduino IDE can be used to upload and test the hardware firmware.

---

# 20. Running the Complete Local System

Start the components in the following order.

### Terminal 1 — Backend

```powershell
cd backend
npm run dev
```

### Terminal 2 — AI Service

```powershell
.\secure\Scripts\activate
cd ai\Service
```

Start the configured AI service.

### Terminal 3 — Frontend

```powershell
cd frontend
npm run dev
```

### Hardware

Connect:

```text
Arduino Mega 2560
        +
Camera
```

Then open the React dashboard in a browser.

---

# 21. Complete System Flow

The complete local demonstration follows this sequence:

```text
Camera
   ↓
Image Capture
   ↓
Python AI Service
   ↓
YOLO Person Detection
   ↓
InsightFace Recognition
   ↓
Known / Unknown Classification
   ↓
Node.js Backend
   ↓
Alert Classification
   ↓
MySQL Database
   ↓
Notification Service
   ↓
React Dashboard
```

---

# 22. Project Roles

## Software Engineering Team

The Software Engineering component is responsible for:

* System architecture
* Frontend development
* Backend development
* REST API development
* Database integration
* AI integration
* Alert processing
* Notification logic
* Web dashboard
* Software testing
* System integration
* Documentation

## Computer Systems / Hardware Component

The hardware component is responsible for:

* Arduino integration
* Hardware interfacing
* Sensor integration
* Serial communication
* Hardware-side implementation

The project separates the software engineering responsibilities from the embedded/hardware programming responsibilities.

---

# 23. Future Improvements

Possible future improvements include:

* Larger and more diverse face-recognition datasets
* Improved low-light detection
* Multiple-camera support
* Edge AI hardware deployment
* Mobile application
* Improved intrusion classification
* Cloud-based AI processing
* Video-stream processing
* Advanced user management
* Improved model optimisation
* Hardware-triggered alarm integration

---

# 24. Limitations

The current prototype has several limitations:

1. AI evaluation was conducted using a relatively small dataset.
2. Face recognition performance can vary with lighting, camera angle, and image quality.
3. Local AI processing depends on the available computer hardware.
4. Network connectivity is required when communicating with deployed services.
5. The current system is primarily designed around person detection rather than comprehensive threat/object classification.
6. Hardware integration may require additional configuration depending on the deployment environment.

---

# 25. Project Status

The major components of the Smart AI CCTV Security System have been implemented and integrated.

Current status:

* [x] React frontend
* [x] Node.js backend
* [x] MySQL database
* [x] YOLO person detection
* [x] InsightFace face recognition
* [x] Known-person identification
* [x] Unknown-person detection
* [x] Alert classification
* [x] Notification service
* [x] Notification cooldown
* [x] Duplicate alert prevention
* [x] Event timeline
* [x] Dashboard monitoring
* [x] Camera integration
* [x] Arduino integration
* [x] AI evaluation
* [x] Face recognition evaluation
* [x] Backend deployment
* [x] Frontend deployment
* [x] Database deployment
* [x] End-to-end system integration

---

# 26. Conclusion

The Smart AI CCTV Security System demonstrates how artificial intelligence, computer vision, web technologies, databases, and hardware integration can be combined to create an intelligent surveillance platform.

Unlike a conventional CCTV system that primarily records footage, the proposed system automatically analyses captured images, detects people, identifies registered individuals, records security events, and provides alerts through a web-based monitoring interface.

The system has been implemented using a modular architecture that separates the frontend, backend, AI processing, database, and hardware components. This allows the system to operate locally for the main project demonstration while also supporting deployment of the frontend, backend, and database to cloud infrastructure.

The resulting platform provides a foundation for affordable intelligent surveillance and can be extended with additional AI models, cameras, sensors, mobile applications, and cloud services in future work.

## License

This project was developed as an academic final-year project.
