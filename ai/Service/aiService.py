import os
import cv2

from models.detectionModel import DetectionModel
from models.face_recognition_module import FaceRecognitionModule


# Project root
PROJECT_ROOT = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)


UPLOADS_DIR = os.path.join(
    PROJECT_ROOT,
    "uploads"
)


# Load YOLO once when the AI service starts
detection_model = DetectionModel()
face_recognition_module = FaceRecognitionModule()


def resolve_image_path(image_path):

    print(
        "Received image path:",
        image_path
    )

    # Convert web path to local filesystem path
    if image_path.startswith("/uploads/"):

        filename = os.path.basename(
            image_path
        )

        image_path = os.path.join(
            UPLOADS_DIR,
            filename
        )

    print(
        "Resolved filesystem path:"
    )

    print(image_path)

    return image_path


def detect_person(image_path, user_id=None):

    print("\n=================================")
    print("AI SERVICE")
    print("=================================")

    print("Image received:")
    print(image_path)

    print("=================================")

    image_path = resolve_image_path(
        image_path
    )

    if not os.path.exists(image_path):
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    image = cv2.imread(
        image_path
    )

    if image is None:
        raise ValueError(
            "Could not read image."
        )

    height, width = image.shape[:2]

    print(
        f"Image loaded successfully: "
        f"{width}x{height}"
    )

    # ==========================================
    # YOLO PERSON DETECTION
    # ==========================================

    print("\n=================================")
    print("YOLO PERSON DETECTION")
    print("=================================")

    model_result = detection_model.detect(
        image_path
    )

    detections = model_result[
        "detections"
    ]

    processing_time_ms = model_result[
        "processing_time_ms"
    ]


    # ==================================
    # FIND PERSONS
    # ==================================

    person_detections = [
        detection
        for detection in detections
        if detection["label"] == "person"
    ]

    print(
        "Persons detected:",
        len(person_detections)
    )

    # ==========================================
    # NO PERSON DETECTED
    # ==========================================

    if not person_detections:

        print("No person detected.")

        return {
            "detected": False,
            "confidence": 0.0,
            "label": "no_person",
            "detections": detections,
            "processing_time_ms": processing_time_ms,
            "alert_classification": "NO_PERSON",
            "severity": "INFO",

            "face_recognition": {
                "performed": False,
                "recognized": False,
                "name": "no_person",
                "similarity": 0.0,
                "identity_status": "not_checked"
            }
        }

    # ==========================================
    # BEST PERSON DETECTION
    # ==========================================

    best_detection = max(
        person_detections,
        key=lambda detection:
        detection["confidence"]
    )

    detected = True

    confidence = best_detection[
        "confidence"
    ]

    label = "person"

    # ==========================================
    # FACE RECOGNITION
    # ==========================================

    print("\n=================================")
    print("FACE RECOGNITION")
    print("=================================")

    try:

        face_result = face_recognition_module.recognize(
            image_path,
            user_id
        )

        print(
            "Face recognition result:",
            face_result
        )

    except Exception as error:

        print(
            "Face recognition error:",
            error
        )

        face_result = {
            "recognized": False,
            "name": "error",
            "confidence": 0.0
        }

    # ==========================================
    # INTERPRET FACE RESULT
    # ==========================================

    face_name = face_result.get(
        "name",
        "unknown"
    )

    face_recognized = face_result.get(
        "recognized",
        False
    )

    face_similarity = face_result.get(
        "confidence",
        0.0
    )

    # ==========================================
    # DETERMINE IDENTITY STATUS
    # ==========================================

    if face_recognized:

        identity_status = "known"
        alert_classification = "KNOWN_PERSON"
        severity = "LOW"

    elif face_name == "unknown":

        identity_status = "unknown"
        alert_classification = "UNKNOWN_PERSON"
        severity = "HIGH"

    else:

        identity_status = "unidentified"
        alert_classification = "UNIDENTIFIED_PERSON"
        severity = "MEDIUM"

    print("\n=================================")
    print("AI DECISION")
    print("=================================")

    print(
        "Person detected:",
        detected
    )

    print(
        "Person confidence:",
        confidence
    )

    print(
        "Face identity:",
        face_name
    )

    print(
        "Face similarity:",
        face_similarity
    )

    print(
        "Identity status:",
        identity_status
    )

    print(
        f"Alert classification: {alert_classification}"
    )

    print(
        f"Severity: {severity}"
    )

    return {
        "detected": detected,

        "confidence": confidence,

        "label": label,

        "detections": detections,

        "processing_time_ms":
            processing_time_ms,

        "alert_classification":
            alert_classification,

        "severity":
            severity,

        "face_recognition": {
            "performed": True,

            "recognized":
                face_recognized,

            "name":
                face_name,

            "similarity":
                face_similarity,

            "identity_status":
                identity_status
        }
    }