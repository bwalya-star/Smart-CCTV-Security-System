import os
import time

from ultralytics import YOLO


class DetectionModel:

    def __init__(self):

        print("Loading YOLO detection model...")

        self.model = YOLO("yolo11n.pt")

        self.confidence_threshold = float(
            os.getenv(
                "YOLO_CONFIDENCE",
                "0.70"
            )
        )

        print(
            "YOLO model loaded successfully."
        )

        print(
            f"Confidence threshold: "
            f"{self.confidence_threshold:.2f}"
        )

    def detect(self, image_path):

        start_time = time.perf_counter()

        results = self.model(
            image_path,
            conf=self.confidence_threshold,
            verbose=False
        )

        detections = []

        for result in results:

            boxes = result.boxes

            for box in boxes:

                class_id = int(
                    box.cls[0]
                )

                confidence = float(
                    box.conf[0]
                )

                label = result.names[
                    class_id
                ]

                detections.append({

                    "label": label,

                    "confidence":
                        confidence,

                    "class_id":
                        class_id
                })

        processing_time = (
            time.perf_counter()
            - start_time
        )

        processing_time_ms = (
            processing_time * 1000
        )

        print(
            f"YOLO processing time: "
            f"{processing_time_ms:.2f} ms"
        )

        print(
            f"Total detections: "
            f"{len(detections)}"
        )

        return {
            "detections": detections,
            "processing_time_ms":
                round(
                    processing_time_ms,
                    2
                )
        }