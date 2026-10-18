# Class System Diagram

```mermaid
classDiagram
    class User {
        +int id
        +string name
        +string email
        +string role
        +login()
        +logout()
        +viewEvents()
    }

    class Event {
        +int id
        +string type
        +int personId
        +string imagePath
        +datetime timestamp
        +string status
        +save()
        +updateStatus()
        +getDetails()
    }

    class Notification {
        +int id
        +int userId
        +string message
        +string status
        +datetime createdAt
        +send()
        +markAsRead()
        +getHistory()
    }

    class Camera {
        +int id
        +string name
        +string url
        +string status
        +captureImage()
        +getStream()
        +checkStatus()
    }

    class AIService {
        +detectPerson()
        +recogniseFace()
        +getResults()
    }

    class DatabaseService {
        +saveEvent()
        +getEvents()
        +getUsers()
    }

    class ArduinoService {
        +readSensor()
        +controlDevices()
        +sendStatus()
    }

    User "1" -- "*" Event : creates / views
    Event "1" -- "*" Notification : triggers
    Camera "1" -- "*" Event : generates
    BackendService ..> AIService : invokes
    BackendService ..> DatabaseService : executes queries
    BackendService ..> ArduinoService : commands hardware
```

---

## Class Definitions

* **User:** Represets system users (Admins, Operators) who manage configurations and receive alerts.
* **Event:** Represents a recorded security detection event (e.g., intruder detected, authorized user recognized).
* **Notification:** Handles outbound alert delivery logs to specific users.
* **Camera:** Encapsulates stream configurations, status monitoring, and image frame acquisition.
* **AIService:** Static/Utility service executing computer vision detection algorithms.
* **DatabaseService:** Abstracts database operations, queries, and ORM abstractions.
* **ArduinoService:** Serial interface client managing communication with edge hardware sensors and alarms.