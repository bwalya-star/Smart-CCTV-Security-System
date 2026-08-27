import os
import cv2


class FaceRecognition:

    def __init__(self, known_faces_directory):

        self.known_faces_directory = (
            known_faces_directory
        )

        self.recognizer = (
            cv2.face.LBPHFaceRecognizer_create()
        )

        self.face_detector = (
            cv2.CascadeClassifier(
                cv2.data.haarcascades
                + "haarcascade_frontalface_default.xml"
            )
        )

        self.label_to_name = {}

        self.is_trained = False

        print("Initializing face recognition...")

        self.prepare_training_data()


    def prepare_training_data(self):

        faces = []
        labels = []

        label_id = 0


        if not os.path.exists(
            self.known_faces_directory
        ):

            print(
                "Known faces directory not found:"
            )

            print(
                self.known_faces_directory
            )

            return


        for filename in os.listdir(
            self.known_faces_directory
        ):

            if not filename.lower().endswith(
                (".jpg", ".jpeg", ".png")
            ):

                continue


            image_path = os.path.join(
                self.known_faces_directory,
                filename
            )


            image = cv2.imread(
                image_path
            )


            if image is None:

                print(
                    f"Could not read {filename}"
                )

                continue


            gray = cv2.cvtColor(
                image,
                cv2.COLOR_BGR2GRAY
            )


            detected_faces = (
                self.face_detector.detectMultiScale(
                    gray,
                    scaleFactor=1.1,
                    minNeighbors=5,
                    minSize=(30, 30)
                )
            )


            if len(detected_faces) == 0:

                print(
                    f"No face found in {filename}"
                )

                continue


            name = os.path.splitext(
                filename
            )[0]


            self.label_to_name[
                label_id
            ] = name


            for (
                x,
                y,
                width,
                height
            ) in detected_faces:

                face = gray[
                    y:y + height,
                    x:x + width
                ]

                faces.append(face)

                labels.append(label_id)


            print(
                f"Loaded face: {name}"
            )


            label_id += 1


        if not faces:

            print(
                "No training faces found."
            )

            return


        print(
            f"Training LBPH model with "
            f"{len(faces)} face sample(s)..."
        )


        self.recognizer.train(
            faces,
            __import__("numpy").array(labels)
        )


        self.is_trained = True


        print(
            "Face recognition model trained successfully."
        )


    def recognize(self, image_path):

        if not self.is_trained:

            return []


        image = cv2.imread(
            image_path
        )


        if image is None:

            raise ValueError(
                f"Could not read image: {image_path}"
            )


        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY
        )


        detected_faces = (
            self.face_detector.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )
        )


        results = []


        for (
            x,
            y,
            width,
            height
        ) in detected_faces:


            face = gray[
                y:y + height,
                x:x + width
            ]


            label_id, confidence = (
                self.recognizer.predict(face)
            )


            name = self.label_to_name.get(
                label_id,
                "unknown"
            )


            # LBPH confidence is a distance:
            # lower = better match.
            if confidence <= 70:

                known = True

            else:

                name = "unknown"

                known = False


            results.append({

                "name": name,

                "known": known,

                "confidence":
                    round(
                        float(confidence),
                        2
                    )

            })


        return results