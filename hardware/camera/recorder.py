import cv2
import os
import time
from datetime import datetime


class CameraRecorder:

    def __init__(self):

        self.recording = False
        self.camera = None
        self.video_writer = None
        self.output_path = None


    def start_recording(self):

        if self.recording:
            print("Camera is already recording.")
            return False


        print("Starting camera recording...")


        # Open camera
        self.camera = cv2.VideoCapture(0)


        if not self.camera.isOpened():

            print("Could not open camera.")

            self.camera = None

            return False


        # Camera settings
        width = int(
            self.camera.get(
                cv2.CAP_PROP_FRAME_WIDTH
            )
        )

        height = int(
            self.camera.get(
                cv2.CAP_PROP_FRAME_HEIGHT
            )
        )

        fps = 20.0


        # Create recordings directory
        project_root = os.path.abspath(
            os.path.join(
                os.path.dirname(__file__),
                "../.."
            )
        )

        recordings_dir = os.path.join(
            project_root,
            "uploads",
            "recordings"
        )

        os.makedirs(
            recordings_dir,
            exist_ok=True
        )


        # Generate filename
        timestamp = datetime.now().strftime(
            "%Y%m%d_%H%M%S"
        )

        self.output_path = os.path.join(
            recordings_dir,
            f"recording_{timestamp}.webm"
        )

        self.video_writer = cv2.VideoWriter(
            self.output_path,
            cv2.VideoWriter_fourcc(*"VP90"),
            fps,
            (width, height)
        )

        if not self.video_writer.isOpened():
            # Fall back to a widely supported container/codec when WebM is unavailable.
            self.video_writer.release()
            self.output_path = os.path.join(
                recordings_dir,
                f"recording_{timestamp}.avi"
            )
            self.video_writer = cv2.VideoWriter(
                self.output_path,
                cv2.VideoWriter_fourcc(*"XVID"),
                fps,
                (width, height)
            )


        if not self.video_writer.isOpened():

            print(
                "Could not create video file."
            )

            self.camera.release()

            self.camera = None

            return False


        self.recording = True


        print(
            f"Recording started: "
            f"{self.output_path}"
        )

        return True


    def record_frame(self):

        if not self.recording:
            return False


        ret, frame = self.camera.read()


        if not ret:

            print(
                "Failed to read camera frame."
            )

            return False


        self.video_writer.write(frame)

        return True


    def stop_recording(self):

        if not self.recording:

            print(
                "Camera is not recording."
            )

            return False


        print(
            "Stopping camera recording..."
        )


        self.recording = False


        if self.video_writer:

            self.video_writer.release()

            self.video_writer = None


        if self.camera:

            self.camera.release()

            self.camera = None


        print(
            f"Recording saved: "
            f"{self.output_path}"
        )


        return True