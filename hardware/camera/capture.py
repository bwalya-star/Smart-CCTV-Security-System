import cv2
import os
from datetime import datetime

UPLOAD_DIR = "../../uploads"

def capture_image():
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Cannot access camera")
        return None

    ret, frame = cap.read()
    cap.release()

    if not ret:
        print("Failed to capture image")
        return None

    # Create filename
    filename = f"capture_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
    filepath = os.path.join(UPLOAD_DIR, filename)

    cv2.imwrite(filepath, frame)

    print(f"Image saved: {filepath}")

    return filepath
