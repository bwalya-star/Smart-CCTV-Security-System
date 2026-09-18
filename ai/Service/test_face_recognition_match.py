import os
from models.face_recognition_module import FaceRecognitionModule


print("\n========================================")
print("CROSS-IMAGE FACE RECOGNITION TEST")
print("========================================")


# Initialize module
face_recognition = FaceRecognitionModule()


# -----------------------------------------
# Test different images from enrolled ones
# -----------------------------------------

test_cases = [
    (
        "bwalya",
        os.path.join(
            face_recognition.known_faces_dir,
            "bwalya",
            "face2.jpg"
        )
    ),
    (
        "bwalya",
        os.path.join(
            face_recognition.known_faces_dir,
            "bwalya",
            "face3.jpg"
        )
    ),
    (
        "sekelani",
        os.path.join(
            face_recognition.known_faces_dir,
            "sekelani",
            "face2.jpg"
        )
    ),
    (
        "sekelani",
        os.path.join(
            face_recognition.known_faces_dir,
            "sekelani",
            "face3.jpg"
        )
    )
]


passed = 0
failed = 0


# -----------------------------------------
# Run tests
# -----------------------------------------

for expected_name, image_path in test_cases:

    print("\n----------------------------------------")
    print("Expected:", expected_name)
    print("Image:", image_path)
    print("----------------------------------------")

    if not os.path.exists(image_path):

        print("ERROR: Image does not exist.")
        failed += 1
        continue

    result = face_recognition.recognize(image_path)

    recognized_name = result["name"]
    confidence = result["confidence"]

    print("\nExpected person:", expected_name)
    print("Recognized person:", recognized_name)
    print("Recognized:", result["recognized"])
    print("Confidence:", confidence)

    if (
        result["recognized"]
        and recognized_name.lower() == expected_name.lower()
    ):

        print("RESULT: PASS")
        passed += 1

    else:

        print("RESULT: FAIL")
        failed += 1


# -----------------------------------------
# Summary
# -----------------------------------------

total = passed + failed

print("\n========================================")
print("CROSS-IMAGE TEST SUMMARY")
print("========================================")

print("Total tests:", total)
print("Passed:", passed)
print("Failed:", failed)

if total > 0:

    recognition_rate = (passed / total) * 100

    print(
        f"Recognition rate: {recognition_rate:.2f}%"
    )

print("\n========================================")
print("TEST COMPLETE")
print("========================================")