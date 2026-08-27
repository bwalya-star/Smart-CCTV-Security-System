from ultralytics import YOLO


class DetectionModel:

    CONFIDENCE_THRESHOLD = 0.50

    def __init__(self):

        print(
            "Loading YOLO detection model..."
        )

        self.model = YOLO(
            "yolo11n.pt"
        )

        print(
            "YOLO model loaded successfully."
        )


    def detect(self, image_path):

        results = self.model(
            image_path,
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

                # Ignore weak detections
                if confidence < self.CONFIDENCE_THRESHOLD:
                    continue


                label = result.names[
                    class_id
                ]


                detections.append({

                    "label": label,

                    "confidence":
                        round(
                            confidence,
                            4
                        ),

                    "class_id":
                        class_id

                })


        return detections