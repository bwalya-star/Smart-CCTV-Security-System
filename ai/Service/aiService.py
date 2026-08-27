import os
import cv2

from models.detectionModel import DetectionModel


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


def detect_person(image_path):

    print("=================================")
    print("AI SERVICE")
    print("Image received:")
    print(image_path)
    print("=================================")


    # Convert web path to filesystem path
    image_path = resolve_image_path(
        image_path
    )


    # Check image exists
    if not os.path.exists(image_path):

        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )


    # Check that OpenCV can read it
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


    # ==================================
    # YOLO DETECTION
    # ==================================

    detections = detection_model.detect(
        image_path
    )


    # ==================================
    # FIND PERSONS
    # ==================================

    person_detections = [

        detection

        for detection in detections

        if detection["label"] == "person"

    ]


    # ==================================
    # SECURITY CLASSIFICATION
    # ==================================

    if person_detections:

        best_detection = max(

            person_detections,

            key=lambda detection:
                detection["confidence"]

        )

        detected = True

        confidence = (
            best_detection["confidence"]
        )

        label = "person"

        status = "threat"


    else:

        detected = False

        confidence = 0.0

        label = "no_person"

        status = "safe"


    # ==================================
    # RETURN RESULT
    # ==================================

    return {

        "detected": detected,

        "confidence": confidence,

        "label": label,

        "status": status,

        "detections": detections

    }