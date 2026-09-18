import os
import sys
import csv
import statistics

# Allow importing modules from the Service folder when run from the project root.
SERVICE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)
sys.path.insert(0, SERVICE_DIR)

from models.detectionModel import DetectionModel


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_IMAGES_DIR = os.path.join(BASE_DIR, "test_images")
RESULTS_DIR = os.path.join(BASE_DIR, "results")
CSV_FILE = os.path.join(RESULTS_DIR, "benchmark_results.csv")
SUMMARY_FILE = os.path.join(RESULTS_DIR, "evaluation_summary.txt")
RUNS_PER_IMAGE = 5

os.makedirs(RESULTS_DIR, exist_ok=True)

test_cases = [
    {"name": "Empty Scene", "file": "empty.jpg", "expected_person": False},
    {"name": "Person Nearby", "file": "person_nearby.jpg", "expected_person": True},
    {"name": "Person Far Away", "file": "person_far.jpg", "expected_person": True},
    {"name": "Multiple People", "file": "multiple_people.jpg", "expected_person": True},
    {"name": "Low Light", "file": "low_light.jpg", "expected_person": True}
]

model = DetectionModel()
csv_rows = []
all_processing_times = []
positive_processing_times = []
all_confidences = []
true_positive = 0
true_negative = 0
false_positive = 0
false_negative = 0

print("\n========================================")
print("AI DETECTION PERFORMANCE BENCHMARK")
print("========================================")
print(f"Runs per image: {RUNS_PER_IMAGE}")
print("First run will be treated as warm-up.")

for test in test_cases:
    image_path = os.path.join(TEST_IMAGES_DIR, test["file"])
    print("\n----------------------------------------")
    print(f"Test: {test['name']}")

    if not os.path.exists(image_path):
        print("ERROR: Image not found.")
        print(image_path)
        continue

    test_times = []
    test_confidences = []

    for run in range(1, RUNS_PER_IMAGE + 1):
        try:
            result = model.detect(image_path)
            detections = result["detections"]
            processing_time_ms = result["processing_time_ms"]
            person_detections = [
                detection for detection in detections
                if detection["label"] == "person"
            ]
            detected_person = len(person_detections) > 0

            if person_detections:
                confidence = max(
                    detection["confidence"]
                    for detection in person_detections
                )
                test_confidences.append(confidence)
                all_confidences.append(confidence)
            else:
                confidence = 0.0

            if test["expected_person"] and detected_person:
                result_type = "TRUE_POSITIVE"
                true_positive += 1
            elif not test["expected_person"] and not detected_person:
                result_type = "TRUE_NEGATIVE"
                true_negative += 1
            elif not test["expected_person"] and detected_person:
                result_type = "FALSE_POSITIVE"
                false_positive += 1
            else:
                result_type = "FALSE_NEGATIVE"
                false_negative += 1

            test_times.append(processing_time_ms)
            all_processing_times.append(processing_time_ms)
            if test["expected_person"]:
                positive_processing_times.append(processing_time_ms)

            csv_rows.append([
                test["name"], run, round(processing_time_ms, 2),
                detected_person, test["expected_person"],
                round(confidence, 4), result_type
            ])
            print(
                f"Run {run}: {processing_time_ms:.2f} ms | "
                f"Detected: {detected_person} | "
                f"Confidence: {confidence:.4f} | {result_type}"
            )
        except Exception as error:
            print(f"ERROR during run {run}: {error}")

    warm_times = test_times[1:]
    average_time = statistics.mean(warm_times) if warm_times else 0
    minimum_time = min(warm_times) if warm_times else 0
    maximum_time = max(warm_times) if warm_times else 0
    average_confidence = (
        statistics.mean(test_confidences)
        if test_confidences else 0
    )

    print("\nResults:")
    print(f"Average processing time: {average_time:.2f} ms")
    print(f"Minimum processing time: {minimum_time:.2f} ms")
    print(f"Maximum processing time: {maximum_time:.2f} ms")
    print(f"Average confidence: {average_confidence:.4f}")

