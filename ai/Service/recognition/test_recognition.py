import os

from face_recognition_module import FaceRecognition


PROJECT_ROOT = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(
                os.path.abspath(__file__)
            )
        )
    )
)


KNOWN_FACES_DIR = os.path.join(
    PROJECT_ROOT,
    "ai",
    "Service",
    "data",
    "known_faces"
)


recognizer = FaceRecognition(
    KNOWN_FACES_DIR
)


# Change this to an actual captured image
TEST_IMAGE = os.path.join(
    PROJECT_ROOT,
    "uploads",
    "capture_20260824_200516.jpg"
)


print()
print("==============================")
print("TESTING FACE RECOGNITION")
print("==============================")


results = recognizer.recognize(
    TEST_IMAGE
)


print()
print("Recognition results:")

for result in results:

    print(
        f"Name: {result['name']}"
    )

    print(
        f"Known: {result['known']}"
    )

    print(
        f"Confidence distance: "
        f"{result['confidence']}"
    )

    print("------------------------------")