import os
import cv2
import numpy as np
import insightface


class FaceRecognitionModule:

    def __init__(self):
        print("Initializing face recognition module...")

        # -----------------------------------------
        # Paths
        # -----------------------------------------
        self.service_dir = os.path.dirname(
            os.path.dirname(
                os.path.abspath(__file__)
            )
        )

        self.known_faces_dir = os.path.join(
            self.service_dir,
            "face_data",
            "known_faces"
        )

        self.encodings_dir = os.path.join(
            self.service_dir,
            "face_data",
            "encodings"
        )

        os.makedirs(self.known_faces_dir, exist_ok=True)
        os.makedirs(self.encodings_dir, exist_ok=True)

        self.recognition_threshold = float(
            os.getenv("FACE_RECOGNITION_THRESHOLD", "0.50")
        )

        print("Known faces directory:")
        print(self.known_faces_dir)

        print("Encodings directory:")
        print(self.encodings_dir)

        print(
            "Face recognition threshold:",
            self.recognition_threshold
        )

        # -----------------------------------------
        # InsightFace
        # -----------------------------------------
        print("Loading InsightFace model...")

        self.app = insightface.app.FaceAnalysis(
            name="buffalo_l",
            providers=["CPUExecutionProvider"]
        )

        self.app.prepare(
            ctx_id=0,
            det_size=(640, 640)
        )

        print("InsightFace model loaded successfully.")

        # -----------------------------------------
        # Known face storage
        # -----------------------------------------
        self.known_face_encodings = []
        self.known_face_names = []

        self.load_known_faces()

    # =============================================
    # Load known faces
    # =============================================
    def load_known_faces(self):

        print("\nLoading known faces...")

        if not os.path.exists(self.known_faces_dir):
            print("Known faces directory does not exist.")
            return

        for person_name in os.listdir(self.known_faces_dir):

            person_directory = os.path.join(
                self.known_faces_dir,
                person_name
            )

            if not os.path.isdir(person_directory):
                continue

            print(f"\nFound person: {person_name}")

            for filename in os.listdir(person_directory):

                image_path = os.path.join(
                    person_directory,
                    filename
                )

                # Only process image files
                if not filename.lower().endswith(
                    (".jpg", ".jpeg", ".png")
                ):
                    continue

                print(f"  Processing: {filename}")

                try:

                    image = cv2.imread(image_path)

                    if image is None:
                        print("  Could not read image.")
                        continue

                    faces = self.app.get(image)

                    if len(faces) == 0:
                        print("  No face detected.")
                        continue

                    # Select the largest face
                    face = max(
                        faces,
                        key=lambda f:
                        (f.bbox[2] - f.bbox[0]) *
                        (f.bbox[3] - f.bbox[1])
                    )

                    embedding = face.embedding

                    # Normalize embedding
                    embedding = embedding / np.linalg.norm(
                        embedding
                    )

                    self.known_face_encodings.append(
                        embedding
                    )

                    self.known_face_names.append(
                        person_name
                    )

                    print(
                        f"  Face enrolled successfully: "
                        f"{person_name}"
                    )

                except Exception as error:

                    print(
                        f"  Error processing {filename}: "
                        f"{error}"
                    )

        print("\n========================================")
        print("KNOWN FACE LOADING COMPLETE")
        print("========================================")

        print(
            "Total known face embeddings:",
            len(self.known_face_encodings)
        )

        print(
            "Total known names:",
            len(self.known_face_names)
        )

    # =============================================
    # Recognize a face
    # =============================================
    def recognize(self, image_path):

        print("\n========================================")
        print("FACE RECOGNITION")
        print("========================================")

        print("Image:")
        print(image_path)

        image = cv2.imread(image_path)

        if image is None:
            raise ValueError(
                f"Could not read image: {image_path}"
            )

        faces = self.app.get(image)

        print("Faces detected:", len(faces))

        if len(faces) == 0:

            return {
                "recognized": False,
                "name": "no_face",
                "confidence": 0.0
            }

        best_result = {
            "recognized": False,
            "name": "unknown",
            "confidence": 0.0
        }

        # Process each detected face
        for face in faces:

            embedding = face.embedding

            embedding = embedding / np.linalg.norm(
                embedding
            )

            # -------------------------------------
            # Compare against known faces
            # -------------------------------------
            best_similarity = -1
            best_name = "unknown"

            for known_embedding, known_name in zip(
                self.known_face_encodings,
                self.known_face_names
            ):

                similarity = float(
                    np.dot(
                        embedding,
                        known_embedding
                    )
                )

                if similarity > best_similarity:

                    best_similarity = similarity
                    best_name = known_name

            # -------------------------------------
            # Recognition threshold
            # -------------------------------------
            if best_similarity >= self.recognition_threshold:

                result = {
                    "recognized": True,
                    "name": best_name,
                    "confidence": round(
                        best_similarity,
                        4
                    )
                }

            else:

                result = {
                    "recognized": False,
                    "name": "unknown",
                    "confidence": round(
                        best_similarity,
                        4
                    )
                }

            # Keep the strongest result
            if result["confidence"] > best_result["confidence"]:

                best_result = result

        print(
            "Recognition result:",
            best_result
        )

        return best_result
