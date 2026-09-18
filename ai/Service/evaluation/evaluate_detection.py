import os
import sys
import time
import cv2

# Allow importing modules from the Service folder
SERVICE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

sys.path.insert(0, SERVICE_DIR)

from models.detectionModel import DetectionModel


# ---------------------------------------
# Configuration
# ---------------------------------------

TEST_IMAGES_DIR = os.path.join(
    os.path.dirname(__file__),
    "test_images"
)

model = DetectionModel()


# ---------------------------------------
# Evaluation categories
# ---------------------------------------

test_cases = [
    {
        "name": "Empty Scene",
        "file": "empty.jpg",
        "expected_person": False
    },
    {
        "name": "Person Nearby",
        "file": "person_nearby.jpg",
        "expected_person": True
    },
    {
        "name": "Person Far Away",
        "file": "person_far.jpg",
        "expected_person": True
    },
    {
        "name": "Multiple People",
        "file": "multiple_people.jpg",
        "expected_person": True
    },
    {
        "name": "Low Light",
        "file": "low_light.jpg",
        "expected_person": True
    }
]


# ---------------------------------------
# Metrics
# ---------------------------------------

true_positive = 0
true_negative = 0
false_positive = 0
false_negative = 0

confidences = []
processing_times = []


# ---------------------------------------
# Run tests
# ---------------------------------------

print("\n========================================")
print("AI DETECTION PERFORMANCE EVALUATION")
print("========================================")

for test in test_cases:

    image_path = os.path.join(
        TEST_IMAGES_DIR,
        test["file"]
    )

    print("\n----------------------------------------")
    print(f"Test: {test['name']}")
    print(f"Image: {image_path}")

    if not os.path.exists(image_path):
        print("ERROR: Image not found.")
        continue

    try:
        start_time = time.perf_counter()

        result = model.detect(image_path)

        end_time = time.perf_counter()

        processing_time_ms = (
            end_time - start_time
        ) * 1000

        detections = result["detections"]

        person_detections = [
            detection
            for detection in detections
            if detection["label"] == "person"
        ]

        detected_person = len(person_detections) > 0

        # --------------------------------
        # Classification
        # --------------------------------

        if test["expected_person"] and detected_person:
            true_positive += 1
            result_type = "TRUE POSITIVE"

        elif not test["expected_person"] and not detected_person:
            true_negative += 1
            result_type = "TRUE NEGATIVE"

        elif not test["expected_person"] and detected_person:
            false_positive += 1
            result_type = "FALSE POSITIVE"

        else:
            false_negative += 1
            result_type = "FALSE NEGATIVE"

        # --------------------------------
        # Confidence
        # --------------------------------

        if person_detections:

            best_confidence = max(
                detection["confidence"]
                for detection in person_detections
            )

            confidences.append(best_confidence)

            print(
                f"Person confidence: "
                f"{best_confidence:.4f}"
            )

        else:
            print("Person confidence: 0.0000")

        processing_times.append(
            processing_time_ms
        )

        print(f"Detected person: {detected_person}")
        print(f"Expected person: {test['expected_person']}")
        print(f"Result: {result_type}")
        print(
            f"Processing time: "
            f"{processing_time_ms:.2f} ms"
        )

    except Exception as error:

        print(
            f"ERROR during test: {error}"
        )


# ---------------------------------------
# Calculate metrics
# ---------------------------------------

total_tests = (
    true_positive
    + true_negative
    + false_positive
    + false_negative
)

if total_tests > 0:

    detection_rate = (
        true_positive /
        (true_positive + false_negative)
        * 100
        if (true_positive + false_negative) > 0
        else 0
    )

    false_positive_rate = (
        false_positive /
        (false_positive + true_negative)
        * 100
        if (false_positive + true_negative) > 0
        else 0
    )

    false_negative_rate = (
        false_negative /
        (false_negative + true_positive)
        * 100
        if (false_negative + true_positive) > 0
        else 0
    )

    accuracy = (
        (true_positive + true_negative) /
        total_tests
        * 100
    )

else:

    detection_rate = 0
    false_positive_rate = 0
    false_negative_rate = 0
    accuracy = 0


average_confidence = (
    sum(confidences) / len(confidences)
    if confidences
    else 0
)

average_processing_time = (
    sum(processing_times) /
    len(processing_times)
    if processing_times
    else 0
)


# ---------------------------------------
# Display final results
# ---------------------------------------

print("\n\n========================================")
print("FINAL AI PERFORMANCE RESULTS")
print("========================================")

print(f"Total tests:             {total_tests}")

print(f"True positives:          {true_positive}")
print(f"True negatives:          {true_negative}")
print(f"False positives:         {false_positive}")
print(f"False negatives:         {false_negative}")

print("----------------------------------------")

print(
    f"Detection rate:          "
    f"{detection_rate:.2f}%"
)

print(
    f"False positive rate:     "
    f"{false_positive_rate:.2f}%"
)

print(
    f"False negative rate:     "
    f"{false_negative_rate:.2f}%"
)

print(
    f"Accuracy:                "
    f"{accuracy:.2f}%"
)

print(
    f"Average confidence:      "
    f"{average_confidence:.4f}"
)

print(
    f"Average processing time: "
    f"{average_processing_time:.2f} ms"
)

print("========================================")