import os
import sys
import csv
import numpy as np

# Allow importing modules from the Service folder
SERVICE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

sys.path.insert(0, SERVICE_DIR)

from models.face_recognition_module import FaceRecognitionModule


print("\n========================================")
print("FACE RECOGNITION THRESHOLD EVALUATION")
print("========================================")


# ============================================================
# Initialize face recognition
# ============================================================

face_recognition = FaceRecognitionModule()


# ============================================================
# Test images
# ============================================================

known_faces_dir = face_recognition.known_faces_dir

test_cases = [
    {
        "condition": "Bwalya Face 2",
        "path": os.path.join(
            known_faces_dir,
            "bwalya",
            "face2.jpg"
        ),
        "expected_name": "bwalya",
        "expected_known": True
    },

    {
        "condition": "Bwalya Face 3",
        "path": os.path.join(
            known_faces_dir,
            "bwalya",
            "face3.jpg"
        ),
        "expected_name": "bwalya",
        "expected_known": True
    },

    {
        "condition": "Sekelani Face 2",
        "path": os.path.join(
            known_faces_dir,
            "sekelani",
            "face2.jpg"
        ),
        "expected_name": "sekelani",
        "expected_known": True
    },

    {
        "condition": "Sekelani Face 3",
        "path": os.path.join(
            known_faces_dir,
            "sekelani",
            "face3.jpg"
        ),
        "expected_name": "sekelani",
        "expected_known": True
    },

    {
        "condition": "Unknown Person",
        "path": os.path.join(
            face_recognition.service_dir,
            "face_data",
            "test_images",
            "unknown1.jpg"
        ),
        "expected_name": "unknown",
        "expected_known": False
    }
]


# ============================================================
# Thresholds to evaluate
# ============================================================

thresholds = [
    0.40,
    0.45,
    0.50,
    0.55,
    0.60,
    0.65
]


# ============================================================
# Prepare output directory
# ============================================================

results_dir = os.path.join(
    face_recognition.service_dir,
    "evaluation",
    "results"
)

os.makedirs(results_dir, exist_ok=True)


csv_path = os.path.join(
    results_dir,
    "face_recognition_threshold_results.csv"
)


summary_path = os.path.join(
    results_dir,
    "face_recognition_threshold_summary.txt"
)


# ============================================================
# Function: get similarity scores
# ============================================================

def get_best_match(image_path):

    import cv2

    image = cv2.imread(image_path)

    if image is None:
        raise ValueError(
            f"Could not read image: {image_path}"
        )

    faces = face_recognition.app.get(image)

    if len(faces) == 0:

        return {
            "face_detected": False,
            "name": "no_face",
            "similarity": 0.0
        }

    best_similarity = -1
    best_name = "unknown"

    for face in faces:

        embedding = face.embedding

        embedding = embedding / np.linalg.norm(
            embedding
        )

        for known_embedding, known_name in zip(
            face_recognition.known_face_encodings,
            face_recognition.known_face_names
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

    return {
        "face_detected": True,
        "name": best_name,
        "similarity": best_similarity
    }


# ============================================================
# Run evaluation
# ============================================================

results = []


for threshold in thresholds:

    print("\n========================================")
    print(f"THRESHOLD: {threshold:.2f}")
    print("========================================")

    tp = 0
    tn = 0
    fp = 0
    fn = 0

    threshold_confidences = []

    for test in test_cases:

        print("\nTesting:", test["condition"])

        image_path = test["path"]

        if not os.path.exists(image_path):

            print("ERROR: Image not found:")
            print(image_path)

            continue

        match = get_best_match(image_path)

        similarity = match["similarity"]
        best_name = match["name"]

        threshold_confidences.append(
            similarity
        )

        recognized = (
            match["face_detected"]
            and similarity >= threshold
        )

        # ----------------------------------------------------
        # Evaluate known person
        # ----------------------------------------------------

        if test["expected_known"]:

            if (
                recognized
                and best_name.lower()
                == test["expected_name"].lower()
            ):

                result_type = "TP"
                tp += 1

            else:

                result_type = "FN"
                fn += 1

        # ----------------------------------------------------
        # Evaluate unknown person
        # ----------------------------------------------------

        else:

            if recognized:

                result_type = "FP"
                fp += 1

            else:

                result_type = "TN"
                tn += 1

        print(
            f"Similarity: {similarity:.4f} | "
            f"Match: {best_name} | "
            f"Result: {result_type}"
        )

        results.append({
            "threshold": threshold,
            "condition": test["condition"],
            "expected_name": test["expected_name"],
            "matched_name": best_name,
            "similarity": round(similarity, 4),
            "recognized": recognized,
            "result": result_type
        })

    # --------------------------------------------------------
    # Metrics
    # --------------------------------------------------------

    total = tp + tn + fp + fn

    accuracy = (
        (tp + tn) / total * 100
        if total > 0
        else 0
    )

    detection_rate = (
        tp / (tp + fn) * 100
        if (tp + fn) > 0
        else 0
    )

    false_positive_rate = (
        fp / (fp + tn) * 100
        if (fp + tn) > 0
        else 0
    )

    false_negative_rate = (
        fn / (fn + tp) * 100
        if (fn + tp) > 0
        else 0
    )

    average_similarity = (
        sum(threshold_confidences)
        / len(threshold_confidences)
        if threshold_confidences
        else 0
    )

    print("\n----------------------------------------")
    print(f"TP: {tp}")
    print(f"TN: {tn}")
    print(f"FP: {fp}")
    print(f"FN: {fn}")

    print(
        f"Accuracy: {accuracy:.2f}%"
    )

    print(
        f"Recognition Rate: {detection_rate:.2f}%"
    )

    print(
        f"False Positive Rate: "
        f"{false_positive_rate:.2f}%"
    )

    print(
        f"False Negative Rate: "
        f"{false_negative_rate:.2f}%"
    )

    print(
        f"Average Similarity: "
        f"{average_similarity:.4f}"
    )


# ============================================================
# Save CSV
# ============================================================

with open(
    csv_path,
    "w",
    newline="",
    encoding="utf-8"
) as file:

    writer = csv.DictWriter(
        file,
        fieldnames=[
            "threshold",
            "condition",
            "expected_name",
            "matched_name",
            "similarity",
            "recognized",
            "result"
        ]
    )

    writer.writeheader()

    writer.writerows(results)


# ============================================================
# Generate summary
# ============================================================

summary_lines = []

summary_lines.append(
    "FACE RECOGNITION THRESHOLD EVALUATION"
)

summary_lines.append(
    "========================================"
)

summary_lines.append(
    "Model: InsightFace buffalo_l"
)

summary_lines.append(
    "Known persons: bwalya, sekelani"
)

summary_lines.append(
    "Known face images: 10"
)

summary_lines.append(
    "Unknown test images: 1"
)

summary_lines.append("")

summary_lines.append(
    "Thresholds tested: "
    + ", ".join(
        f"{threshold:.2f}"
        for threshold in thresholds
    )
)

summary_lines.append("")

summary_lines.append(
    "Detailed results are stored in:"
)

summary_lines.append(
    csv_path
)


with open(
    summary_path,
    "w",
    encoding="utf-8"
) as file:

    file.write(
        "\n".join(summary_lines)
    )


# ============================================================
# Complete
# ============================================================

print("\n========================================")
print("EVALUATION COMPLETE")
print("========================================")

print("\nCSV results:")
print(csv_path)

print("\nSummary:")
print(summary_path)