total_tests = (
    true_positive + true_negative + false_positive + false_negative
)
detection_rate = (
    true_positive / (true_positive + false_negative) * 100
    if true_positive + false_negative else 0
)
false_positive_rate = (
    false_positive / (false_positive + true_negative) * 100
    if false_positive + true_negative else 0
)
false_negative_rate = (
    false_negative / (false_negative + true_positive) * 100
    if false_negative + true_positive else 0
)
accuracy = (
    (true_positive + true_negative) / total_tests * 100
    if total_tests else 0
)
average_confidence = statistics.mean(all_confidences) if all_confidences else 0
average_processing_time = (
    statistics.mean(all_processing_times)
    if all_processing_times else 0
)
average_positive_time = (
    statistics.mean(positive_processing_times)
    if positive_processing_times else 0
)
minimum_processing_time = min(all_processing_times) if all_processing_times else 0
maximum_processing_time = max(all_processing_times) if all_processing_times else 0

with open(CSV_FILE, "w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow([
        "Test Condition", "Run", "Processing Time (ms)",
        "Detected Person", "Expected Person", "Confidence", "Result"
    ])
    writer.writerows(csv_rows)

with open(SUMMARY_FILE, "w", encoding="utf-8") as file:
    file.write("AI DETECTION PERFORMANCE EVALUATION\n")
    file.write("====================================\n\n")
    file.write("Model: YOLO11n\n")
    file.write("Confidence Threshold: 0.70\n")
    file.write(f"Runs Per Image: {RUNS_PER_IMAGE}\n\n")
    file.write("CLASSIFICATION RESULTS\n")
    file.write("----------------------\n")
    file.write(f"Total tests: {total_tests}\n")
    file.write(f"True positives: {true_positive}\n")
    file.write(f"True negatives: {true_negative}\n")
    file.write(f"False positives: {false_positive}\n")
    file.write(f"False negatives: {false_negative}\n\n")
    file.write("PERFORMANCE METRICS\n")
    file.write("-------------------\n")
    file.write(f"Detection rate: {detection_rate:.2f}%\n")
    file.write(f"False positive rate: {false_positive_rate:.2f}%\n")
    file.write(f"False negative rate: {false_negative_rate:.2f}%\n")
    file.write(f"Accuracy: {accuracy:.2f}%\n")
    file.write(f"Average confidence: {average_confidence:.4f}\n")
    file.write(f"Average processing time: {average_processing_time:.2f} ms\n")
    file.write(f"Average positive detection time: {average_positive_time:.2f} ms\n")
    file.write(f"Minimum processing time: {minimum_processing_time:.2f} ms\n")
    file.write(f"Maximum processing time: {maximum_processing_time:.2f} ms\n")

print("\n\n========================================")
print("FINAL AI PERFORMANCE RESULTS")
print("========================================")
print(f"Total tests:             {total_tests}")
print(f"True positives:          {true_positive}")
print(f"True negatives:          {true_negative}")
print(f"False positives:         {false_positive}")
print(f"False negatives:         {false_negative}")
print("----------------------------------------")
print(f"Detection rate:          {detection_rate:.2f}%")
print(f"False positive rate:     {false_positive_rate:.2f}%")
print(f"False negative rate:     {false_negative_rate:.2f}%")
print(f"Accuracy:                {accuracy:.2f}%")
print(f"Average confidence:      {average_confidence:.4f}")
print(f"Average processing time: {average_processing_time:.2f} ms")
print(f"Average positive time:   {average_positive_time:.2f} ms")
print(f"Minimum processing time: {minimum_processing_time:.2f} ms")
print(f"Maximum processing time: {maximum_processing_time:.2f} ms")
print("----------------------------------------")
print(f"CSV results saved to:\n{CSV_FILE}")
print(f"Summary saved to:\n{SUMMARY_FILE}")
print("========================================")