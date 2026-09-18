import os
import sys
import csv
import time


# ==========================================
# CONFIGURATION
# ==========================================

SERVICE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

sys.path.insert(0, SERVICE_DIR)

from models.face_recognition_module import FaceRecognitionModule

FACE_DATA_DIR = os.path.join(
    SERVICE_DIR,
    "face_data"
)

TEST_IMAGES_DIR = os.path.join(
    FACE_DATA_DIR,
    "test_images"
)

RESULTS_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "results"
)

os.makedirs(RESULTS_DIR, exist_ok=True)

THRESHOLD = 0.50


# ==========================================
# TEST DATA
# ==========================================

TEST_CASES = [

    {
        "image": os.path.join(
            FACE_DATA_DIR,
            "known_faces",
            "bwalya",
            "face2.jpg"
        ),
        "expected": "bwalya"
    },

    {
        "image": os.path.join(
            FACE_DATA_DIR,
            "known_faces",
            "bwalya",
            "face3.jpg"
        ),
        "expected": "bwalya"
    },

    {
        "image": os.path.join(
            FACE_DATA_DIR,
            "known_faces",
            "sekelani",
            "face2.jpg"
        ),
        "expected": "sekelani"
    },

    {
        "image": os.path.join(
            FACE_DATA_DIR,
            "known_faces",
            "sekelani",
            "face3.jpg"
        ),
        "expected": "sekelani"
    },

    {
        "image": os.path.join(
            TEST_IMAGES_DIR,
            "unknown1.jpg"
        ),
        "expected": "unknown"
    }
]


# ==========================================
# RESULT FILES
# ==========================================

CSV_FILE = os.path.join(
    RESULTS_DIR,
    "face_recognition_results.csv"
)

SUMMARY_FILE = os.path.join(
    RESULTS_DIR,
    "face_recognition_evaluation_summary.txt"
)


# ==========================================
# INITIALIZE FACE RECOGNITION
# ==========================================

print("========================================")
print("FACE RECOGNITION EVALUATION")
print("========================================")

print(f"Recognition threshold: {THRESHOLD}")

face_recognition = FaceRecognitionModule()


# ==========================================
# METRICS
# ==========================================

TP = 0
TN = 0
FP = 0
FN = 0

similarities = []
processing_times = []

results = []


# ==========================================
# RUN TESTS
# ==========================================

for index, test_case in enumerate(TEST_CASES, start=1):

    image_path = test_case["image"]
    expected = test_case["expected"]

    print("\n----------------------------------------")
    print(f"TEST {index}")
    print("----------------------------------------")

    print("Image:")
    print(image_path)

    print("Expected identity:")
    print(expected)

    if not os.path.exists(image_path):

        print("ERROR: Image does not exist.")

        results.append({
            "test": index,
            "image": os.path.basename(image_path),
            "expected": expected,
            "predicted": "file_not_found",
            "similarity": 0.0,
            "processing_time_ms": 0.0,
            "recognized": False,
            "result": "ERROR"
        })

        continue

    # Measure processing time
    start_time = time.perf_counter()

    recognition_result = face_recognition.recognize(
        image_path
    )

    end_time = time.perf_counter()

    processing_time_ms = (
        end_time - start_time
    ) * 1000

    predicted = recognition_result["name"]

    similarity = float(
        recognition_result["confidence"]
    )

    recognized = recognition_result["recognized"]

    similarities.append(similarity)
    processing_times.append(processing_time_ms)

    # --------------------------------------
    # Classification
    # --------------------------------------

    if expected != "unknown":

        if predicted == expected:

            TP += 1
            result = "TP"

        elif predicted == "unknown":

            FN += 1
            result = "FN"

        else:

            FN += 1
            result = "FN"

    else:

        if predicted == "unknown":

            TN += 1
            result = "TN"

        else:

            FP += 1
            result = "FP"

    # --------------------------------------
    # Display
    # --------------------------------------

    print("Predicted identity:")
    print(predicted)

    print(
        f"Face similarity: {similarity:.4f}"
    )

    print(
        f"Processing time: "
        f"{processing_time_ms:.2f} ms"
    )

    print("Classification:")
    print(result)

    results.append({
        "test": index,
        "image": os.path.basename(image_path),
        "expected": expected,
        "predicted": predicted,
        "similarity": round(similarity, 4),
        "processing_time_ms": round(
            processing_time_ms,
            2
        ),
        "recognized": recognized,
        "result": result
    })


