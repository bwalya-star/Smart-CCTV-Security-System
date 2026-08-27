import cv2
import os
import threading
import time
from datetime import datetime


class CameraManager:

    def __init__(self):

        self.camera = None

        self.recording = False
        self.video_writer = None

        self.lock = threading.Lock()

        self.upload_dir = os.path.abspath(
            os.path.join(
                os.path.dirname(__file__),
                "../../uploads"
            )
        )

        self.recording_dir = os.path.join(
            self.upload_dir,
            "recordings"
        )

        os.makedirs(
            self.upload_dir,
            exist_ok=True
        )

        os.makedirs(
            self.recording_dir,
            exist_ok=True
        )


    # ---------------------------------
    # CAMERA
    # ---------------------------------

    def start_camera(self):

        if self.camera is not None:
            return True


        print(
            "Camera Manager: Opening camera..."
        )


        self.camera = cv2.VideoCapture(0)


        if not self.camera.isOpened():

            print(
                "Camera Manager: Cannot access camera."
            )

            self.camera = None

            return False


        # Optional resolution
        self.camera.set(
            cv2.CAP_PROP_FRAME_WIDTH,
            640
        )

        self.camera.set(
            cv2.CAP_PROP_FRAME_HEIGHT,
            480
        )


        print(
            "Camera Manager: Camera opened successfully."
        )

        return True


    # ---------------------------------
    # GET FRAME
    # ---------------------------------

    def get_frame(self):

        with self.lock:

            if self.camera is None:

                if not self.start_camera():
                    return None


            success, frame = self.camera.read()


            if not success:

                print(
                    "Camera Manager: Failed to read frame."
                )

                return None


            # Write frame if recording
            if self.recording:

                if self.video_writer is not None:

                    self.video_writer.write(frame)


            return frame


    # ---------------------------------
    # CAPTURE IMAGE
    # ---------------------------------

    def capture_image(self):

        frame = self.get_frame()


        if frame is None:

            return None


        filename = (
            f"capture_"
            f"{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            f".jpg"
        )


        filepath = os.path.join(
            self.upload_dir,
            filename
        )


        success = cv2.imwrite(
            filepath,
            frame
        )


        if not success:

            print(
                "Camera Manager: Failed to save image."
            )

            return None


        # Physical path used to save the image
        print(
            f"Camera Manager: Image saved: {filepath}"
        )


        # Web path used by the backend/frontend
        web_path = f"/uploads/{filename}"

        print(
            f"Camera Manager: Web path: {web_path}"
        )


        return web_path

    # ---------------------------------
    # START RECORDING
    # ---------------------------------

    def start_recording(self):

        if self.recording:

            print(
                "Camera Manager: Already recording."
            )

            return False


        if self.camera is None:

            if not self.start_camera():

                return False


        filename = (
            f"recording_"
            f"{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            f".avi"
        )


        filepath = os.path.join(
            self.recording_dir,
            filename
        )


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


        fourcc = cv2.VideoWriter_fourcc(
            *"XVID"
        )


        self.video_writer = cv2.VideoWriter(
            filepath,
            fourcc,
            20.0,
            (width, height)
        )


        if not self.video_writer.isOpened():

            print(
                "Camera Manager: Failed to create video."
            )

            self.video_writer = None

            return False


        self.recording = True


        print(
            f"Camera Manager: Recording started: {filepath}"
        )


        return True


    # ---------------------------------
    # STOP RECORDING
    # ---------------------------------

    def stop_recording(self):

        if not self.recording:

            return False


        self.recording = False


        if self.video_writer is not None:

            self.video_writer.release()

            self.video_writer = None


        print(
            "Camera Manager: Recording stopped."
        )


        return True


    # ---------------------------------
    # CLOSE CAMERA
    # ---------------------------------

    def close_camera(self):

        if self.recording:

            self.stop_recording()


        if self.camera is not None:

            self.camera.release()

            self.camera = None


        print(
            "Camera Manager: Camera closed."
        )