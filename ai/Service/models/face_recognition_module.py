import os
import json
import re
import threading
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

        self.enrolled_people_dir = os.path.join(
            self.service_dir,
            "face_data",
            "enrolled_people"
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
        self.known_face_user_ids = []
        self.known_faces_signature = None
        self.known_faces_lock = threading.RLock()

        self.load_known_faces()

    # =============================================
    # Load known faces
    # =============================================
    def load_known_faces(self):
        with self.known_faces_lock:
            self._load_known_faces()

    def _load_known_faces(self):
        print("\nLoading known faces...")
        self.known_face_encodings = []
        self.known_face_names = []
        self.known_face_user_ids = []

        legacy_identity_names = set()
        if os.path.isdir(self.enrolled_people_dir):
            for person_name in os.listdir(self.enrolled_people_dir):
                if not re.fullmatch(r"user_\d+_person_\d+", person_name):
                    continue

                metadata_path = os.path.join(
                    self.enrolled_people_dir,
                    person_name,
                    "person.json"
                )
                try:
                    with open(metadata_path, "r", encoding="utf-8") as metadata_file:
                        metadata = json.load(metadata_file)
                    legacy_source = metadata.get("legacy_source")
                    if isinstance(legacy_source, str) and legacy_source.strip():
                        legacy_identity_names.add(legacy_source.strip().casefold())
                except (OSError, ValueError, KeyError, TypeError) as error:
                    print(f"Skipping invalid enrollment metadata {metadata_path}: {error}")

        datasets = [
            (self.known_faces_dir, False),
            (self.enrolled_people_dir, True)
        ]

        for dataset_directory, managed in datasets:
            if not os.path.exists(dataset_directory):
                continue

            for person_name in os.listdir(dataset_directory):

                if managed and not re.fullmatch(
                    r"user_\d+_person_\d+",
                    person_name
                ):
                    continue

                person_directory = os.path.join(
                    dataset_directory,
                    person_name
                )

                if not os.path.isdir(person_directory):
                    continue

                if not managed and person_name.strip().casefold() in legacy_identity_names:
                    print(f"Skipping legacy identity already managed by an account: {person_name}")
                    continue

                display_name = person_name
                owner_id = None

                if managed:
                    metadata_path = os.path.join(person_directory, "person.json")
                    try:
                        with open(metadata_path, "r", encoding="utf-8") as metadata_file:
                            metadata = json.load(metadata_file)
                        display_name = metadata["name"]
                        owner_id = int(metadata["user_id"])
                    except (OSError, ValueError, KeyError, TypeError) as error:
                        print(f"Skipping invalid enrollment metadata {metadata_path}: {error}")
                        continue

                print(f"\nFound person: {display_name}")

                for filename in os.listdir(person_directory):

                    image_path = os.path.join(
                        person_directory,
                        filename
                    )

                    if not filename.lower().endswith(
                        (".jpg", ".jpeg", ".png", ".webp")
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

                        face = max(
                            faces,
                            key=lambda f:
                            (f.bbox[2] - f.bbox[0]) *
                            (f.bbox[3] - f.bbox[1])
                        )

                        embedding = face.embedding
                        embedding = embedding / np.linalg.norm(embedding)

                        self.known_face_encodings.append(embedding)
                        self.known_face_names.append(display_name)
                        self.known_face_user_ids.append(owner_id)

                        print(f"  Face enrolled successfully: {display_name}")

                    except Exception as error:
                        print(f"  Error processing {filename}: {error}")

        self.known_faces_signature = self.get_known_faces_signature()
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

    def get_known_faces_signature(self):
        signature = []
        for dataset_directory in (self.known_faces_dir, self.enrolled_people_dir):
            for current_directory, directories, filenames in os.walk(dataset_directory):
                directories.sort()
                filenames.sort()
                try:
                    directory_stat = os.stat(current_directory)
                    signature.append((current_directory, directory_stat.st_mtime_ns))
                except OSError:
                    continue

                for filename in filenames:
                    file_path = os.path.join(current_directory, filename)
                    try:
                        file_stat = os.stat(file_path)
                        signature.append((file_path, file_stat.st_mtime_ns, file_stat.st_size))
                    except OSError:
                        continue
        return tuple(signature)

    # =============================================
    # Recognize a face
    # =============================================
    def recognize(self, image_path, user_id=None):
        signature = self.get_known_faces_signature()
        with self.known_faces_lock:
            if signature != self.known_faces_signature:
                self._load_known_faces()
            known_face_encodings = tuple(self.known_face_encodings)
            known_face_names = tuple(self.known_face_names)
            known_face_user_ids = tuple(self.known_face_user_ids)

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

            for known_embedding, known_name, known_user_id in zip(
                known_face_encodings,
                known_face_names,
                known_face_user_ids
            ):

                if known_user_id is not None and str(known_user_id) != str(user_id):
                    continue

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