# ==========================================
# CALCULATE METRICS
# ==========================================

total_tests = len(results)

classified_tests = TP + TN + FP + FN

if classified_tests > 0:

    accuracy = (
        (TP + TN) /
        classified_tests
    ) * 100

else:

    accuracy = 0.0


known_tests = TP + FN

if known_tests > 0:

    recognition_rate = (
        TP /
        known_tests
    ) * 100

else:

    recognition_rate = 0.0


unknown_tests = TN + FP

if unknown_tests > 0:

    false_positive_rate = (
        FP /
        unknown_tests
    ) * 100

else:

    false_positive_rate = 0.0


if known_tests > 0:

    false_negative_rate = (
        FN /
        known_tests
    ) * 100

else:

    false_negative_rate = 0.0


if similarities:

    average_similarity = (
        sum(similarities) /
        len(similarities)
    )

else:

    average_similarity = 0.0


if processing_times:

    average_processing_time = (
        sum(processing_times) /
        len(processing_times)
    )

else:

    average_processing_time = 0.0


# ==========================================
# SAVE CSV
# ==========================================

with open(
    CSV_FILE,
    "w",
    newline="",
    encoding="utf-8"
) as file:

    writer = csv.DictWriter(
        file,
        fieldnames=[
            "test",
            "image",
            "expected",
            "predicted",
            "similarity",
            "processing_time_ms",
            "recognized",
            "result"
        ]
    )

    writer.writeheader()

    writer.writerows(results)


# ==========================================
# SAVE SUMMARY
# ==========================================

with open(
    SUMMARY_FILE,
    "w",
    encoding="utf-8"
) as file:

    file.write(
        "FACE RECOGNITION EVALUATION SUMMARY\n"
    )

    file.write(
        "========================================\n\n"
    )

    file.write(
        f"Recognition threshold: {THRESHOLD:.2f}\n"
    )

    file.write(
        f"Total tests: {total_tests}\n\n"
    )

    file.write(
        "CLASSIFICATION METRICS\n"
    )

    file.write(
        "----------------------------------------\n"
    )

    file.write(f"True Positives (TP): {TP}\n")
    file.write(f"True Negatives (TN): {TN}\n")
    file.write(f"False Positives (FP): {FP}\n")
    file.write(f"False Negatives (FN): {FN}\n\n")

    file.write(
        f"Accuracy: {accuracy:.2f}%\n"
    )

    file.write(
        f"Recognition Rate: "
        f"{recognition_rate:.2f}%\n"
    )

    file.write(
        f"False Positive Rate: "
        f"{false_positive_rate:.2f}%\n"
    )

    file.write(
        f"False Negative Rate: "
        f"{false_negative_rate:.2f}%\n\n"
    )

    file.write(
        "FACE SIMILARITY\n"
    )

    file.write(
        "----------------------------------------\n"
    )

    file.write(
        f"Average similarity: "
        f"{average_similarity:.4f}\n\n"
    )

    file.write(
        "PROCESSING PERFORMANCE\n"
    )

    file.write(
        "----------------------------------------\n"
    )

    file.write(
        f"Average processing time: "
        f"{average_processing_time:.2f} ms\n"
    )


# ==========================================
# FINAL CONSOLE OUTPUT
# ==========================================

print("\n========================================")
print("EVALUATION COMPLETE")
print("========================================")

print(f"Total tests: {total_tests}")

print(f"TP: {TP}")
print(f"TN: {TN}")
print(f"FP: {FP}")
print(f"FN: {FN}")

print(f"Accuracy: {accuracy:.2f}%")

print(
    f"Recognition Rate: "
    f"{recognition_rate:.2f}%"
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

print(
    f"Average Processing Time: "
    f"{average_processing_time:.2f} ms"
)

print("\nResults saved to:")

print(CSV_FILE)

print(SUMMARY_FILE)

print("\n========================================")
print("DONE")
print("========================================")