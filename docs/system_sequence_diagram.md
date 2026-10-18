# System Sequence Diagram

The following sequence diagram outlines the operational workflow during a frame capture and threat analysis cycle.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Dashboard as Web Dashboard (React)
    participant Backend as Backend (Node.js/Express)
    participant AI as AI Service (Python)
    participant DB as Database (MySQL)
    participant Hardware as Arduino Mega 2560

    User->>Dashboard: 1. View Live Feed
    Dashboard->>Backend: 2. Request Video Stream
    Backend->>AI: 3. Get Frame
    AI->>AI: 4. Detect Person / Recognize Face
    AI-->>Backend: 5. Detection Result Payload
    Backend->>DB: 6. Store Event Details & Image Path
    Backend->>Dashboard: 7. Update Dashboard Live Feed & Logs
    Backend-->>Hardware: 8. Trigger Hardware Siren/Alert (if threat)
    Backend-->>User: 9. Push Alert Notification (Email / WebPush)
```

---

## Execution Flow Steps
1. **User Request:** User accesses live stream via React frontend.
2. **Stream Initialization:** Express server coordinates stream processing pipeline.
3. **AI Evaluation:** Frame is passed to Python background service.
4. **Threat Detection:** YOLO checks for human presence; InsightFace performs face feature extraction.
5. **Payload Processing:** Results are structured into JSON payloads returned to backend.
6. **Data Persistence:** Detections exceeding threat thresholds are recorded to MySQL.
7. **UI Synchronization:** Socket/Polling service broadcasts event updates to dashboard.
8. **Hardware Trigger:** If intrusion is flagged, a serial command triggers Arduino hardware alarms.
9. **Dispatch Alert:** High-priority alerts are immediately delivered to admin devices.