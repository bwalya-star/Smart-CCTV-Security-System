import cv2
from flask import Flask, Response


app = Flask(__name__)


camera = cv2.VideoCapture(0)


if not camera.isOpened():

    print("ERROR: Could not open camera.")


def generate_frames():

    while True:

        success, frame = camera.read()

        if not success:

            print(
                "Failed to read camera frame."
            )

            break


        # Convert frame to JPEG
        success, buffer = cv2.imencode(
            ".jpg",
            frame
        )


        if not success:

            continue


        frame_bytes = buffer.tobytes()


        # MJPEG stream
        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n"
            + frame_bytes
            + b"\r\n"
        )


@app.route("/video")
def video():

    return Response(
        generate_frames(),
        mimetype=(
            "multipart/x-mixed-replace; "
            "boundary=frame"
        )
    )


@app.route("/")
def index():

    return "Camera preview service is running."


if __name__ == "__main__":

    print(
        "Starting camera preview service..."
    )

    app.run(
        host="127.0.0.1",
        port=8000,
        threaded=True
    )