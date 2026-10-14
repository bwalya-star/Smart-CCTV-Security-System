import os
import time
from recorder import CameraRecorder


recorder = CameraRecorder()


PROJECT_ROOT = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "../.."
    )
)

STOP_FILE = os.path.join(
    PROJECT_ROOT,
    "hardware",
    "camera",
    "STOP_RECORDING"
)


def start_recording():

    # Remove old stop command
    if os.path.exists(STOP_FILE):
        os.remove(STOP_FILE)

    success = recorder.start_recording()

    if not success:

        print(
            "RECORDING_FAILED",
            flush=True
        )

        return


    print(
        "RECORDING_STARTED",
        flush=True
    )

    print(
        f"RECORDING_FILE:{os.path.basename(recorder.output_path)}",
        flush=True
    )

    try:

        while recorder.recording:

            # Check whether Node.js requested STOP
            if os.path.exists(STOP_FILE):

                print(
                    "STOP command received.",
                    flush=True
                )

                os.remove(STOP_FILE)

                break


            success = recorder.record_frame()

            if not success:
                break


            time.sleep(0.01)


    finally:

        if recorder.recording:

            recorder.stop_recording()


        print(
            "RECORDING_STOPPED",
            flush=True
        )


if __name__ == "__main__":

    start_recording()