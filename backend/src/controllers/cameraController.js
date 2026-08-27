const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

let recording = false;
let cameraProcess = null;


function getCameraStatus(req, res) {

    res.json({
        recording: recording
    });

}


function startRecording(req, res) {

    if (recording) {

        return res.json({

            message: "Camera is already recording",

            recording: true

        });

    }


    const projectRoot = path.join(
        __dirname,
        "../../../"
    );


    const pythonPath = path.join(
        projectRoot,
        "secure",
        "Scripts",
        "python.exe"
    );


    const cameraService = path.join(
        projectRoot,
        "hardware",
        "camera",
        "camera_service.py"
    );


    console.log(
        "Starting Python camera service..."
    );

    const fs = require("fs");

    const stopFile = path.join(
        projectRoot,
        "hardware",
        "camera",
        "STOP_RECORDING"
    );

        if (fs.existsSync(stopFile)) {
            fs.unlinkSync(stopFile);
        }


    cameraProcess = spawn(
        pythonPath,
        [cameraService],
        {
            cwd: path.dirname(cameraService),
            stdio: ["pipe", "pipe", "pipe"]
        }
    );


    cameraProcess.stdout.on(
        "data",
        (data) => {

            console.log(
                `Camera: ${data.toString().trim()}`
            );

        }
    );


    cameraProcess.stderr.on(
        "data",
        (data) => {

            console.error(
                `Camera Error: ${data.toString().trim()}`
            );

        }
    );


    cameraProcess.on(
        "close",
        (code) => {

            console.log(
                `Camera process exited with code ${code}`
            );

            recording = false;
            cameraProcess = null;

        }
    );


    recording = true;


    res.json({

        message: "Recording started",

        recording: true

    });

}


function stopRecording(req, res) {

    if (!recording || !cameraProcess) {

        return res.json({

            message: "Camera is not recording",

            recording: false

        });

    }


    console.log(
        "Stopping Python camera service..."
    );


    const projectRoot = path.join(
        __dirname,
        "../../../"
    );


    const stopFile = path.join(
        projectRoot,
        "hardware",
        "camera",
        "STOP_RECORDING"
    );


    try {

        // Tell Python to stop recording
        fs.writeFileSync(
            stopFile,
            "STOP"
        );


        console.log(
            "Stop command sent to Python."
        );


        // Do NOT kill Python immediately.
        // Give it time to release OpenCV.
        const processToWaitFor = cameraProcess;


        const timeout = setTimeout(() => {

            if (
                cameraProcess === processToWaitFor
            ) {

                console.log(
                    "Python camera service did not stop within the expected time."
                );

                cameraProcess.kill();

                cameraProcess = null;

                recording = false;

            }

        }, 5000);


        processToWaitFor.once(
            "close",
            () => {

                clearTimeout(timeout);

                console.log(
                    "Python camera service stopped cleanly."
                );

                cameraProcess = null;

                recording = false;

            }
        );


        res.json({

            message: "Recording stopped",

            recording: false

        });


    } catch (error) {

        console.error(
            "Error stopping camera:",
            error
        );


        res.status(500).json({

            error: "Failed to stop recording"

        });

    }

}


module.exports = {

    getCameraStatus,

    startRecording,

    stopRecording

};