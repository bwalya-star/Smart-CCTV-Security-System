from flask import Flask, Response, jsonify
from camera_manager import CameraManager
import cv2


app = Flask(__name__)

camera_manager = CameraManager()


# ---------------------------------
# PREVIEW
# ---------------------------------

def generate_frames():

    while True:

        frame = camera_manager.get_frame()


        if frame is None:
            continue


        success, buffer = cv2.imencode(
            ".jpg",
            frame
        )


        if not success:
            continue


        frame_bytes = buffer.tobytes()


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


# ---------------------------------
# CAMERA STATUS
# ---------------------------------

@app.route("/status")
def status():

    return jsonify({

        "camera": (
            camera_manager.camera
            is not None
        ),

        "recording":
            camera_manager.recording

    })


# ---------------------------------
# CAPTURE IMAGE
# ---------------------------------

@app.route("/capture", methods=["POST"])
def capture():

    image_path = (
        camera_manager.capture_image()
    )


    if image_path is None:

        return jsonify({

            "success": False,

            "error": "Failed to capture image"

        }), 500


    return jsonify({

        "success": True,

        "imagePath": image_path

    })


# ---------------------------------
# START RECORDING
# ---------------------------------

@app.route("/record/start", methods=["POST"])
def start_recording():

    success = (
        camera_manager.start_recording()
    )


    return jsonify({

        "success": success,

        "recording":
            camera_manager.recording

    })


# ---------------------------------
# STOP RECORDING
# ---------------------------------

@app.route("/record/stop", methods=["POST"])
def stop_recording():

    success = (
        camera_manager.stop_recording()
    )


    return jsonify({

        "success": success,

        "recording":
            camera_manager.recording

    })


# ---------------------------------
# MAIN
# ---------------------------------

if __name__ == "__main__":

    print(
        "Starting Smart CCTV Camera Manager..."
    )


    camera_manager.start_camera()


    app.run(
        host="127.0.0.1",
        port=8000,
        threaded=True
    )