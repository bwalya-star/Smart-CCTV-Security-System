# Project Task List

This task list reflects the current implementation status of the repository as it exists in the working tree.

| Task Name / Description | Current Status | Evidence in Project |
| :--- | :--- | :--- |
| **AI person detection and face validation** | **Implemented** | `ai/Service/app.py`, `ai/Service/routes/detect.py`, `ai/Service/aiService.py` |
| **Backend authentication and account flows** | **Implemented** | `backend/src/routes/authRoutes.js`, `backend/src/controllers/authController.js` |
| **Alert processing and event history** | **Implemented** | `backend/src/routes/alertRoutes.js`, `backend/src/services/notificationService.js` |
| **Device management and camera control** | **Implemented** | `backend/src/routes/deviceRoutes.js`, `backend/src/routes/cameraRoutes.js` |
| **User enrollment and face registration workflow** | **Implemented** | `backend/src/controllers/peopleController.js`, `backend/src/routes/peopleRoutes.js` |
| **Admin user management** | **Implemented** | `backend/src/routes/adminRoutes.js`, `backend/src/controllers/adminController.js` |
| **Frontend dashboard and navigation** | **Implemented** | `frontend/src/App.jsx`, `frontend/src/components/AppShell.jsx`, `frontend/src/pages/Dashboard.jsx` |
| **Hardware bridge and Arduino integration** | **Implemented / integration-ready** | `hardware/arduino/*`, `hardware/bridge/*` |
| **Database schema and migrations** | **Implemented** | `backend/migrations/*`, `backend/knexfile.js` |
| **Documentation and operational setup** | **In progress / maintained** | `docs/*.md` |

---

## Status Legend

- **Implemented:** The feature is present in the current codebase and wired into the app.
- **Integration-ready:** The component exists and is ready for deployment/testing on supported hardware or local services.
- **In progress:** The documentation or operational workflow is being maintained as the project evolves.