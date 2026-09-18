from models.face_recognition_module import FaceRecognitionModule


print("\n========================================")
print("FACE RECOGNITION MODULE TEST")
print("========================================")


face_recognition = FaceRecognitionModule()


print("\nModule initialized successfully.")

print(
    "Known face encodings:",
    len(face_recognition.known_face_encodings)
)

print(
    "Known face names:",
    len(face_recognition.known_face_names)
)

print("\n========================================")
print("TEST COMPLETE")
print("========================================")