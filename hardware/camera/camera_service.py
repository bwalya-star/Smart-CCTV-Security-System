import sys
import time
from recorder import CameraRecorder


recorder = CameraRecorder()


def start_recording():

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


    try:

        while recorder.recording:

            success = recorder.record_frame()

            if not success:
                break

            time.sleep(0.01)


    except KeyboardInterrupt:

        print(
            "Recording interrupted.",
            flush=True
        )


    finally:

        if recorder.recording:

            recorder.stop_recording()

        print(
            "RECORDING_STOPPED",
            flush=True
        )


if __name__ == "__main__":

    start_recording()