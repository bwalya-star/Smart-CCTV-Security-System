# Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
To define the software and hardware requirements for the **Smart AI CCTV Security System**, ensuring the system meets user security needs, real-time threat detection, and operational reliability.

### 1.2 Scope
The scope includes real-time camera video stream monitoring, AI-driven person and face recognition, local hardware alert integration, interactive web dashboards, push notification dispatching, and secure event logging.

---

## 2. Functional Requirements

* **FR-1:** Capture real-time video feeds from connected network/USB cameras.
* **FR-2:** Detect human presence using YOLO deep learning models.
* **FR-3:** Recognize known vs. unknown faces using InsightFace analysis.
* **FR-4:** Record security events, detection timestamps, and snapshot images in the database.
* **FR-5:** Generate real-time physical (Arduino sirens) and digital (Web / Email) security alerts.
* **FR-6:** Provide a web dashboard for live monitoring, alerts management, and log review.
* **FR-7:** Maintain system audit logs, user authentication states, and configuration histories.

---

## 3. Non-Functional Requirements

| ID | Category | Requirement Description |
| :--- | :--- | :--- |
| **NFR-1** | **Performance** | End-to-end detection and notification latency < 500ms. |
| **NFR-2** | **Availability** | 24/7 continuous operation with automated service recovery. |
| **NFR-3** | **Security** | Role-based access control (RBAC), password hashing (Bcrypt), and TLS encryption. |
| **NFR-4** | **Usability** | Intuitive, responsive web UI accessible on desktop and mobile browsers. |
| **NFR-5** | **Scalability** | Support for multiple camera feeds and optional cloud synchronization. |

---

## 4. System Interfaces

* **Camera Interface:** RTSP / USB video capture interfaces.
* **Hardware Interface:** Serial communication (UART over USB) with Arduino Mega 2560.
* **Database Interface:** MySQL connectivity via connection pooling.
* **User Interface:** Web browser interface over HTTP/HTTPS (React application).
* **Notification Interface:** SMTP (Email), WebPush API, and external webhook services.

---

## 5. Acceptance Criteria

* System correctly identifies known individuals and flags unknown intruders in real time under standard indoor/outdoor lighting.
* Notifications are successfully dispatched within 1 second of an unauthorized entry detection event.
* All event snapshots and security logs persist reliably across system restarts.