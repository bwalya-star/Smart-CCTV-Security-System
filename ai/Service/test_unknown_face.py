import os
from models.face_recognition_module import FaceRecognitionModule


print("\n========================================")
print("UNKNOWN PERSON FACE TEST")
print("========================================")


# Initialize face recognition
face_recognition = FaceRecognitionModule()


# -----------------------------------------
# Unknown test image
# -----------------------------------------

image_path = os.path.join(
    face_recognition.service_dir,
    "face_data",
    "test_images",
    "unknown1.jpg"
)


print("\nTest image:")
print(image_path)


# -----------------------------------------
# Check image
# -----------------------------------------

if not os.path.exists(image_path):

    print("\nERROR: Test image does not exist.")

    print("\nExpected location:")
    print(image_path)

    raise SystemExit


# -----------------------------------------
# Perform recognition
# -----------------------------------------

result = face_recognition.recognize(image_path)


print("\n========================================")
print("RECOGNITION RESULT")
print("========================================")

print("Recognized:", result["recognized"])
print("Name:", result["name"])
print("Confidence:", result["confidence"])


# -----------------------------------------
# Evaluate
# -----------------------------------------

print("\n========================================")
print("TEST RESULT")
print("========================================")

if result["recognized"] is False:

    print("RESULT: PASS")
    print("Unknown person was not recognized as a known person.")

else:

    print("RESULT: REVIEW")
    print(
        "The system matched the face to:",
        result["name"]
    )


print("\n========================================")
print("TEST COMPLETE")
print("========================================")