# User Manual

## 1. Accessing the System

Open the dashboard in a browser at:

```text
http://localhost:5173
```

Sign in with your registered account. The application supports both a landing page and a secure login flow, with password reset and account request flows for administrators.

---

## 2. Dashboard Overview

The Smart CCTV dashboard includes the following primary areas:

- Dashboard overview
- Alerts
- Notifications
- Profile
- Manage Users (admin access only)

The navigation panel indicates whether the security system is online and provides quick access to alert counts.

---

## 3. Monitoring Security Events

### View live system status

On the Dashboard page, you can review:

- current system online state
- connected devices
- recent camera status
- latest alert summary
- recent alert history
- recording library

### Review active alerts

Navigate to the Alerts section to inspect details such as:

- detection confidence
- alert classification and severity
- image snapshots
- identity status
- timestamp and device association

---

## 4. Managing Device and Camera Configuration

Users can manage connected CCTV devices through the dashboard and API-backed device panel. This includes:

- viewing device status
- creating and removing devices
- renaming devices
- changing active/inactive state

The camera and recording features can also be controlled through the backend/camera endpoints and UI.

---

## 5. Enrolling People for Recognition

Administrators and users with access can enroll known people by uploading multiple clear face images.

The system expects:

- 5 to 10 images per person
- JPEG, PNG, or WebP image files
- one clear face in each image
- distinct images showing the same person from different angles

The AI validation service confirms whether the uploaded images meet the enrollment rules before the person is stored.

---

## 6. Notifications and Security Alerts

When the system identifies a high-severity event, it can generate an email notification. Alert logic also supports cooldowns and status tracking so the same event is not repeated constantly.

Users can inspect:

- notification message history
- alert severity classification
- event timestamps and related images

---

## 7. Account and Security Features

The application includes:

- login and logout
- password reset flow
- admin approval workflow for new accounts
- role-based access for standard users and admins
- admin user management tools

Use only authorized credentials and do not share reset or admin links outside trusted personnel.

---

## 8. Troubleshooting

If the system is unavailable:

1. Confirm the AI service is running.
2. Confirm the backend API is running.
3. Check MySQL connectivity and database credentials.
4. Confirm that the frontend is loading from the correct Vite dev server address.
5. Verify the email configuration if notifications are not being delivered.

---

## 9. Security Notes

- Only authorized personnel should be allowed to access the dashboard and admin functions.
- Use strong passwords and keep the `.env` files secure.
- Treat the uploaded face data and event images as sensitive surveillance information.
- Follow the organisation's access-control and privacy policy before sharing captured images externally.
